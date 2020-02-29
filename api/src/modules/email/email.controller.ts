import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { Output } from 'Common/output.interceptor';

import { AuthorizedEmail } from './authorized-email.entity';
import { AuthorizedEmailOutDto } from './dtos/authorized-email-out.dto';
import { CreateAuthorizedEmailInDto } from './dtos/create-authorized-email-in.dto';
import { EmailService } from './email.service';

@Controller('email')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Get('authorized')
  @Output(AuthorizedEmailOutDto)
  async findAll(): Promise<AuthorizedEmail[]> {
    return this.emailService.findAllAuthorized();
  }

  @Post('authorize')
  @Output(AuthorizedEmailOutDto)
  async create(@Body() dto: CreateAuthorizedEmailInDto): Promise<AuthorizedEmail> {
    if (await this.emailService.isAthorized(dto.email))
      throw new BadRequestException(`email ${dto.email} already authorized`);

    return this.emailService.authorize(dto.email);
  }

}
