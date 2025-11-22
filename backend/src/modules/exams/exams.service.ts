import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { ExamStatus, VisibilityRule } from '../../../shared/types/exam.types';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
  ) {}

  async create(createExamDto: CreateExamDto, tenantId: string, instructorId: string): Promise<ExamDocument> {
    const exam = new this.examModel({
      ...createExamDto,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(instructorId),
      status: ExamStatus.DRAFT,
      visibilityRules: createExamDto.visibilityRules || [],
      showResultsImmediately: createExamDto.showResultsImmediately ?? true,
      allowRetake: createExamDto.allowRetake ?? true,
      randomizeQuestions: createExamDto.randomizeQuestions ?? false,
      randomizeOptions: createExamDto.randomizeOptions ?? false,
    });

    return exam.save();
  }

  async findAll(tenantId: string, includeArchived = false): Promise<ExamDocument[]> {
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (!includeArchived) {
      query.status = { $ne: ExamStatus.ARCHIVED };
    }

    return this.examModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(examId: string): Promise<ExamDocument> {
    const exam = await this.examModel
      .findById(examId)
      .populate('createdBy', 'firstName lastName email')
      .populate('courseId', 'title')
      .exec();

    if (!exam) {
      throw new NotFoundException('الامتحان غير موجود');
    }

    return exam;
  }

  async findByCourseId(courseId: string): Promise<ExamDocument[]> {
    return this.examModel
      .find({ courseId: new Types.ObjectId(courseId), status: ExamStatus.PUBLISHED })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(examId: string, updateExamDto: UpdateExamDto): Promise<ExamDocument> {
    const exam = await this.examModel.findByIdAndUpdate(
      examId,
      { $set: updateExamDto },
      { new: true },
    ).exec();

    if (!exam) {
      throw new NotFoundException('الامتحان غير موجود');
    }

    return exam;
  }

  async delete(examId: string): Promise<void> {
    const result = await this.examModel.findByIdAndDelete(examId).exec();

    if (!result) {
      throw new NotFoundException('الامتحان غير موجود');
    }
  }

  async publish(examId: string): Promise<ExamDocument> {
    const exam = await this.examModel.findByIdAndUpdate(
      examId,
      { $set: { status: ExamStatus.PUBLISHED } },
      { new: true },
    ).exec();

    if (!exam) {
      throw new NotFoundException('الامتحان غير موجود');
    }

    return exam;
  }

  async archive(examId: string): Promise<ExamDocument> {
    const exam = await this.examModel.findByIdAndUpdate(
      examId,
      { $set: { status: ExamStatus.ARCHIVED } },
      { new: true },
    ).exec();

    if (!exam) {
      throw new NotFoundException('الامتحان غير موجود');
    }

    return exam;
  }

  /**
   * Visibility Rules Engine
   * Evaluates if a student can see an exam based on visibility rules
   */
  async evaluateVisibility(
    examId: string,
    studentCustomFields: Record<string, any>,
  ): Promise<boolean> {
    const exam = await this.findById(examId);

    // If no visibility rules, exam is visible to all
    if (!exam.visibilityRules || exam.visibilityRules.length === 0) {
      return true;
    }

    // All rules must pass (AND logic)
    for (const rule of exam.visibilityRules) {
      const fieldValue = studentCustomFields[rule.customFieldName];

      if (!this.evaluateRule(fieldValue, rule)) {
        return false;
      }
    }

    return true;
  }

  private evaluateRule(fieldValue: any, rule: VisibilityRule): boolean {
    switch (rule.operator) {
      case 'equals':
        return fieldValue == rule.value; // Loose equality to handle type coercion

      case 'not_equals':
        return fieldValue != rule.value;

      case 'contains':
        if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
          return fieldValue.toLowerCase().includes(rule.value.toLowerCase());
        }
        return false;

      case 'greater_than':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          return fieldValue > rule.value;
        }
        // Try parsing as numbers for date/number fields
        const numFieldValue = Number(fieldValue);
        const numRuleValue = Number(rule.value);
        if (!isNaN(numFieldValue) && !isNaN(numRuleValue)) {
          return numFieldValue > numRuleValue;
        }
        return false;

      case 'less_than':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          return fieldValue < rule.value;
        }
        const numFieldValue2 = Number(fieldValue);
        const numRuleValue2 = Number(rule.value);
        if (!isNaN(numFieldValue2) && !isNaN(numRuleValue2)) {
          return numFieldValue2 < numRuleValue2;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Get all published exams visible to a student
   */
  async getAvailableExamsForStudent(
    tenantId: string,
    studentCustomFields: Record<string, any>,
  ): Promise<ExamDocument[]> {
    const publishedExams = await this.examModel
      .find({ tenantId: new Types.ObjectId(tenantId), status: ExamStatus.PUBLISHED })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .exec();

    const visibleExams: ExamDocument[] = [];

    for (const exam of publishedExams) {
      const isVisible = await this.evaluateVisibility(exam._id.toString(), studentCustomFields);
      if (isVisible) {
        visibleExams.push(exam);
      }
    }

    return visibleExams;
  }
}
