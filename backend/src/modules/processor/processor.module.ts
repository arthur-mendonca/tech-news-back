import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProcessorService } from './processor.service';
import { ProcessorConsumer } from './processor.consumer';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'article-processing' }),
  ],
  providers: [ProcessorService, ProcessorConsumer],
  exports: [ProcessorService, BullModule],
})
export class ProcessorModule {}
