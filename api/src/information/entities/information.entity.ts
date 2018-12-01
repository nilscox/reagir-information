import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Expose, Exclude, Type } from 'class-transformer';

import { User } from 'User/entities/user.entity';
import { Reaction, ReactionWithoutHistory } from './reaction.entity';

@Entity()
@Exclude()
export class Information {

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  url: string;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  slug: string;

  @Column({ nullable: true })
  @Expose()
  image: string;

  @Column({ nullable: true })
  youtubeId: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @ManyToOne(type => User, user => user.informations, { eager: true })
  @Expose()
  creator: User;

  @OneToMany(type => Reaction, reaction => reaction.information)
  @Expose()
  @Type(() => ReactionWithoutHistory)
  reactions: Reaction[];

}