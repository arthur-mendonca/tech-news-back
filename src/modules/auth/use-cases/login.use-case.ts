import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { IUserRepository } from "../../user/domain/user.repository.interface";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository)
    private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
