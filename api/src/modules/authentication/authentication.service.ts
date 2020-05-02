import { BadRequestException, Injectable,  UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import * as uuidv4 from 'uuid/v4';

import { EmailService } from '../email/email.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

import { SignupUserInDto } from './dtos/signup-user-in.dto';

@Injectable()
export class AuthenticationService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignupUserInDto): Promise<User> {
    if (await this.userService.findByNick(dto.nick))
      throw new BadRequestException('NICK_ALREADY_EXISTS');

    if (await this.userService.findByEmail(dto.email))
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');

    const { email, nick, password } = dto;

    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    if (password.match(email) || email.match(password) || password.match(nick) || nick.match(password))
      throw new BadRequestException('PASSWORD_UNSECURE');

    return this.userService.create(dto);
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !await bcrypt.compare(password, user.password))
      throw new UnauthorizedException('INVALID_CREDENTIALS');

    if (!user.emailValidated)
      throw new UnauthorizedException('EMAIL_NOT_VALIDATED');

    return user;
  }

  async emailLogin(emailLoginToken: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { emailLoginToken },
    });

    if (!user)
      throw new UnauthorizedException('INVALID_EMAIL_LOGIN_TOKEN');

    if (!user.emailValidated)
      await this.userRepository.update(user.id, { emailValidated: true });

    await this.userRepository.update(user.id, { emailLoginToken: null });

    return user;
  }

  async askEmailLogin(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user)
      return;

    user.emailLoginToken = uuidv4();

    await this.userRepository.save(user);

    await this.emailService.sendEmailLoginEmail(user);
  }

}
