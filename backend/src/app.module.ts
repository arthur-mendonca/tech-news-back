import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArticleModule } from "./modules/article/article.module";
import { TagModule } from "./modules/tag/tag.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { ProcessorModule } from "./modules/processor/processor.module";
import { PrismaModule } from "./core/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScheduleModule.forRoot(),
    ArticleModule,
    TagModule,
    IngestionModule,
    ProcessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
