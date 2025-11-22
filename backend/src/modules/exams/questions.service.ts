import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { QuestionType } from '../../../shared/types/exam.types';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionDocument> {
    // Validate MCQ has options and correct answer
    if (createQuestionDto.questionType === QuestionType.MCQ) {
      if (!createQuestionDto.options || createQuestionDto.options.length === 0) {
        throw new ConflictException('الأسئلة متعددة الخيارات يجب أن تحتوي على خيارات');
      }
      if (createQuestionDto.correctAnswer === undefined || createQuestionDto.correctAnswer === null) {
        throw new ConflictException('الأسئلة متعددة الخيارات يجب أن تحتوي على إجابة صحيحة');
      }
      if (createQuestionDto.correctAnswer < 0 || createQuestionDto.correctAnswer >= createQuestionDto.options.length) {
        throw new ConflictException('الإجابة الصحيحة غير صحيحة');
      }
    }

    // Auto-assign order if not provided
    let order = createQuestionDto.order;
    if (order === undefined || order === null) {
      const lastQuestion = await this.questionModel
        .findOne({ examId: new Types.ObjectId(createQuestionDto.examId) })
        .sort({ order: -1 })
        .exec();

      order = lastQuestion ? lastQuestion.order + 1 : 0;
    }

    const question = new this.questionModel({
      ...createQuestionDto,
      examId: new Types.ObjectId(createQuestionDto.examId),
      order,
    });

    return question.save();
  }

  async findByExamId(examId: string): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ examId: new Types.ObjectId(examId) })
      .sort({ order: 1 })
      .exec();
  }

  async findById(questionId: string): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(questionId).exec();

    if (!question) {
      throw new NotFoundException('السؤال غير موجود');
    }

    return question;
  }

  async update(questionId: string, updateQuestionDto: UpdateQuestionDto): Promise<QuestionDocument> {
    const question = await this.findById(questionId);

    // Validate MCQ updates
    if (question.questionType === QuestionType.MCQ) {
      if (updateQuestionDto.options && updateQuestionDto.options.length === 0) {
        throw new ConflictException('الأسئلة متعددة الخيارات يجب أن تحتوي على خيارات');
      }
      if (updateQuestionDto.correctAnswer !== undefined) {
        const options = updateQuestionDto.options || question.options;
        if (updateQuestionDto.correctAnswer < 0 || updateQuestionDto.correctAnswer >= options.length) {
          throw new ConflictException('الإجابة الصحيحة غير صحيحة');
        }
      }
    }

    const updatedQuestion = await this.questionModel.findByIdAndUpdate(
      questionId,
      { $set: updateQuestionDto },
      { new: true },
    ).exec();

    if (!updatedQuestion) {
      throw new NotFoundException('السؤال غير موجود');
    }

    return updatedQuestion;
  }

  async delete(questionId: string): Promise<void> {
    const result = await this.questionModel.findByIdAndDelete(questionId).exec();

    if (!result) {
      throw new NotFoundException('السؤال غير موجود');
    }
  }

  async reorder(examId: string, questionOrders: { questionId: string; order: number }[]): Promise<void> {
    const bulkOps = questionOrders.map((item) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.questionId), examId: new Types.ObjectId(examId) },
        update: { $set: { order: item.order } },
      },
    }));

    await this.questionModel.bulkWrite(bulkOps);
  }

  /**
   * Get questions for student (without correct answers for MCQ)
   */
  async getQuestionsForStudent(examId: string, randomize = false): Promise<any[]> {
    let questions = await this.findByExamId(examId);

    // Randomize questions if needed
    if (randomize) {
      questions = this.shuffleArray(questions);
    }

    // Remove correct answers from MCQ questions
    return questions.map((q) => {
      const questionObj = q.toObject();

      if (questionObj.questionType === QuestionType.MCQ) {
        // Remove correct answer
        delete questionObj.correctAnswer;
      }

      return questionObj;
    });
  }

  /**
   * Calculate max points for an exam
   */
  async calculateMaxPoints(examId: string): Promise<number> {
    const questions = await this.findByExamId(examId);
    return questions.reduce((sum, q) => sum + q.points, 0);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
