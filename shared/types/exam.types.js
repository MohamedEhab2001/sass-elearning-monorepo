"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionStatus = exports.ExamStatus = exports.QuestionType = void 0;
var QuestionType;
(function (QuestionType) {
    QuestionType["MCQ"] = "mcq";
    QuestionType["ESSAY"] = "essay";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var ExamStatus;
(function (ExamStatus) {
    ExamStatus["DRAFT"] = "draft";
    ExamStatus["PUBLISHED"] = "published";
    ExamStatus["ARCHIVED"] = "archived";
})(ExamStatus || (exports.ExamStatus = ExamStatus = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["IN_PROGRESS"] = "in_progress";
    SubmissionStatus["SUBMITTED"] = "submitted";
    SubmissionStatus["GRADED"] = "graded";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
//# sourceMappingURL=exam.types.js.map