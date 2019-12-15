import { Repository, EntityRepository, Brackets } from 'typeorm';

import { Subject } from './subject.entity';

const PAGE_SIZE = 5;

type SubjectReactionsCount = {
  subjectId: number;
  reactionsCount: number;
};

@EntityRepository(Subject)
export class SubjectRepository extends Repository<Subject> {

  async findAll(informationId: number, page = 1): Promise<Subject[]> {
    return this.find({ where: { informationId }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  }

  async search(informationId: number, search: string, page = 1): Promise<Subject[]> {
    return this.createQueryBuilder('subject')
      .leftJoinAndSelect('subject.author', 'author')
      .leftJoinAndSelect('subject.messages', 'messages')
      .where('subject.information_id = :informationId', { informationId })
      .andWhere(new Brackets(qb => {
        qb.where('subject.subject ILIKE :search', { search: `%${search}%` })
          .orWhere('subject.quote ILIKE :search', { search: `%${search}%` })
          .orWhere('messages.text ILIKE :search', { search: `%${search}%` });
      }))
      .skip((page - 1) * PAGE_SIZE)
      .take(PAGE_SIZE)
      .getMany();
  }

  async getTotalReactionsCount(subjectIds: number[]): Promise<SubjectReactionsCount[]> {
    // TODO: subjects.map
    const reactionsCounts = await this.createQueryBuilder('subject')
      .select('subject.id')
      .addSelect('COUNT(r.id)')
      .innerJoin('subject.reactions', 'r')
      .where('subject.id IN (' + subjectIds + ')')
      .groupBy('subject.id')
      .getRawMany();

    return reactionsCounts.map(({ subject_id, count }) => ({
      subjectId: subject_id,
      reactionsCount: Number(count),
    }));
  }

}