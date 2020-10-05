import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';

import { Seed } from './seed.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([Seed]), ConfigModule, LoggerModule],
  providers: [SeedService],
})
export class SeedModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
