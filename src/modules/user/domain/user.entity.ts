export class User {
  id: string;
  email: string;
  passwordHash: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }
}
