import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IFileStorageService } from '@/application/interface/IFileStorageService';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export class FileStorageService implements IFileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'talas-paints-dev';
  }

  private extractKeyFromS3Url(url: string): { key: string; isValid: boolean } {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      if (!hostname.includes(this.bucketName)) {
        return { key: '', isValid: false };
      }

      const key = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
      if (!key) return { key: '', isValid: false };

      return { key, isValid: true };
    } catch {
      return { key: '', isValid: false };
    }
  }

  private async convertToJPGIfNeeded(file: Express.Multer.File): Promise<Buffer> {
    if (file.mimetype === 'image/jpeg') {
      return file.buffer;
    }

    try {
      return await sharp(file.buffer)
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } catch {
      throw new Error('Failed to convert image to JPEG');
    }
  }

  async UploadProductImage(
    file: Express.Multer.File,
    id: string,
    folder: string
  ): Promise<string> {
    const fileBuffer = await this.convertToJPGIfNeeded(file);
    const uniqueId = uuidv4();
    const key = `${folder}/${id}/${uniqueId}.jpg`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error: any) {
      throw new Error(`Failed to upload product image to S3: ${error.message}`);
    }
  }

  async UploadMultipleProductImages(
    files: Express.Multer.File[],
    productId: string,
    folder: string
  ): Promise<string[]> {
    const uploadPromises = files.map(file =>
      this.UploadProductImage(file, productId, folder)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      throw new Error(`Failed to upload multiple images: ${error.message}`);
    }
  }

  async DeleteOldImage(fileUrl: string): Promise<void> {
    const { key, isValid } = this.extractKeyFromS3Url(fileUrl);
    if (!isValid) {
      throw new Error('Invalid S3 URL format');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error: any) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }
}
