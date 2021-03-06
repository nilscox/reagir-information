import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Comment } from 'src/modules/comment/comment.entity';
import { User } from 'src/modules/user/user.entity';

export enum ReportModerationAction {
  IGNORED = 'IGNORED',
  DELETED = 'DELETED',
}

@Entity({ name: 'report' })
@Unique(['reportedBy', 'comment'])
export class Report {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reporter_id' })
  reportedBy: User;

  @ManyToOne(() => Comment, { eager: true })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'text', nullable: true })
  message: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'moderator_id' })
  moderatedBy: User;

  @Column({ type: 'enum', enum: ReportModerationAction, nullable: true })
  moderationAction: ReportModerationAction;

  @CreateDateColumn()
  created: Date;

}
