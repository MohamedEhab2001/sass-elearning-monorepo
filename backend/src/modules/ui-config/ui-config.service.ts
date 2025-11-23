import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument, PageStatus } from './schemas/page.schema';
import { CreatePageDto, UpdatePageDto, UpdatePageSectionsDto } from './dto/page.dto';

@Injectable()
export class UiConfigService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  ) {}

  /**
   * Create a new page
   */
  async createPage(
    createPageDto: CreatePageDto,
    userId: string,
    tenantId: string,
  ): Promise<Page> {
    // Check if page with same path already exists for this tenant
    const existingPage = await this.pageModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        path: createPageDto.path,
      })
      .exec();

    if (existingPage) {
      throw new ConflictException('صفحة بنفس المسار موجودة بالفعل');
    }

    const page = new this.pageModel({
      ...createPageDto,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(userId),
      sections: createPageDto.sections || [],
      status: PageStatus.DRAFT,
    });

    return page.save();
  }

  /**
   * Get all pages for a tenant
   */
  async getPages(tenantId: string): Promise<Page[]> {
    return this.pageModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single page by ID
   */
  async getPageById(pageId: string, tenantId: string): Promise<Page> {
    const page = await this.pageModel
      .findOne({
        _id: new Types.ObjectId(pageId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName email')
      .exec();

    if (!page) {
      throw new NotFoundException('الصفحة غير موجودة');
    }

    return page;
  }

  /**
   * Get a published page by path (public API)
   */
  async getPublishedPageByPath(path: string, tenantId: string): Promise<Page | null> {
    return this.pageModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        path,
        status: PageStatus.PUBLISHED,
      })
      .exec();
  }

  /**
   * Update a page
   */
  async updatePage(
    pageId: string,
    updatePageDto: UpdatePageDto,
    userId: string,
    tenantId: string,
  ): Promise<Page> {
    const page = await this.getPageById(pageId, tenantId);

    // If path is being changed, check for conflicts
    if (updatePageDto.path && updatePageDto.path !== page.path) {
      const existingPage = await this.pageModel
        .findOne({
          tenantId: new Types.ObjectId(tenantId),
          path: updatePageDto.path,
          _id: { $ne: new Types.ObjectId(pageId) },
        })
        .exec();

      if (existingPage) {
        throw new ConflictException('صفحة بنفس المسار موجودة بالفعل');
      }
    }

    return this.pageModel
      .findByIdAndUpdate(
        (page as any)._id,
        {
          $set: {
            ...updatePageDto,
            lastModifiedBy: new Types.ObjectId(userId),
          },
        },
        { new: true },
      )
      .exec() as Promise<Page>;
  }

  /**
   * Update page sections
   */
  async updatePageSections(
    pageId: string,
    updateSectionsDto: UpdatePageSectionsDto,
    userId: string,
    tenantId: string,
  ): Promise<Page> {
    const page = await this.getPageById(pageId, tenantId);

    return this.pageModel
      .findByIdAndUpdate(
        (page as any)._id,
        {
          $set: {
            sections: updateSectionsDto.sections,
            lastModifiedBy: new Types.ObjectId(userId),
          },
        },
        { new: true },
      )
      .exec() as Promise<Page>;
  }

  /**
   * Publish or unpublish a page
   */
  async publishPage(
    pageId: string,
    status: PageStatus,
    userId: string,
    tenantId: string,
  ): Promise<Page> {
    const page = await this.getPageById(pageId, tenantId);

    const updateData: any = {
      status,
      lastModifiedBy: new Types.ObjectId(userId),
    };

    if (status === PageStatus.PUBLISHED && !page.publishedAt) {
      updateData.publishedAt = new Date();
    }

    return this.pageModel
      .findByIdAndUpdate(
        (page as any)._id,
        { $set: updateData },
        { new: true },
      )
      .exec() as Promise<Page>;
  }

  /**
   * Delete a page
   */
  async deletePage(pageId: string, tenantId: string): Promise<void> {
    const result = await this.pageModel
      .deleteOne({
        _id: new Types.ObjectId(pageId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('الصفحة غير موجودة');
    }
  }

  /**
   * Duplicate a page
   */
  async duplicatePage(
    pageId: string,
    userId: string,
    tenantId: string,
  ): Promise<Page> {
    const sourcePage = await this.getPageById(pageId, tenantId);

    // Create new page with "نسخة من" prefix
    const newPage = new this.pageModel({
      title: `نسخة من ${sourcePage.title}`,
      path: `${sourcePage.path}-copy-${Date.now()}`,
      description: sourcePage.description,
      sections: sourcePage.sections,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(userId),
      status: PageStatus.DRAFT,
    });

    return newPage.save();
  }
}
