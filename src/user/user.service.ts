import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);
  private users: User[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const userGenerationCount = this.configService.get<number>(
      'mockUserCount',
    ) as number;
    this.generateMockUsers(userGenerationCount);
    this.logger.log(`Mock users generated: ${this.users.length}`);
  }

  private generateMockUsers(count: number): void {
    this.users = [];

    for (let i = 1; i <= count; i++) {
      this.users.push({
        id: i,
        name: `User ${i}`,
        deviceToken: `device-token-${i}-${Math.random().toString(36).substring(2, 10)}`,
      });
    }

    this.logger.debug('Finished generating mock users.');
  }

  findAll(page: number = 1, limit: number = 10): User[] {
    const offset = (page - 1) * limit;
    const paginatedUsers = this.users.slice(offset, offset + limit);

    return paginatedUsers;
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
