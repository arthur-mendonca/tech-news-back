import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}
