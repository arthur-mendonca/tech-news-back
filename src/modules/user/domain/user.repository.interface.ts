import { User } from "./user.entity";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  create(user: Partial<User>): Promise<User>;
}

export const IUserRepository = Symbol("IUserRepository");
