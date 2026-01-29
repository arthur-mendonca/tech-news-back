import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../domain/user.repository.interface";
import { User } from "../domain/user.entity";
import { PrismaService } from "../../../core/prisma/prisma.service";

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({
      where: { email },
    });
    return found ? new User(found) : null;
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({
      where: { id },
    });
    return found ? new User(found) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: userData.email!,
        passwordHash: userData.passwordHash!,
        lastLogin: userData.lastLogin,
      },
    });
    return new User(created);
  }
}
