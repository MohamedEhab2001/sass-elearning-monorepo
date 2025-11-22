import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Transaction, TransactionDocument, TransactionStatus } from '../payments/schemas/transaction.schema';
import { Payout, PayoutDocument, PayoutStatus } from '../payments/schemas/payout.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
  ) {}

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<any> {
    // Count totals
    const totalTenants = await this.tenantModel.countDocuments({ status: 'active' }).exec();
    const totalInstructors = await this.userModel.countDocuments({ role: 'instructor' }).exec();
    const totalStudents = await this.userModel.countDocuments({ role: 'student' }).exec();
    const totalCourses = await this.courseModel.countDocuments().exec();

    // Transaction stats
    const completedTransactions = await this.transactionModel
      .find({ status: TransactionStatus.COMPLETED })
      .exec();

    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const platformCommission = totalRevenue * 0.15;

    // Payout stats
    const pendingPayouts = await this.payoutModel
      .find({ status: PayoutStatus.PENDING })
      .exec();

    const completedPayouts = await this.payoutModel
      .find({ status: PayoutStatus.COMPLETED })
      .exec();

    const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const completedPayoutsAmount = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

    // Growth stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newTenantsCount = await this.tenantModel
      .countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
      .exec();

    const newInstructorsCount = await this.userModel
      .countDocuments({
        role: 'instructor',
        createdAt: { $gte: thirtyDaysAgo },
      })
      .exec();

    const newStudentsCount = await this.userModel
      .countDocuments({
        role: 'student',
        createdAt: { $gte: thirtyDaysAgo },
      })
      .exec();

    const recentRevenue = completedTransactions
      .filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTenants,
      totalInstructors,
      totalStudents,
      totalCourses,
      totalRevenue,
      platformCommission,
      pendingPayoutsCount: pendingPayouts.length,
      pendingPayoutsAmount,
      completedPayoutsAmount,
      growth: {
        newTenants: newTenantsCount,
        newInstructors: newInstructorsCount,
        newStudents: newStudentsCount,
        recentRevenue,
      },
    };
  }

  /**
   * Get all tenants with stats
   */
  async getAllTenants(): Promise<any[]> {
    const tenants = await this.tenantModel
      .find()
      .populate('ownerId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const instructorCount = await this.userModel
          .countDocuments({
            tenantId: tenant._id,
            role: 'instructor',
          })
          .exec();

        const studentCount = await this.userModel
          .countDocuments({
            tenantId: tenant._id,
            role: 'student',
          })
          .exec();

        const courseCount = await this.courseModel
          .countDocuments({ tenantId: tenant._id })
          .exec();

        const transactions = await this.transactionModel
          .find({
            tenantId: tenant._id,
            status: TransactionStatus.COMPLETED,
          })
          .exec();

        const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...tenant.toObject(),
          stats: {
            instructors: instructorCount,
            students: studentCount,
            courses: courseCount,
            revenue,
          },
        };
      })
    );

    return tenantsWithStats;
  }

  /**
   * Get tenant details by ID
   */
  async getTenantById(tenantId: string): Promise<any> {
    const tenant = await this.tenantModel
      .findById(new Types.ObjectId(tenantId))
      .populate('ownerId', 'fullName email createdAt')
      .exec();

    if (!tenant) {
      throw new Error('المنصة غير موجودة');
    }

    // Get detailed stats
    const instructors = await this.userModel
      .find({
        tenantId: tenant._id,
        role: 'instructor',
      })
      .select('fullName email createdAt')
      .exec();

    const studentCount = await this.userModel
      .countDocuments({
        tenantId: tenant._id,
        role: 'student',
      })
      .exec();

    const courses = await this.courseModel
      .find({ tenantId: tenant._id })
      .populate('instructorId', 'fullName')
      .exec();

    const transactions = await this.transactionModel
      .find({
        tenantId: tenant._id,
        status: TransactionStatus.COMPLETED,
      })
      .exec();

    const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const commission = revenue * 0.15;

    return {
      tenant: tenant.toObject(),
      stats: {
        instructorCount: instructors.length,
        studentCount,
        courseCount: courses.length,
        transactionCount: transactions.length,
        totalRevenue: revenue,
        platformCommission: commission,
      },
      instructors,
      recentCourses: courses.slice(0, 5),
    };
  }

  /**
   * Get all instructors across platform
   */
  async getAllInstructors(): Promise<any[]> {
    const instructors = await this.userModel
      .find({ role: 'instructor' })
      .populate('tenantId', 'name slug')
      .sort({ createdAt: -1 })
      .exec();

    // Get stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const courseCount = await this.courseModel
          .countDocuments({ instructorId: instructor._id })
          .exec();

        const courses = await this.courseModel
          .find({ instructorId: instructor._id })
          .select('_id')
          .exec();

        const courseIds = courses.map((c) => c._id);

        const transactions = await this.transactionModel
          .find({
            courseId: { $in: courseIds },
            status: TransactionStatus.COMPLETED,
          })
          .exec();

        const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...instructor.toObject(),
          stats: {
            courses: courseCount,
            students: new Set(transactions.map((t) => t.userId.toString())).size,
            revenue,
          },
        };
      })
    );

    return instructorsWithStats;
  }
}
