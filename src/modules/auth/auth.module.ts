import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { LoginUseCase } from "./use-cases/login.use-case";
import { JwtStrategy } from "./infra/jwt.strategy";
import { AuthController } from "./interface/auth.controller";

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "secret",
        signOptions: {
          expiresIn: (configService.get<string>("JWT_EXPIRES_IN") || "1d") as NonNullable<JwtModuleOptions["signOptions"]>["expiresIn"],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtStrategy],
  exports: [LoginUseCase],
})
export class AuthModule { }
