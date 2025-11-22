import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { Enrollment, EnrollmentDocument } from '../enrollments/schemas/enrollment.schema';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { UpdateProgressDto } from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  /**
   * Update or create progress for a lesson
   */
  async updateProgress(
    updateProgressDto: UpdateProgressDto,
    studentId: string,
    tenantId: string,
  ): Promise<Progress> {
    const { lessonId, completed, videoPosition, timeSpent, progressPercentage, metadata } = updateProgressDto;

    // Get the lesson to find course and enrollment
    const lesson = await this.lessonModel
      .findOne({
        _id: new Types.ObjectId(lessonId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!lesson) {
      throw new NotFoundException('الدرس غير موجود');
    }

    // Check if student is enrolled in the course
    const enrollment = await this.enrollmentModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: lesson.courseId,
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!enrollment) {
      throw new ForbiddenException('يجب التسجيل في الدورة أولاً');
    }

    // Find or create progress record
    let progress = await this.progressModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        lessonId: new Types.ObjectId(lessonId),
      })
      .exec();

    if (!progress) {
      progress = new this.progressModel({
        tenantId: new Types.ObjectId(tenantId),
        studentId: new Types.ObjectId(studentId),
        courseId: lesson.courseId,
        lessonId: new Types.ObjectId(lessonId),
        enrollmentId: enrollment._id,
        completed: false,
        videoPosition: 0,
        timeSpent: 0,
        progressPercentage: 0,
        metadata: {},
      });
    }

    // Update fields
    if (completed !== undefined) {
      progress.completed = completed;
      if (completed && !progress.completedAt) {
        progress.completedAt = new Date();
        progress.progressPercentage = 100;
      }
    }

    if (videoPosition !== undefined) {
      progress.videoPosition = videoPosition;
    }

    if (timeSpent !== undefined) {
      progress.timeSpent += timeSpent;
    }

    if (progressPercentage !== undefined) {
      progress.progressPercentage = progressPercentage;
    }

    if (metadata !== undefined) {
      progress.metadata = { ...progress.metadata, ...metadata };
    }

    progress.lastAccessedAt = new Date();

    const savedProgress = await progress.save();

    // Update enrollment progress
    await this.updateEnrollmentProgress(enrollment._id.toString(), studentId);

    return savedProgress;
  }

  /**
   * Get all progress for a course
   */
  async getCourseProgress(courseId: string, studentId: string, tenantId: string): Promise<Progress[]> {
    return this.progressModel
      .find({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('lessonId', 'title type order duration')
      .sort({ 'lessonId.order': 1 })
      .exec();
  }

  /**
   * Get progress for a specific lesson
   */
  async getLessonProgress(lessonId: string, studentId: string, tenantId: string): Promise<Progress | null> {
    return this.progressModel
      .findOne({
        lessonId: new Types.ObjectId(lessonId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('lessonId')
      .exec();
  }

  /**
   * Get overall course completion percentage
   */
  async getCourseCompletionPercentage(
    courseId: string,
    studentId: string,
    tenantId: string,
  ): Promise<number> {
    // Get all lessons in the course
    const totalLessons = await this.lessonModel
      .countDocuments({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
        isPublished: true,
      })
      .exec();

    if (totalLessons === 0) {
      return 0;
    }

    // Get completed lessons count
    const completedLessons = await this.progressModel
      .countDocuments({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
        completed: true,
      })
      .exec();

    return Math.round((completedLessons / totalLessons) * 100);
  }

  /**
   * Update enrollment progress based on lesson completion
   */
  private async updateEnrollmentProgress(enrollmentId: string, studentId: string): Promise<void> {
    const enrollment = await this.enrollmentModel
      .findOne({
        _id: new Types.ObjectId(enrollmentId),
        studentId: new Types.ObjectId(studentId),
      })
      .exec();

    if (!enrollment) {
      return;
    }

    const completionPercentage = await this.getCourseCompletionPercentage(
      enrollment.courseId.toString(),
      studentId,
      enrollment.tenantId.toString(),
    );

    enrollment.progressPercentage = completionPercentage;
    enrollment.lastAccessedAt = new Date();

    if (completionPercentage >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
  }

  /**
   * Get next lesson for a student (first incomplete lesson)
   */
  async getNextLesson(courseId: string, studentId: string, tenantId: string): Promise<any> {
    // Get all lessons in order
    const lessons = await this.lessonModel
      .find({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
        isPublished: true,
      })
      .sort({ order: 1 })
      .exec();

    // Find first incomplete lesson
    for (const lesson of lessons) {
      const progress = await this.progressModel
        .findOne({
          lessonId: lesson._id,
          studentId: new Types.ObjectId(studentId),
          completed: true,
        })
        .exec();

      if (!progress) {
        return lesson;
      }
    }

    // All lessons completed, return last lesson
    return lessons[lessons.length - 1] || null;
  }

  /**
   * Mark lesson as completed
   */
  async markLessonCompleted(lessonId: string, studentId: string, tenantId: string): Promise<Progress> {
    return this.updateProgress(
      {
        lessonId,
        completed: true,
        progressPercentage: 100,
      },
      studentId,
      tenantId,
    );
  }

  /**
   * Reset course progress
   */
  async resetCourseProgress(courseId: string, studentId: string, tenantId: string): Promise<{ message: string }> {
    await this.progressModel
      .deleteMany({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    // Reset enrollment progress
    await this.enrollmentModel
      .updateOne(
        {
          courseId: new Types.ObjectId(courseId),
          studentId: new Types.ObjectId(studentId),
          tenantId: new Types.ObjectId(tenantId),
        },
        {
          $set: {
            progressPercentage: 0,
            completedAt: null,
          },
        },
      )
      .exec();

    return { message: 'تم إعادة تعيين التقدم بنجاح' };
  }
}
