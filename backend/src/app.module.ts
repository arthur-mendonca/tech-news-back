import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArticleModule } from "./modules/article/article.module";
import { TagModule } from "./modules/tag/tag.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { PrismaModule } from "./core/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    ArticleModule,
    TagModule,
    IngestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
