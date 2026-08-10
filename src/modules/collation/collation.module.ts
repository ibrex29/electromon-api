import { Module } from '@nestjs/common';
import { CollationCommonModule } from '../../common/collation/collation-common.module';
import { CollationController } from './collation.controller';
import { CollationService } from './collation.service';
import { CollationBrowseService } from './collation-browse.service';

@Module({
  imports: [CollationCommonModule],
  controllers: [CollationController],
  providers: [CollationService, CollationBrowseService],
  exports: [CollationService, CollationBrowseService],
})
export class CollationModule {}
