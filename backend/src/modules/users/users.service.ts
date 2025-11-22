import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('المستخدم موجود بالفعل');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(filter: any = {}): Promise<UserDocument[]> {
    return this.userModel.find(filter).select('-password').exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByTenantId(tenantId: string | Types.ObjectId): Promise<UserDocument[]> {
    return this.userModel.find({ tenantId }).select('-password').exec();
  }

  async update(id: string | Types.ObjectId, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }

  async updatePassword(id: string | Types.ObjectId, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('المستخدم غير موجود');
    }
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(id: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async setEmailVerificationToken(id: string | Types.ObjectId, token: string): Promise<void> {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    await this.userModel
      .findByIdAndUpdate(id, {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      })
      .exec();
  }

  async verifyEmail(token: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new NotFoundException('رمز التحقق غير صحيح أو منتهي الصلاحية');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    return user.save();
  }

  async setPasswordResetToken(email: string, token: string): Promise<void> {
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    await this.userModel
      .findOneAndUpdate(
        { email },
        {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
      )
      .exec();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new NotFoundException('رمز إعادة التعيين غير صحيح أو منتهي الصلاحية');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();
  }
}
