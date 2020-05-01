import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Information } from '../information/information.entity';
import { User } from '../user/user.entity';

import { Message } from './message.entity';
import { QuickReaction, QuickReactionType } from './quick-reaction.entity';

@Entity({ name: 'reaction', orderBy: { created: 'DESC' } })
export class Reaction {

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(type => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ default: 0 })
  score: number;

  // TODO: eager: false
  @ManyToOne(type => Information, { nullable: false, eager: true })
  @JoinColumn({ name: 'information_id' })
  information: Information;

  @OneToMany(type => Message, message => message.reaction)
  history: Message[];

  @OneToOne(type => Message, message => message.reaction, { eager: true })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(type => Reaction, reaction => reaction.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Reaction;

  @OneToMany(type => Reaction, reaction => reaction.parent)
  replies: Reaction[];

  @OneToMany(type => QuickReaction, sr => sr.reaction)
  quickReactions: QuickReaction[];

  // not @Column(), ok ?
  repliesCount?: number;

  quickReactionsCount?: { [key in QuickReactionType]: number };

  userQuickReaction?: QuickReactionType;

  subscribed?: boolean;
}
