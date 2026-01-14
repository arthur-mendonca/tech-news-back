import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './modules/article/article.module';
import { PrismaModule } from './core/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ArticleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
