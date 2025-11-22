import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExamSubmission, ExamSubmissionDocument } from './schemas/exam-submission.schema';
import { SubmitExamDto, GradeEssayDto, StartExamDto } from './dto/submission.dto';
import { ExamsService } from './exams.service';
import { QuestionsService } from './questions.service';
import { SubmissionStatus, QuestionType, IAnswer } from '../../../shared/types/exam.types';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(ExamSubmission.name) private submissionModel: Model<ExamSubmissionDocument>,
    private examsService: ExamsService,
    private questionsService: QuestionsService,
  ) {}

  /**
   * Start an exam (create in-progress submission)
   */
  async startExam(
    examId: string,
    studentId: string,
    tenantId: string,
    studentCustomFields: Record<string, any>,
  ): Promise<ExamSubmissionDocument> {
    const exam = await this.examsService.findById(examId);

    // Check visibility
    const isVisible = await this.examsService.evaluateVisibility(examId, studentCustomFields);
    if (!isVisible) {
      throw new ForbiddenException('هذا الامتحان غير متاح لك');
    }

    // Check if already in progress
    const inProgressSubmission = await this.submissionModel.findOne({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
      status: SubmissionStatus.IN_PROGRESS,
    }).exec();

    if (inProgressSubmission) {
      return inProgressSubmission;
    }

    // Check max attempts
    if (exam.maxAttempts !== null && exam.maxAttempts !== undefined) {
      const previousAttempts = await this.submissionModel.countDocuments({
        examId: new Types.ObjectId(examId),
        studentId: new Types.ObjectId(studentId),
        status: { $in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
      }).exec();

      if (previousAttempts >= exam.maxAttempts) {
        throw new ForbiddenException('لقد وصلت إلى الحد الأقصى لعدد المحاولات');
      }
    }

    // Check if retake allowed
    if (!exam.allowRetake) {
      const previousSubmission = await this.submissionModel.findOne({
        examId: new Types.ObjectId(examId),
        studentId: new Types.ObjectId(studentId),
        status: { $in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
      }).exec();

      if (previousSubmission) {
        throw new ForbiddenException('لا يمكنك إعادة هذا الامتحان');
      }
    }

    // Get attempt number
    const attemptNumber = await this.submissionModel.countDocuments({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
    }).exec() + 1;

    // Create new submission
    const submission = new this.submissionModel({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
      tenantId: new Types.ObjectId(tenantId),
      answers: [],
      status: SubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
      attemptNumber,
      totalPoints: 0,
      maxPoints: await this.questionsService.calculateMaxPoints(examId),
      percentage: 0,
      passed: false,
    });

    return submission.save();
  }

  /**
   * Submit exam and auto-grade MCQ questions
   */
  async submitExam(
    submitExamDto: SubmitExamDto,
    studentId: string,
    tenantId: string,
  ): Promise<ExamSubmissionDocument> {
    const { examId, answers, timeSpent } = submitExamDto;

    // Find in-progress submission
    const submission = await this.submissionModel.findOne({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
      status: SubmissionStatus.IN_PROGRESS,
    }).exec();

    if (!submission) {
      throw new NotFoundException('لم يتم العثور على محاولة قيد التقدم');
    }

    // Get all questions
    const questions = await this.questionsService.findByExamId(examId);

    // Process answers and auto-grade MCQ
    const processedAnswers: IAnswer[] = [];
    let totalPoints = 0;

    for (const answer of answers) {
      const question = questions.find((q) => q._id.toString() === answer.questionId);

      if (!question) {
        continue;
      }

      const processedAnswer: IAnswer = {
        questionId: answer.questionId,
      };

      if (question.questionType === QuestionType.MCQ) {
        processedAnswer.selectedOption = answer.selectedOption;

        // Auto-grade MCQ
        const isCorrect = answer.selectedOption === question.correctAnswer;
        processedAnswer.isCorrect = isCorrect;
        processedAnswer.points = isCorrect ? question.points : 0;

        totalPoints += processedAnswer.points;
      } else if (question.questionType === QuestionType.ESSAY) {
        processedAnswer.essayText = answer.essayText;
        // Essay will be graded manually later
        processedAnswer.points = 0;
      }

      processedAnswers.push(processedAnswer);
    }

    // Calculate max points
    const maxPoints = await this.questionsService.calculateMaxPoints(examId);

    // Check if all questions are MCQ (fully auto-graded)
    const hasEssay = questions.some((q) => q.questionType === QuestionType.ESSAY);

    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    const exam = await this.examsService.findById(examId);
    const passed = percentage >= exam.passingScore;

    // Update submission
    submission.answers = processedAnswers;
    submission.totalPoints = totalPoints;
    submission.maxPoints = maxPoints;
    submission.percentage = percentage;
    submission.passed = passed;
    submission.submittedAt = new Date();
    submission.timeSpent = timeSpent;

    if (hasEssay) {
      // Needs manual grading
      submission.status = SubmissionStatus.SUBMITTED;
    } else {
      // Fully auto-graded
      submission.status = SubmissionStatus.GRADED;
      submission.autoGradedAt = new Date();
    }

    return submission.save();
  }

  /**
   * Manual grading for essay questions
   */
  async gradeEssay(
    submissionId: string,
    gradeEssayDto: GradeEssayDto,
    instructorId: string,
  ): Promise<ExamSubmissionDocument> {
    const submission = await this.submissionModel.findById(submissionId).exec();

    if (!submission) {
      throw new NotFoundException('الإرسال غير موجود');
    }

    // Find the answer
    const answerIndex = submission.answers.findIndex(
      (a) => a.questionId.toString() === gradeEssayDto.questionId,
    );

    if (answerIndex === -1) {
      throw new NotFoundException('الإجابة غير موجودة');
    }

    // Update answer with grade and feedback
    submission.answers[answerIndex].points = gradeEssayDto.points;
    submission.answers[answerIndex].feedback = gradeEssayDto.feedback;

    // Recalculate total points
    let totalPoints = 0;
    for (const answer of submission.answers) {
      totalPoints += answer.points || 0;
    }

    submission.totalPoints = totalPoints;
    submission.percentage = submission.maxPoints > 0 ? (totalPoints / submission.maxPoints) * 100 : 0;

    const exam = await this.examsService.findById(submission.examId.toString());
    submission.passed = submission.percentage >= exam.passingScore;

    // Check if all essays are graded
    const allGraded = submission.answers.every((a) => a.points !== undefined && a.points !== null);

    if (allGraded) {
      submission.status = SubmissionStatus.GRADED;
      submission.manuallyGradedAt = new Date();
      submission.gradedBy = new Types.ObjectId(instructorId);
    }

    return submission.save();
  }

  /**
   * Get submissions for an exam
   */
  async getSubmissionsByExam(examId: string): Promise<ExamSubmissionDocument[]> {
    return this.submissionModel
      .find({
        examId: new Types.ObjectId(examId),
        status: { $in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
      })
      .populate('studentId', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get submissions for a student
   */
  async getSubmissionsByStudent(studentId: string, tenantId: string): Promise<ExamSubmissionDocument[]> {
    return this.submissionModel
      .find({
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('examId', 'title description passingScore')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a specific submission
   */
  async getSubmission(submissionId: string): Promise<ExamSubmissionDocument> {
    const submission = await this.submissionModel
      .findById(submissionId)
      .populate('examId', 'title description passingScore showResultsImmediately')
      .populate('studentId', 'firstName lastName email')
      .exec();

    if (!submission) {
      throw new NotFoundException('الإرسال غير موجود');
    }

    return submission;
  }

  /**
   * Get student's submission for an exam
   */
  async getStudentSubmission(examId: string, studentId: string): Promise<ExamSubmissionDocument | null> {
    return this.submissionModel
      .findOne({
        examId: new Types.ObjectId(examId),
        studentId: new Types.ObjectId(studentId),
        status: { $in: [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED] },
      })
      .sort({ submittedAt: -1 })
      .exec();
  }
}
