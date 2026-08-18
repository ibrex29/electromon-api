import { Module } from '@nestjs/common';
import { CollationCommonModule } from '../../common/collation/collation-common.module';
import { CollationController } from './collation.controller';
import { CollationService } from './collation.service';
import { CollationBrowseService } from './collation-browse.service';
import { GoogleVisionService } from './google-vision.service';
import { OcrQueueService } from './ocr-queue.service';
import { OcrVerifyWorker } from './ocr-verify.worker';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [CollationCommonModule, UploadsModule],
  controllers: [CollationController],
  providers: [
    CollationService,
    CollationBrowseService,
    GoogleVisionService,
    OcrVerifyWorker,
    OcrQueueService,
  ],
  exports: [CollationService, CollationBrowseService],
})
export class CollationModule {}
