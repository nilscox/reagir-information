import request from 'supertest';
import { getRepository, Repository } from 'typeorm';

import { AuthenticationModule } from 'src/modules/authentication/authentication.module';
import { Notification } from 'src/modules/notification/notification.entity';
import { createAuthenticatedModerator, createAuthenticatedUser, setupE2eTest } from 'src/testing/setup-e2e-test';

import { CommentsAreaRequest, CommentsAreaRequestStatus } from './comments-area-request.entity';
import { CommentsAreaRequestFactory } from './comments-area-request.factory';
import { CommentsAreaRequestModule } from './comments-area-request.module';

describe('comments area request controller', () => {
  const { server } = setupE2eTest({
    imports: [AuthenticationModule, CommentsAreaRequestModule],
  });

  let commentsAreaRequestRepository: Repository<CommentsAreaRequest>;
  let notificationRepository: Repository<Notification>;

  const commentsAreaRequestFactory = new CommentsAreaRequestFactory();

  beforeAll(() => {
    commentsAreaRequestRepository = getRepository(CommentsAreaRequest);
    notificationRepository = getRepository(Notification);
  });

  describe('list pending requests', () => {
    let request1: CommentsAreaRequest;
    let request2: CommentsAreaRequest;

    beforeAll(async () => {
      request1 = await commentsAreaRequestFactory.create();
      request2 = await commentsAreaRequestFactory.create();
    });

    const [asUser] = createAuthenticatedUser(server);
    const [asModerator] = createAuthenticatedModerator(server);

    it('should not list pending requests when not a moderator', async () => {
      await request(server).get('/api/comments-area/request').expect(403);
      await asUser.get('/api/comments-area/request').expect(403);
    });

    it('should list pending requests', async () => {
      const { body } = await asModerator.get('/api/comments-area/request').expect(200);

      expect(body).toMatchObject({
        total: 2,
        items: [{ id: request1.id }, { id: request2.id }],
      });
    });

    it('should list pending requests paginated', async () => {
      const { body: page1 } = await asModerator.get('/api/comments-area/request').query({ pageSize: 1 }).expect(200);

      expect(page1).toMatchObject({
        total: 2,
        items: [{ id: request1.id }],
      });

      const { body: page2 } = await asModerator
        .get('/api/comments-area/request')
        .query({ pageSize: 1, page: 2 })
        .expect(200);

      expect(page2).toMatchObject({
        total: 2,
        items: [{ id: request2.id }],
      });
    });
  });

  describe('create a new request', () => {
    const [asUser1, user1] = createAuthenticatedUser(server);
    const [asUser2] = createAuthenticatedUser(server);

    const informationUrl = 'https://info.url/articles/1';

    it('should not request to open a new comments area when not authenticated', async () => {
      await request(server).get('/api/comments-area/request').expect(403);
    });

    it('should request to create a new comment area', async () => {
      const { body } = await asUser1.post('/api/comments-area/request').send({ informationUrl }).expect(201);

      expect(body).toMatchObject({ informationUrl });

      const request1Db = await commentsAreaRequestRepository.findOne(body.id);

      expect(request1Db).toMatchObject({
        id: body.id,
        requester: { id: user1.id },
        status: CommentsAreaRequestStatus.PENDING,
      });
    });

    it('should be possible to request to create the same comment area twice', async () => {
      await asUser1.post('/api/comments-area/request').send({ informationUrl }).expect(201);
    });

    it('should request to open the same comments area from another user', async () => {
      await asUser2.post('/api/comments-area/request').send({ informationUrl }).expect(201);
    });

    it('should request to create a new comments area with full payload', async () => {
      const payload = {
        identifier: 'id:1',
        informationUrl,
        informationTitle: 'title',
        informationAuthor: 'autor',
        informationPublicationDate: new Date(2020, 1, 10).toISOString(),
      };

      const { body } = await asUser1.post('/api/comments-area/request').send(payload).expect(201);

      expect(body).toMatchObject(payload);
    });
  });

  describe('reject a request', () => {
    const [asUser] = createAuthenticatedUser(server);
    const [asModerator, moderator] = createAuthenticatedModerator(server);

    it('should not reject a request when not a moderator', async () => {
      await request(server).post('/api/comments-area/request/42/reject').expect(403);
      await asUser.post('/api/comments-area/request/42/reject').expect(403);
    });

    it('should reject a request', async () => {
      const request = await commentsAreaRequestFactory.create();

      await asModerator.post(`/api/comments-area/request/${request.id}/reject`).expect(200);

      const requestDb = await commentsAreaRequestRepository.findOne(request.id, { relations: ['moderator'] });

      expect(requestDb).toMatchObject({
        status: CommentsAreaRequestStatus.REJECTED,
        moderator: { id: moderator.id },
      });
    });
  });

  describe('notification after a moderation action', () => {
    const informationUrl = 'https://info.url/articles/2';

    const [asUser1, user1] = createAuthenticatedUser(server);
    const [asUser2, user2] = createAuthenticatedUser(server);
    const [asModerator] = createAuthenticatedModerator(server);

    it('should send a notification when a request is approved', async () => {
      const payload = {
        identifier: 'id:2',
        informationUrl,
        informationTitle: 'title',
        informationAuthor: 'autor',
        informationPublicationDate: new Date(2020, 1, 10).toISOString(),
      };

      await asUser1.post('/api/comments-area/request').send({ informationUrl }).expect(201);
      await asUser2.post('/api/comments-area/request').send({ informationUrl }).expect(201);
      const { body } = await asModerator.post('/api/comments-area').send(payload).expect(201);

      const notifications = await notificationRepository
        .createQueryBuilder('notification')
        .innerJoinAndSelect('notification.user', 'user')
        .where("notification.payload->>'commentsAreaId' = :commentsAreaId", { commentsAreaId: body.id })
        .getMany();

      expect(notifications).toHaveLength(2);
      expect(notifications).toMatchObject([
        {
          type: 'commentsAreaRequestApproved',
          payload: {
            requestedInformationUrl: informationUrl,
            commentsAreaId: body.id,
            commentsAreaTitle: 'title',
          },
          user: expect.objectContaining({ id: user1.id }),
        },
        {
          user: expect.objectContaining({ id: user2.id }),
        },
      ]);
    });

    it('should send a notification when a request is rejected', async () => {
      const { body } = await asUser1.post('/api/comments-area/request').send({ informationUrl }).expect(201);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      await asModerator.post(`/api/comments-area/request/${body.id}/reject`).send({ reason: 'reason' }).expect(200);

      const notifications = await notificationRepository
        .createQueryBuilder('notification')
        .innerJoinAndSelect('notification.user', 'user')
        .where("notification.payload->>'requestId' = :requestId", { requestId: body.id })
        .getMany();

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        type: 'commentsAreaRequestRejected',
        payload: { requestedInformationUrl: informationUrl, reason: 'reason' },
        user: expect.objectContaining({ id: user1.id }),
      });
    });
  });
});
