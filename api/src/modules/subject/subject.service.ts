import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Information } from '../information/information.entity';
import { User } from '../user/user.entity';
import { Message } from '../reaction/message.entity';

import { Subject } from './subject.entity';
import { CreateSubjectInDto } from './dtos/create-subject-in.dto';
import { SubjectRepository } from './subject.repository';

@Injectable()
export class SubjectService {

  constructor(
    private readonly subjectRepository: SubjectRepository,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findById(id: number): Promise<Subject> {
    return this.subjectRepository.findOne(id, { relations: ['information'] });
  }

  async create(dto: CreateSubjectInDto, user: User, information: Information): Promise<Subject> {
    const subject = new Subject();
    const message = new Message();

    subject.information = information;
    subject.author = user;
    subject.subject = dto.subject;
    subject.quote = dto.quote;

    message.text = dto.text;
    subject.messages = [message];

    await this.messageRepository.save(message);
    await this.subjectRepository.save(subject);

    return subject;
  }

  async addTotalReactionsCount(subjects: Subject[]): Promise<Subject[]> {
    if (!subjects.length)
      return [];

    const reactionsCounts = await this.subjectRepository.getTotalReactionsCount(subjects.map(s => s.id));

    subjects.forEach(subject => {
      const reactionsCount = reactionsCounts.find(rc => rc.subjectId === subject.id);

      if (!reactionsCount)
        subject.reactionsCount = 0;
      else
        subject.reactionsCount = reactionsCount.reactionsCount;
    });

    return subjects;
  }

}
