import React from 'react';

import { render } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Route, Router } from 'react-router-dom';

import { UserContext } from 'src/contexts/UserContext';
import mockAxios, { mockAxiosResponseFor } from 'src/testing/jest-mock-axios';
import { User } from 'src/types/User';

import CommentsAreaPage from '../index';

import '@testing-library/jest-dom/extend-expect';

const mockUser: User = { id: 1 } as User;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCommentsArea: any = {
  id: 1,
  title: 'FAKE new',
  url: 'http://fakenew.fake',
  image: null,
  creator: {
    id: 1,
    nick: 'nick',
    avatar: null,
  },
  commentsCount: 0,
};

const UserProvider = UserContext.Provider;

describe.skip('CommentsAreaPage', () => {
  let history: MemoryHistory;

  beforeEach(() => {
    history = createMemoryHistory();
    history.push('/commentaires');
  });

  describe('Notifications count', () => {
    afterEach(() => {
      mockAxios.reset();
    });

    it('should display information title', async () => {
      history.push('/commentaires/1/comments');

      const { getByText } = render(
        <Router history={history}>
          <UserProvider value={[mockUser, () => {}]}>
            <Route path="/commentaires/:id" component={CommentsAreaPage} />
          </UserProvider>
        </Router>,
      );

      await mockAxiosResponseFor(
        { url: '/api/commentaires/1' },
        { data: mockCommentsArea },
      );

      expect(getByText('FAKE new')).toBeVisible();
    });

    it('should set notification as seen and refetch notifications count', async () => {
      history.push('/commentaires/1/comments', { notificationId: 1 });

      render(
        <Router history={history}>
          <UserProvider value={[mockUser, () => {}]}>
            <Route path="/commentaires/:id" component={CommentsAreaPage} />
          </UserProvider>
        </Router>,
      );

      await mockAxiosResponseFor(
        { url: '/api/commentaires/1' },
        { data: mockCommentsArea },
      );

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/notification/1/seen',
        }),
      );

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/notification/me/count',
        }),
      );
    });
  });
});