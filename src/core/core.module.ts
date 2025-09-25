import { Module } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { FileUploadService } from './file-upload.service';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [EmailTemplateService, FileUploadService],
  exports: [EmailTemplateService, FileUploadService],
})
export class CoreModule {}
