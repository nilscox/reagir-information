import { DeepPartial, getManager } from 'typeorm';

import { Bookmark } from '../../modules/bookmark/bookmark.entity';

import { createReaction } from './reaction.factory';
import { createUser } from './user.factory';

export const createBookmark = async (data: DeepPartial<Bookmark> = {}) => {
  const manager = getManager();

  if (!data.user)
    data.user = await createUser();

  if (!data.reaction)
    data.reaction = await createReaction();

  const bookmark = manager.create(Bookmark, {
    ...data,
  });

  return manager.save(bookmark);
};
