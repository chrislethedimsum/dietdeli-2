import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
  
            reject(
              new InternalServerErrorException(
                error.message || 'Upload ảnh thất bại',
              ),
            );
            return;
          }
  
          if (!result?.secure_url) {
            reject(
              new InternalServerErrorException(
                'Cloudinary không trả về URL ảnh',
              ),
            );
            return;
          }
  
          resolve(result.secure_url);
        },
      );
  
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
