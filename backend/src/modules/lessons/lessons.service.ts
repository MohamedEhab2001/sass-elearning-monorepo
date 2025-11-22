import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/lesson.dto';
import { Course, CourseDocument } from '../courses/schemas/course.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Create a new lesson
   */
  async create(createLessonDto: CreateLessonDto, instructorId: string, tenantId: string): Promise<Lesson> {
    // Verify course exists and belongs to instructor
    const course = await this.verifyCourseOwnership(createLessonDto.courseId, instructorId, tenantId);

    // Get the next order number
    const maxOrder = await this.getMaxOrder(createLessonDto.courseId);

    const lesson = new this.lessonModel({
      ...createLessonDto,
      courseId: new Types.ObjectId(createLessonDto.courseId),
      tenantId: new Types.ObjectId(tenantId),
      order: createLessonDto.order ?? maxOrder + 1,
      isFree: createLessonDto.isFree ?? false,
      isPublished: createLessonDto.isPublished ?? false,
    });

    return lesson.save();
  }

  /**
   * Find all lessons for a course
   */
  async findAllByCourse(
    courseId: string,
    tenantId: string,
    includeUnpublished: boolean = false,
  ): Promise<Lesson[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }

    const query: any = {
      courseId: new Types.ObjectId(courseId),
      tenantId: new Types.ObjectId(tenantId),
    };

    if (!includeUnpublished) {
      query.isPublished = true;
    }

    return this.lessonModel
      .find(query)
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Find a single lesson by ID
   */
  async findOne(lessonId: string, tenantId: string): Promise<Lesson> {
    if (!Types.ObjectId.isValid(lessonId)) {
      throw new BadRequestException('معرف الدرس غير صحيح');
    }

    const lesson = await this.lessonModel
      .findOne({
        _id: new Types.ObjectId(lessonId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!lesson) {
      throw new NotFoundException('الدرس غير موجود');
    }

    return lesson;
  }

  /**
   * Update a lesson
   */
  async update(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
    instructorId: string,
    tenantId: string,
  ): Promise<Lesson> {
    const lesson = await this.findOne(lessonId, tenantId);

    // Verify course ownership
    await this.verifyCourseOwnership(lesson.courseId.toString(), instructorId, tenantId);

    Object.assign(lesson, updateLessonDto);
    return lesson.save();
  }

  /**
   * Delete a lesson
   */
  async delete(lessonId: string, instructorId: string, tenantId: string): Promise<{ message: string }> {
    const lesson = await this.findOne(lessonId, tenantId);

    // Verify course ownership
    await this.verifyCourseOwnership(lesson.courseId.toString(), instructorId, tenantId);

    await this.lessonModel.deleteOne({ _id: lesson._id }).exec();

    // Reorder remaining lessons
    await this.reorderAfterDelete(lesson.courseId.toString(), lesson.order);

    return { message: 'تم حذف الدرس بنجاح' };
  }

  /**
   * Reorder lessons in a course
   */
  async reorder(
    reorderDto: ReorderLessonsDto,
    instructorId: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    // Verify course ownership
    await this.verifyCourseOwnership(reorderDto.courseId, instructorId, tenantId);

    // Verify all lesson IDs belong to the course
    const lessons = await this.lessonModel
      .find({
        _id: { $in: reorderDto.lessonIds.map(id => new Types.ObjectId(id)) },
        courseId: new Types.ObjectId(reorderDto.courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (lessons.length !== reorderDto.lessonIds.length) {
      throw new BadRequestException('بعض الدروس غير موجودة أو لا تنتمي لهذه الدورة');
    }

    // Update order for each lesson
    const updatePromises = reorderDto.lessonIds.map((lessonId, index) =>
      this.lessonModel.updateOne(
        { _id: new Types.ObjectId(lessonId) },
        { $set: { order: index } },
      ).exec(),
    );

    await Promise.all(updatePromises);

    return { message: 'تم إعادة ترتيب الدروس بنجاح' };
  }

  /**
   * Get lesson count for a course
   */
  async getCountByCourse(courseId: string, tenantId: string): Promise<number> {
    return this.lessonModel
      .countDocuments({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();
  }

  /**
   * Get total duration of all lessons in a course
   */
  async getTotalDurationByCourse(courseId: string, tenantId: string): Promise<number> {
    const lessons = await this.lessonModel
      .find({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .select('duration')
      .exec();

    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  /**
   * Verify course exists and belongs to instructor
   */
  private async verifyCourseOwnership(
    courseId: string,
    instructorId: string,
    tenantId: string,
  ): Promise<Course> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }

    const course = await this.courseModel
      .findOne({
        _id: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول لهذه الدورة');
    }

    return course;
  }

  /**
   * Get the maximum order number for lessons in a course
   */
  private async getMaxOrder(courseId: string): Promise<number> {
    const lastLesson = await this.lessonModel
      .findOne({ courseId: new Types.ObjectId(courseId) })
      .sort({ order: -1 })
      .select('order')
      .exec();

    return lastLesson?.order ?? -1;
  }

  /**
   * Reorder lessons after one is deleted
   */
  private async reorderAfterDelete(courseId: string, deletedOrder: number): Promise<void> {
    await this.lessonModel
      .updateMany(
        {
          courseId: new Types.ObjectId(courseId),
          order: { $gt: deletedOrder },
        },
        {
          $inc: { order: -1 },
        },
      )
      .exec();
  }

  /**
   * Mark lesson as completed for a student (to be used later in enrollment module)
   */
  async markCompleted(lessonId: string, studentId: string, tenantId: string): Promise<{ message: string }> {
    const lesson = await this.findOne(lessonId, tenantId);

    // This is a placeholder - actual completion tracking will be in enrollment/progress module
    // For now, just verify the lesson exists

    return { message: 'تم تسجيل إكمال الدرس' };
  }
}
