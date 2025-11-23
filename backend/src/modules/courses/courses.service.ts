import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';
import { CreateCourseDto, UpdateCourseDto, PublishCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Create a new course
   */
  async create(createCourseDto: CreateCourseDto, instructorId: string, tenantId: string): Promise<Course> {
    const slug = await this.generateUniqueSlug(createCourseDto.title, tenantId);

    const course = new this.courseModel({
      ...createCourseDto,
      slug,
      instructorId: new Types.ObjectId(instructorId),
      tenantId: new Types.ObjectId(tenantId),
      status: CourseStatus.DRAFT,
      enrollmentCount: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalRatings: 0,
      isActive: true,
    });

    return course.save();
  }

  /**
   * Find all courses for a tenant with filtering and pagination
   */
  async findAll(
    tenantId: string,
    instructorId?: string,
    page: number = 1,
    limit: number = 10,
    status?: CourseStatus,
    search?: string,
  ): Promise<{ courses: Course[]; total: number; page: number; totalPages: number }> {
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (instructorId) {
      query.instructorId = new Types.ObjectId(instructorId);
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      this.courseModel
        .find(query)
        .populate('instructorId', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.courseModel.countDocuments(query).exec(),
    ]);

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single course by ID
   */
  async findOne(courseId: string, tenantId: string): Promise<Course> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }

    const course = await this.courseModel
      .findOne({
        _id: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('instructorId', 'fullName email profilePicture')
      .exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    return course;
  }

  /**
   * Find course by slug (for public access)
   */
  async findBySlug(slug: string, tenantId: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({
        slug,
        tenantId: new Types.ObjectId(tenantId),
        status: CourseStatus.PUBLISHED,
      })
      .populate('instructorId', 'fullName email profilePicture')
      .exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    return course;
  }

  /**
   * Update a course
   */
  async update(
    courseId: string,
    updateCourseDto: UpdateCourseDto,
    instructorId: string,
    tenantId: string,
  ): Promise<Course> {
    const course = await this.findOne(courseId, tenantId);

    // Verify ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل هذه الدورة');
    }

    // If title is being updated, regenerate slug
    let updateData: any = { ...updateCourseDto };
    if (updateCourseDto.title && updateCourseDto.title !== course.title) {
      const newSlug = await this.generateUniqueSlug(updateCourseDto.title, tenantId);
      updateData.slug = newSlug;
    }

    return this.courseModel
      .findByIdAndUpdate(
        (course as any)._id,
        { $set: updateData },
        { new: true },
      )
      .exec() as Promise<Course>;
  }

  /**
   * Publish or unpublish a course
   */
  async publish(
    courseId: string,
    publishCourseDto: PublishCourseDto,
    instructorId: string,
    tenantId: string,
  ): Promise<Course> {
    const course = await this.findOne(courseId, tenantId);

    // Verify ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('ليس لديك صلاحية لنشر هذه الدورة');
    }

    // Validate course has required content before publishing
    if (publishCourseDto.status === CourseStatus.PUBLISHED) {
      if (!course.thumbnail) {
        throw new BadRequestException('يجب إضافة صورة للدورة قبل النشر');
      }
      // Additional validation can be added here (e.g., must have at least one lesson)
    }

    return this.courseModel
      .findByIdAndUpdate(
        (course as any)._id,
        { $set: { status: publishCourseDto.status } },
        { new: true },
      )
      .exec() as Promise<Course>;
  }

  /**
   * Delete a course (soft delete by archiving)
   */
  async delete(courseId: string, instructorId: string, tenantId: string): Promise<{ message: string }> {
    const course = await this.findOne(courseId, tenantId);

    // Verify ownership
    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('ليس لديك صلاحية لحذف هذه الدورة');
    }

    // Check if course has enrollments
    if (course.enrollmentCount > 0) {
      // Archive instead of delete
      await this.courseModel
        .updateOne(
          { _id: (course as any)._id },
          { $set: { status: CourseStatus.ARCHIVED, isActive: false } },
        )
        .exec();
      return { message: 'تم أرشفة الدورة بنجاح (لا يمكن حذف دورة بها طلاب مسجلين)' };
    }

    // If no enrollments, hard delete
    await this.courseModel.deleteOne({ _id: (course as any)._id }).exec();
    return { message: 'تم حذف الدورة بنجاح' };
  }

  /**
   * Get course statistics for instructor
   */
  async getStats(instructorId: string, tenantId: string): Promise<any> {
    const courses = await this.courseModel
      .find({
        instructorId: new Types.ObjectId(instructorId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    const stats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === CourseStatus.PUBLISHED).length,
      draftCourses: courses.filter((c) => c.status === CourseStatus.DRAFT).length,
      totalEnrollments: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
      totalRevenue: courses.reduce((sum, c) => sum + c.totalRevenue, 0),
      averageRating: courses.length > 0
        ? courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length
        : 0,
    };

    return stats;
  }

  /**
   * Increment enrollment count
   */
  async incrementEnrollment(courseId: string): Promise<void> {
    await this.courseModel
      .updateOne(
        { _id: new Types.ObjectId(courseId) },
        { $inc: { enrollmentCount: 1 } },
      )
      .exec();
  }

  /**
   * Update course revenue
   */
  async updateRevenue(courseId: string, amount: number): Promise<void> {
    await this.courseModel
      .updateOne(
        { _id: new Types.ObjectId(courseId) },
        { $inc: { totalRevenue: amount } },
      )
      .exec();
  }

  /**
   * Update course rating
   */
  async updateRating(courseId: string, newRating: number): Promise<void> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    const totalRatings = (course as any).totalRatings + 1;
    const averageRating = ((course.averageRating * (course as any).totalRatings) + newRating) / totalRatings;

    await this.courseModel
      .updateOne(
        { _id: (course as any)._id },
        {
          $set: {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings,
          },
        },
      )
      .exec();
  }

  /**
   * Generate a unique slug from title
   */
  private async generateUniqueSlug(title: string, tenantId: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let uniqueSlug = slug;
    let counter = 1;

    while (
      await this.courseModel.findOne({
        slug: uniqueSlug,
        tenantId: new Types.ObjectId(tenantId),
      })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}
