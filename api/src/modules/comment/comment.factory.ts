import { getCustomRepository, getRepository } from 'typeorm';

import { Factory } from '../../testing/factory';
import { CommentsAreaFactory } from '../comments-area/comments-area.factory';
import { UserFactory } from '../user/user.factory';

import { Comment } from './comment.entity';
import { CommentRepository } from './comment.repository';
import { Message } from './message.entity';

export class CommentFactory implements Factory<Comment> {
  private userFactory = new UserFactory();
  private commentsAreaFactory = new CommentsAreaFactory();

  private get repository() {
    return getCustomRepository(CommentRepository);
  }

  private get messageRepository() {
    return getRepository(Message);
  }

  async create(override: Partial<Omit<Comment, 'id'>> = {}, text = 'comment') {
    const data = {
      ...override,
    };

    if (!data.author) {
      data.author = await this.userFactory.create();
    }

    if (!data.commentsArea) {
      data.commentsArea = await this.commentsAreaFactory.create();
    }

    const message = await this.messageRepository.save({ text });

    data.message = message;
    data.messages = [message];

    const comment = await this.repository.save(data);

    message.comment = comment;
    await this.messageRepository.save(data.message);

    return this.repository.findOne(comment.id);
  }

  async edit(comment: Comment, text: string) {
    const message = await this.messageRepository.save({ comment, text });

    comment.message = message;
    await this.repository.save(comment);
  }
}
