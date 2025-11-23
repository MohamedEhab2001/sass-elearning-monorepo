import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Upload course thumbnail
   */
  @Post('thumbnail')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/thumbnails',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimetypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع الملف غير مسموح. يُسمح فقط بالصور'), false);
        }
      },
    }),
  )
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.processUpload(file, 'thumbnails');
  }

  /**
   * Upload video file
   */
  @Post('video')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimetypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedMimetypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع الملف غير مسموح. يُسمح فقط بملفات الفيديو'), false);
        }
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.processUpload(file, 'videos');
  }

  /**
   * Upload PDF file
   */
  @Post('pdf')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdfs',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع الملف غير مسموح. يُسمح فقط بملفات PDF'), false);
        }
      },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.processUpload(file, 'pdfs');
  }

  /**
   * Upload document (general)
   */
  @Post('document')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimetypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];
        if (allowedMimetypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع الملف غير مسموح'), false);
        }
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.processUpload(file, 'documents');
  }

  /**
   * Upload avatar/profile picture
   */
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimetypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimetypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('نوع الملف غير مسموح. يُسمح فقط بالصور'), false);
        }
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.processUpload(file, 'avatars');
  }
}
