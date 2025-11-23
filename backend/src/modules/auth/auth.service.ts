import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
import { EmailsService } from '../emails/emails.service';
import { UserRole } from '../users/schemas/user.schema';
import { SignupDto, StudentSignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private customFieldsService: CustomFieldsService,
    private jwtService: JwtService,
    private emailsService: EmailsService,
  ) {}

  async signup(signupDto: SignupDto) {
    // Check if slug is available
    const existingTenant = await this.tenantsService.findBySlug(signupDto.academySlug);
    if (existingTenant) {
      throw new ConflictException('رابط الأكاديمية محجوز بالفعل');
    }

    // Create user
    const user = await this.usersService.create({
      email: signupDto.email,
      password: signupDto.password,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      role: UserRole.INSTRUCTOR,
    });

    // Create tenant
    const tenant = await this.tenantsService.create({
      name: signupDto.academyName,
      slug: signupDto.academySlug.toLowerCase(),
      ownerId: user._id.toString(),
    });

    // Update user with tenantId
    await this.usersService.update(user._id, { tenantId: tenant._id.toString() } as any);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.setEmailVerificationToken(user._id, verificationToken);

    // Send verification email
    try {
      await this.emailsService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('[AuthService] Failed to send verification email:', error);
    }

    // Generate JWT
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant._id.toString(),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenant._id,
        isEmailVerified: user.isEmailVerified,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
      },
      verificationToken, // For development only
    };
  }

  async studentSignup(studentSignupDto: StudentSignupDto, tenantId: string) {
    // Validate custom field values
    if (studentSignupDto.customFieldValues) {
      const validation = await this.customFieldsService.validateCustomFieldValues(
        studentSignupDto.customFieldValues,
        tenantId,
      );

      if (!validation.isValid) {
        throw new ConflictException(validation.errors.join(', '));
      }
    }

    // Create student user
    const user = await this.usersService.create({
      email: studentSignupDto.email,
      password: studentSignupDto.password,
      firstName: studentSignupDto.firstName,
      lastName: studentSignupDto.lastName,
      role: UserRole.STUDENT,
      tenantId,
    } as any);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.setEmailVerificationToken(user._id, verificationToken);

    // Send verification email
    try {
      await this.emailsService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('[AuthService] Failed to send verification email:', error);
    }

    // Generate JWT
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        isEmailVerified: user.isEmailVerified,
      },
      verificationToken, // For development only
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const isPasswordValid = await this.usersService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('الحساب غير نشط');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id);

    // Generate JWT
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString() || null,
    };

    // Get tenant if instructor
    let tenant = null;
    if (user.role === UserRole.INSTRUCTOR && user.tenantId) {
      tenant = await this.tenantsService.findById(user.tenantId);
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        isEmailVerified: user.isEmailVerified,
      },
      tenant: tenant ? {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
      } : null,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);

    return {
      message: 'تم تأكيد البريد الإلكتروني بنجاح',
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if user exists
      return { message: 'إذا كان البريد موجوداً، سيتم إرسال رسالة إعادة التعيين' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.setPasswordResetToken(user.email, resetToken);

    // Send password reset email
    try {
      await this.emailsService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('[AuthService] Failed to send password reset email:', error);
    }

    return {
      message: 'تم إرسال رسالة إعادة التعيين إلى بريدك الإلكتروني',
      resetToken, // For development only
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);

    return {
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    let tenant = null;
    if (user.role === UserRole.INSTRUCTOR && user.tenantId) {
      tenant = await this.tenantsService.findById(user.tenantId);
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        isEmailVerified: user.isEmailVerified,
      },
      tenant: tenant ? {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
      } : null,
    };
  }
}
