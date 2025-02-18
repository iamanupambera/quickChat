import { Injectable, Logger } from '@nestjs/common';
import { credential, storage } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import path from 'path';

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);

  constructor() {
    const serviceAccountPath = path.resolve(
      __dirname,
      '../../../public/filename.json',
    );

    initializeApp({
      credential: credential.cert(serviceAccountPath),
      storageBucket: 'bucketName',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = storage().bucket();
    const filename = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(filename);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        this.logger.error('Error uploading file: ', error);
        reject(error);
      });

      stream.on('finish', () => {
        this.logger.log(`File upload successfully: ', ${filename}`);
        resolve(fileUpload.publicUrl());
      });

      stream.end(file.buffer);
    });
  }

  async getFile(filename: string): Promise<string> {
    const bucket = storage().bucket();
    const file = bucket.file(filename);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File does not exist');
      }

      return file.publicUrl();
    } catch (error) {
      this.logger.error('Error retrieving file: ', error);
      throw error;
    }
  }

  async updateFile(
    file: Express.Multer.File,
    filename: string,
  ): Promise<string> {
    const bucket = storage().bucket();
    const existingFile = bucket.file(filename);

    try {
      const [exists] = await existingFile.exists();
      if (!exists) {
        throw new Error('File does not exist');
      }

      const stream = existingFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          this.logger.error('Error updating file: ', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            await existingFile.makePublic();
            this.logger.log(`File updated successfully: ${filename}`);
            resolve(existingFile.publicUrl());
          } catch (error) {
            this.logger.error('Error making updated file public: ', error);
            reject(error);
          }
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Error updating file: ', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const bucket = storage().bucket();
    const file = bucket.file(filename);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File does not exist');
      }

      await file.delete();
      this.logger.log(`File deleted successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error deleting file: ', error);
      throw error;
    }
  }
}
