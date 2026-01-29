import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArticleModule } from "./modules/article/article.module";
import { TagModule } from "./modules/tag/tag.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { ProcessorModule } from "./modules/processor/processor.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { PrismaModule } from "./core/prisma/prisma.module";
import { LLMModule } from "./core/llm/llm.module";
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    }),
    PrismaModule,
    LLMModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    ArticleModule,
    TagModule,
    IngestionModule,
    ProcessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
