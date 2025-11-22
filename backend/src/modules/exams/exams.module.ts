import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { ExamSubmission, ExamSubmissionSchema } from './schemas/exam-submission.schema';
import { ExamsService } from './exams.service';
import { QuestionsService } from './questions.service';
import { SubmissionsService } from './submissions.service';
import { ExamsController } from './exams.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: ExamSubmission.name, schema: ExamSubmissionSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService, QuestionsService, SubmissionsService],
  exports: [ExamsService, QuestionsService, SubmissionsService],
})
export class ExamsModule {}
