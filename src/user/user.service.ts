import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);
  private users: User[] = [];

  async onModuleInit() {
    this.generateMockUsers();
    this.logger.log(`Mock users generated: ${this.users.length}`);
  }

  private generateMockUsers(): void {
    this.users = [];

    for (let i = 1; i <= 10; i++) {
      this.users.push({
        id: i,
        name: `User ${i}`,
        deviceToken: `device-token-${i}-${Math.random().toString(36).substring(2, 10)}`,
      });
    }

    this.logger.debug('Finished generating mock users.');
  }

  findAll(): User[] {
    this.logger.verbose('Fetching all users');
    return this.users;
  }

  findOne(id: number): User | undefined {
    const user = this.users.find((user) => user.id === id);
    if (user) {
      this.logger.log(`User found: ${user.name}`);
    } else {
      this.logger.warn(`User with id ${id} not found`);
    }
    return user;
  }
}
