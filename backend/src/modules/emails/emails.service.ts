import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor(private configService: ConfigService) {
    // Initialize Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // Set templates path
    this.templatesPath = path.join(__dirname, 'templates');

    // Register Handlebars helpers for formatting
    this.registerHandlebarsHelpers();
  }

  /**
   * Register Handlebars helpers for consistent formatting
   */
  private registerHandlebarsHelpers(): void {
    // Currency formatter
    handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    });

    // Date formatter
    handlebars.registerHelper('formatDate', (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    });

    // Number formatter
    handlebars.registerHelper('formatNumber', (value: number, decimals?: number) => {
      return new Intl.NumberFormat('ar-EG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    });

    // Conditional helper (if equals)
    handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Current year helper
    handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });
  }

  /**
   * Compile Handlebars template with data
   */
  private compileTemplate(templateName: string, data: any): string {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  /**
   * Send email using compiled template
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const from = this.configService.get<string>('EMAIL_FROM');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[EmailService] Email sent to: ${to} - Subject: ${subject}`);
    } catch (error) {
      console.error(`[EmailService] Failed to send email to: ${to}`, error);
      throw error;
    }
  }

  /**
   * AUTH EMAILS
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const platformUrl = this.configService.get<string>('PLATFORM_BASE_URL');
    const verificationLink = `${platformUrl}/auth/verify?token=${token}`;

    const html = this.compileTemplate('verification', {
      verificationLink,
      email,
    });

    await this.sendEmail(email, 'تأكيد بريدك الإلكتروني', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const platformUrl = this.configService.get<string>('PLATFORM_BASE_URL');
    const resetLink = `${platformUrl}/auth/reset-password?token=${token}`;

    const html = this.compileTemplate('password-reset', {
      resetLink,
      email,
    });

    await this.sendEmail(email, 'إعادة تعيين كلمة المرور', html);
  }

  /**
   * PAYMENT EMAILS
   */
  async sendPurchaseReceipt(
    email: string,
    data: {
      studentName: string;
      courseTitle: string;
      amount: number;
      transactionId: string;
      purchaseDate: Date;
    },
  ): Promise<void> {
    const html = this.compileTemplate('purchase-receipt', {
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      amount: data.amount.toFixed(2),
      transactionId: data.transactionId,
      purchaseDate: new Date(data.purchaseDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    await this.sendEmail(
      email,
      `إيصال شراء - ${data.courseTitle}`,
      html,
    );
  }

  async sendPaymentFailure(
    email: string,
    data: {
      studentName: string;
      courseTitle: string;
      reason: string;
    },
  ): Promise<void> {
    const html = this.compileTemplate('payment-failure', {
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      reason: data.reason,
    });

    await this.sendEmail(
      email,
      'فشل عملية الدفع',
      html,
    );
  }

  /**
   * PAYOUT EMAILS
   */
  async sendPayoutRequestReceived(
    email: string,
    data: {
      instructorName: string;
      amount: number;
      requestDate: Date;
    },
  ): Promise<void> {
    const html = this.compileTemplate('payout-request-received', {
      instructorName: data.instructorName,
      amount: data.amount.toFixed(2),
      requestDate: new Date(data.requestDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    await this.sendEmail(
      email,
      'تم استلام طلب السحب',
      html,
    );
  }

  async sendPayoutApproved(
    email: string,
    data: {
      instructorName: string;
      amount: number;
      approvalDate: Date;
    },
  ): Promise<void> {
    const html = this.compileTemplate('payout-approved', {
      instructorName: data.instructorName,
      amount: data.amount.toFixed(2),
      approvalDate: new Date(data.approvalDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    await this.sendEmail(
      email,
      'تمت الموافقة على طلب السحب',
      html,
    );
  }

  async sendPayoutRejected(
    email: string,
    data: {
      instructorName: string;
      amount: number;
      reason: string;
      rejectionDate: Date;
    },
  ): Promise<void> {
    const html = this.compileTemplate('payout-rejected', {
      instructorName: data.instructorName,
      amount: data.amount.toFixed(2),
      reason: data.reason,
      rejectionDate: new Date(data.rejectionDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    await this.sendEmail(
      email,
      'تم رفض طلب السحب',
      html,
    );
  }

  async sendPayoutCompleted(
    email: string,
    data: {
      instructorName: string;
      amount: number;
      transactionReference: string;
      completionDate: Date;
    },
  ): Promise<void> {
    const html = this.compileTemplate('payout-completed', {
      instructorName: data.instructorName,
      amount: data.amount.toFixed(2),
      transactionReference: data.transactionReference,
      completionDate: new Date(data.completionDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });

    await this.sendEmail(
      email,
      'تم تحويل المبلغ بنجاح',
      html,
    );
  }

  /**
   * STUDENT EMAILS
   */
  async sendWelcomeEmail(
    email: string,
    data: {
      studentName: string;
      tenantName?: string;
    },
  ): Promise<void> {
    const platformUrl = this.configService.get<string>('PLATFORM_BASE_URL');

    const html = this.compileTemplate('welcome', {
      studentName: data.studentName,
      tenantName: data.tenantName || 'منصة الأكاديمية',
      platformUrl,
    });

    await this.sendEmail(
      email,
      `مرحباً بك في ${data.tenantName || 'منصة الأكاديمية'}`,
      html,
    );
  }

  async sendEnrollmentConfirmation(
    email: string,
    data: {
      studentName: string;
      courseTitle: string;
      instructorName: string;
      courseUrl: string;
    },
  ): Promise<void> {
    const html = this.compileTemplate('enrollment-confirmation', {
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      instructorName: data.instructorName,
      courseUrl: data.courseUrl,
    });

    await this.sendEmail(
      email,
      `تأكيد التسجيل - ${data.courseTitle}`,
      html,
    );
  }
}
