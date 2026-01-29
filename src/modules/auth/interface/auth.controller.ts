import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { LoginUseCase } from "../use-cases/login.use-case";

@Controller("auth")
export class AuthController {
  constructor(private loginUseCase: LoginUseCase) { }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }
}
