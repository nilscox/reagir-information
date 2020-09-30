import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentModule } from '../comment/comment.module';
import { CommentsAreaModule } from '../comments-area/comments-area.module';
import { UserModule } from '../user/user.module';

import { CypressController } from './cypress.controller';
import { CypressService } from './cypress.service';

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME_ROOT,
} = process.env;

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forRoot({
      name: 'postgres',
      type: 'postgres',
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_NAME_ROOT,
      logging: true,
    }),
    UserModule,
    CommentsAreaModule,
    CommentModule,
  ],
  controllers: [CypressController],
  providers: [CypressService],
})
export class CypressModule {}
