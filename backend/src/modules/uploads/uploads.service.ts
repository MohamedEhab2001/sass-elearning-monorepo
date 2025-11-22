import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3001';

    // Ensure upload directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure all required upload directories exist
   */
  private ensureDirectories(): void {
    const directories = [
      'uploads',
      'uploads/thumbnails',
      'uploads/videos',
      'uploads/pdfs',
      'uploads/documents',
      'uploads/avatars',
    ];

    directories.forEach((dir) => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * Process uploaded file and return file info
   */
  processUpload(file: Express.Multer.File, subfolder: string = ''): UploadedFile {
    if (!file) {
      throw new BadRequestException('لم يتم رفع أي ملف');
    }

    const relativePath = subfolder
      ? `uploads/${subfolder}/${file.filename}`
      : `uploads/${file.filename}`;

    return {
      filename: file.filename,
      originalName: file.originalname,
      path: relativePath,
      url: `${this.baseUrl}/${relativePath}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Delete a file from the file system
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Validate file type
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): void {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Validate file size (in bytes)
   */
  validateFileSize(file: Express.Multer.File, maxSize: number): void {
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB} ميجابايت`);
    }
  }

  /**
   * Get file extension from mimetype
   */
  getExtensionFromMimetype(mimetype: string): string {
    const mimetypeMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };

    return mimetypeMap[mimetype] || '';
  }
}
