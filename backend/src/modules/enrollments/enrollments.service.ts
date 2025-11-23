import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument, EnrollmentStatus } from './schemas/enrollment.schema';
import { Course, CourseDocument, CourseStatus } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailsService } from '../emails/emails.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailsService: EmailsService,
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService,
  ) {}

  /**
   * Enroll a student in a course
   */
  async enroll(
    createEnrollmentDto: CreateEnrollmentDto,
    studentId: string,
    tenantId: string,
  ): Promise<Enrollment> {
    const { courseId, pricePaid, paymentId } = createEnrollmentDto;

    // Check if course exists and is published
    const course = await this.courseModel
      .findOne({
        _id: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
        status: CourseStatus.PUBLISHED,
      })
      .exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة أو غير متاحة للتسجيل');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      })
      .exec();

    if (existingEnrollment) {
      throw new ConflictException('أنت مسجل بالفعل في هذه الدورة');
    }

    // Validate payment for paid courses
    if (!course.isFree) {
      if (!pricePaid || pricePaid < course.price) {
        throw new BadRequestException('المبلغ المدفوع غير كافٍ');
      }
      if (!paymentId) {
        throw new BadRequestException('معرف الدفع مطلوب للدورات المدفوعة');
      }
    }

    // Create enrollment
    const enrollment = new this.enrollmentModel({
      tenantId: new Types.ObjectId(tenantId),
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
      status: EnrollmentStatus.ACTIVE,
      pricePaid: pricePaid || 0,
      paymentId: paymentId || null,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    });

    const savedEnrollment = await enrollment.save();

    // Update course enrollment count
    await this.courseModel
      .updateOne(
        { _id: course._id },
        {
          $inc: { enrollmentCount: 1, totalRevenue: pricePaid || 0 },
        },
      )
      .exec();

    // Send enrollment confirmation email
    try {
      const student = await this.userModel.findById(studentId).exec();
      const courseWithInstructor = await this.courseModel
        .findById(courseId)
        .populate('instructorId', 'fullName')
        .exec();

      if (student && courseWithInstructor) {
        const academyBaseUrl = this.configService.get<string>('ACADEMY_BASE_URL');
        const courseUrl = `${academyBaseUrl}/courses/${courseWithInstructor.slug}`;

        await this.emailsService.sendEnrollmentConfirmation(student.email, {
          studentName: student.fullName,
          courseTitle: courseWithInstructor.title,
          instructorName: (courseWithInstructor.instructorId as any).fullName,
          courseUrl,
        });

        // Send welcome email if this is the student's first enrollment
        const previousEnrollments = await this.enrollmentModel
          .countDocuments({
            studentId: new Types.ObjectId(studentId),
            _id: { $ne: savedEnrollment._id },
          })
          .exec();

        if (previousEnrollments === 0) {
          await this.emailsService.sendWelcomeEmail(student.email, {
            studentName: student.fullName,
            tenantName: undefined, // Will use default in email template
          });
        }
      }
    } catch (error) {
      console.error('[EnrollmentsService] Failed to send enrollment email:', error);
    }

    return savedEnrollment;
  }

  /**
   * Get all enrollments for a student
   */
  async getStudentEnrollments(
    studentId: string,
    tenantId: string,
    status?: EnrollmentStatus,
  ): Promise<Enrollment[]> {
    const query: any = {
      studentId: new Types.ObjectId(studentId),
      tenantId: new Types.ObjectId(tenantId),
    };

    if (status) {
      query.status = status;
    }

    return this.enrollmentModel
      .find(query)
      .populate('courseId', 'title slug description thumbnail level averageRating totalRatings')
      .sort({ enrolledAt: -1 })
      .exec();
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollment(enrollmentId: string, studentId: string, tenantId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findOne({
        _id: new Types.ObjectId(enrollmentId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('courseId')
      .exec();

    if (!enrollment) {
      throw new NotFoundException('التسجيل غير موجود');
    }

    return enrollment;
  }

  /**
   * Get enrollment by course ID
   */
  async getEnrollmentByCourse(
    courseId: string,
    studentId: string,
    tenantId: string,
  ): Promise<Enrollment | null> {
    return this.enrollmentModel
      .findOne({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('courseId')
      .exec();
  }

  /**
   * Check if student has access to a course (either enrolled or has active subscription)
   */
  async isEnrolled(courseId: string, studentId: string, tenantId?: string): Promise<boolean> {
    // Check direct enrollment
    const enrollment = await this.enrollmentModel
      .findOne({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        status: EnrollmentStatus.ACTIVE,
      })
      .exec();

    if (enrollment) {
      return true;
    }

    // If tenantId is provided, check for active subscription
    if (tenantId) {
      const hasActiveSubscription = await this.subscriptionsService.hasActiveSubscription(
        studentId,
        tenantId,
      );

      if (hasActiveSubscription) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if student has access to a course (alias for isEnrolled with tenantId)
   */
  async hasAccessToCourse(courseId: string, studentId: string, tenantId: string): Promise<boolean> {
    return this.isEnrolled(courseId, studentId, tenantId);
  }

  /**
   * Update enrollment progress
   */
  async updateProgress(
    enrollmentId: string,
    progressPercentage: number,
    studentId: string,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findOne({
        _id: new Types.ObjectId(enrollmentId),
        studentId: new Types.ObjectId(studentId),
      })
      .exec();

    if (!enrollment) {
      throw new NotFoundException('التسجيل غير موجود');
    }

    const updateData: any = {
      progressPercentage,
      lastAccessedAt: new Date(),
    };

    // Mark as completed if progress is 100%
    if (progressPercentage >= 100 && !enrollment.completedAt) {
      updateData.status = EnrollmentStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    return this.enrollmentModel
      .findByIdAndUpdate(
        (enrollment as any)._id,
        { $set: updateData },
        { new: true },
      )
      .exec() as Promise<Enrollment>;
  }

  /**
   * Update last accessed time
   */
  async updateLastAccessed(enrollmentId: string, studentId: string): Promise<void> {
    await this.enrollmentModel
      .updateOne(
        {
          _id: new Types.ObjectId(enrollmentId),
          studentId: new Types.ObjectId(studentId),
        },
        {
          $set: { lastAccessedAt: new Date() },
        },
      )
      .exec();
  }

  /**
   * Add time spent to enrollment
   */
  async addTimeSpent(enrollmentId: string, studentId: string, seconds: number): Promise<void> {
    await this.enrollmentModel
      .updateOne(
        {
          _id: new Types.ObjectId(enrollmentId),
          studentId: new Types.ObjectId(studentId),
        },
        {
          $inc: { totalTimeSpent: seconds },
        },
      )
      .exec();
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(enrollmentId: string, studentId: string, tenantId: string): Promise<{ message: string }> {
    const enrollment = await this.getEnrollment(enrollmentId, studentId, tenantId);

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('التسجيل ملغي بالفعل');
    }

    await this.enrollmentModel
      .updateOne(
        { _id: (enrollment as any)._id },
        { $set: { status: EnrollmentStatus.CANCELLED } },
      )
      .exec();

    // Decrement course enrollment count
    await this.courseModel
      .updateOne(
        { _id: enrollment.courseId },
        { $inc: { enrollmentCount: -1 } },
      )
      .exec();

    return { message: 'تم إلغاء التسجيل بنجاح' };
  }

  /**
   * Get enrollment statistics for a course (instructor view)
   */
  async getCourseEnrollmentStats(courseId: string, tenantId: string): Promise<any> {
    const enrollments = await this.enrollmentModel
      .find({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE).length,
      completedEnrollments: enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length,
      averageProgress: enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
        : 0,
      totalRevenue: enrollments.reduce((sum, e) => sum + e.pricePaid, 0),
    };

    return stats;
  }
}
