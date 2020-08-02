import request from 'supertest';
import { getCustomRepository, getRepository, Repository } from 'typeorm';

import { createAuthenticatedUser, setupE2eTest } from '../../testing/setup-e2e-test';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Information } from '../information/information.entity';
import { InformationFactory } from '../information/information.factory';
import { UserFactory } from '../user/user.factory';

import { Comment } from './comment.entity';
import { CommentFactory } from './comment.factory';
import { CommentModule } from './comment.module';
import { CommentRepository } from './comment.repository';
import { Reaction, ReactionType } from './reaction.entity';
import { Subscription } from './subscription/subscription.entity';
import { SubscriptionFactory } from './subscription/subscription.factory';

describe('comment controller', () => {

  const { server, getTestingModule } = setupE2eTest({
    imports: [CommentModule, AuthenticationModule],
  }, moduleBuilder => {
    moduleBuilder
      .overrideProvider('COMMENT_PAGE_SIZE')
      .useValue(2);
  });

  let createUser: UserFactory['create'];
  let createInformation: InformationFactory['create'];
  let createComment: CommentFactory['create'];
  let createsubscription: SubscriptionFactory['create'];

  let commentRepository: CommentRepository;
  let reactionRepository: Repository<Reaction>;
  let subscriptionRepository: Repository<Subscription>;

  let information: Information;

  let comment: Comment;

  let reply1: Comment;
  let reply2: Comment;
  let reply3: Comment;

  beforeAll(async () => {
    const module = getTestingModule();

    const userFactory = module.get<CommentFactory>(CommentFactory);
    const informationFactory = module.get<InformationFactory>(InformationFactory);
    const commentFactory = module.get<CommentFactory>(CommentFactory);
    const subscriptionFactory = module.get<CommentFactory>(CommentFactory);

    createUser = userFactory.create.bind(userFactory);
    createInformation = informationFactory.create.bind(informationFactory);
    createComment = commentFactory.create.bind(commentFactory);
    createsubscription = subscriptionFactory.create.bind(subscriptionFactory);

    commentRepository = getCustomRepository(CommentRepository);
    reactionRepository = getRepository(Reaction);
    subscriptionRepository = getRepository(Subscription);

    const user = await createUser();

    information = await createInformation();

    comment = await createComment({
      author: user,
      information,
      text: 'message2',
      history: ['message1'],
    });

    reply1 = await createComment({ information, parent: comment });
    reply2 = await createComment({ information, parent: comment });
    reply3 = await createComment({ information, parent: comment });
  });

  describe('get for user', () => {

    const [userRequest, user] = createAuthenticatedUser(server);

    let information1: Information;
    let information2: Information;
    let comment1: Comment;
    let comment2: Comment;
    let comment3: Comment;
    let comment4: Comment;

    beforeAll(async () => {
      information1 = await createInformation();
      information2 = await createInformation();

      comment1 = await createComment({ information: information1, author: user });

      comment2 = await createComment({ information: information2, author: user });
      // await createComment({ information: information2 });

      comment3 = await createComment({ information: information1, author: user });
      comment4 = await createComment({ information: information1, author: user });
    });

    it('should not get comments created by a specific user when unauthenticated', () => {
      return request(server)
        .get('/api/comment/me')
        .expect(403);
    });

    it('should get comments created by a specific user', async () => {
      const { body } = await userRequest
        .get('/api/comment/me')
        .expect(200);

      // .toMatchObject makes the output hard to debug
      expect(body).toHaveProperty('total', 4);
      expect(body).toHaveProperty('items.0.id', information1.id);
      expect(body).toHaveProperty('items.0.comments.0.id', comment4.id);
      expect(body).toHaveProperty('items.0.comments.1.id', comment3.id);
    });

    it('should get comments created by a specific user on page 2', async () => {
      const { body } = await userRequest
        .get('/api/comment/me')
        .query({ page: 2 })
        .expect(200);

      expect(body).toHaveProperty('total', 4);
      expect(body).toHaveProperty('items.0.id', information1.id);
      expect(body).toHaveProperty('items.0.comments.0.id', comment1.id);
      expect(body).toHaveProperty('items.1.id', information2.id);
      expect(body).toHaveProperty('items.1.comments.0.id', comment2.id);
    });

  });

  describe('get comment by id', () => {

    it('should get one comment', () => {
      return request(server)
        .get(`/api/comment/${comment.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: comment.id,
            // date: expect.any(String),
          });
        });
    });

    it('should get the comment history', () => {
      return request(server)
        .get(`/api/comment/${comment.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject({
            text: 'message2',
            history: [{ text: 'message2' }, { text: 'message1' }],
          });
        });
    });

  });

  describe('get replies', () => {

    it('should not get replies for an unexisting comment', () => {
      return request(server)
        .get('/api/comment/404/replies')
        .expect(404);
    });

    it('should get replies on page 1', () => {
      return request(server)
        .get(`/api/comment/${comment.id}/replies`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject({
            items: [
              { id: reply1.id },
              { id: reply2.id },
            ],
            total: 3,
          });
        });
    });

    it('should get replies on page 2', () => {
      return request(server)
        .get(`/api/comment/${comment.id}/replies`)
        .query({ page: 2 })
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject({
            items: [
              { id: reply3.id },
            ],
            total: 3,
          });
        });
    });

  });

  describe('subscribe to a comment', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    it('should not subscribe when unauthenticated', () => {
      return request(server)
        .post(`/api/comment/${comment.id}/subscribe`)
        .expect(403);
    });

    it('should not subscribe to an unexisting comment', () => {
      return userRequest
        .post('/api/comment/404/subscribe')
        .expect(404);
    });

    it('should not subscribe to a comment twice', async () => {
      const comment = await createComment();
      await createsubscription({ comment, user });

      return userRequest
        .post(`/api/comment/${comment.id}/subscribe`)
        .expect(409);
    });

    it('subscribe to a comment', async () => {
      const comment = await createComment();

      await userRequest
        .post(`/api/comment/${comment.id}/subscribe`)
        .expect(201);

      const subscriptionDb = await subscriptionRepository.findOne({ user, comment });

      expect(subscriptionDb).toBeDefined();
    });
  });

  describe('unsubscribe from a comment', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    it('should not subscribe when unauthenticated', () => {
      return request(server)
        .post(`/api/comment/${comment.id}/unsubscribe`)
        .expect(403);
    });

    it('should not subscribe to an unexisting comment', () => {
      return userRequest
        .post('/api/comment/404/unsubscribe')
        .expect(404);
    });

    it('unsubscribe to a comment', async () => {
      const comment = await createComment();
      await createsubscription({ user, comment });

      await userRequest
        .post(`/api/comment/${comment.id}/unsubscribe`)
        .expect(204);

      const subscriptionDb = await subscriptionRepository.findOne({ user, comment });

      expect(subscriptionDb).not.toBeDefined();
    });
  });

  describe('set the subscribed field when subscribed to a comment', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    it('should not set the subscribed field when unauthenticated', async () => {
      const comment = await createComment();

      const { body } = await request(server)
        .get(`/api/comment/${comment.id}`)
        .expect(200);

      expect(body.subscribed).not.toBeDefined();
    });

    it('should set the subscribed field to false when not subscribed to a comment', async () => {
      const comment = await createComment();

      const { body } = await userRequest
        .get(`/api/comment/${comment.id}`)
        .expect(200);

      expect(body).toMatchObject({ subscribed: false });
    });

    it('should set the subscribed field to true when subscribed to a comment', async () => {
      const comment = await createComment();
      await createsubscription({ user, comment });

      const { body } = await userRequest
        .get(`/api/comment/${comment.id}`)
        .expect(200);

      expect(body).toMatchObject({ subscribed: true });
    });

  });

  describe('create comment', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    const makeComment = (informationId: number) => ({
      informationId,
      text: 'new comment',
    });

    it('should not create a comment when not authenticated', () => {
      const comment = makeComment(information.id);

      return request(server)
        .post('/api/comment')
        .send(comment)
        .expect(403);
    });

    it('should not create a comment with missing informationId', () => {
      const comment = makeComment(information.id);
      delete comment.informationId;

      return userRequest
        .post('/api/comment')
        .send(comment)
        .expect(400);
    });

    it('should not create a comment with unexisting informationId', () => {
      const comment = makeComment(information.id);
      comment.informationId = 404;

      return userRequest
        .post('/api/comment')
        .send(comment)
        .expect(400);
    });

    it('should not create a recation with missing text', () => {
      const comment = makeComment(information.id);
      delete comment.text;

      return userRequest
        .post('/api/comment')
        .send(comment)
        .expect(400);
    });

    it('should create a comment', async () => {
      const comment = makeComment(information.id);

      const { body } = await userRequest
        .post('/api/comment')
        .send(comment)
        .expect(201);

      expect(body).toMatchObject({
        author: { id: user.id },
        text: comment.text,
      });

      const commentDb = await commentRepository.findOne(body.id);

      expect(commentDb).toBeDefined();
    });

    it('should be subscribed to a created comment', async () => {
      const comment = makeComment(information.id);

      const { body } = await userRequest
        .post('/api/comment')
        .send(comment)
        .expect(201);

      expect(body).toMatchObject({
        subscribed: true,
      });

      const subscriptionDb = await subscriptionRepository.findOne({
        where: {
          comment: { id : body.id },
        },
      });

      expect(subscriptionDb).toBeDefined();
    });

  });

  describe('update comment', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    it('should not update a comment when not authenticated', () => {
      return request(server)
        .put(`/api/comment/${comment.id}`)
        .expect(403);
    });

    it('should not update an unexisting comment', () => {
      return userRequest
        .put('/api/comment/404')
        .expect(404);
    });

    it('should not update a comment that does not belong to the authenticated user', () => {
      return userRequest
        .put(`/api/comment/${comment.id}`)
        .expect(403);
    });

    it('should update a comment', async () => {
      const comment = await createComment({ author: user });

      const { body } = await userRequest
        .put(`/api/comment/${comment.id}`)
        .send({ text: 'edited' })
        .expect(200);

      expect(body).toMatchObject({
        text: 'edited',
      });
    });

  });

  describe('reaction', () => {
    const [userRequest, user] = createAuthenticatedUser(server);

    it('should not create a reaction when not authenticated', () => {
      return request(server)
        .post(`/api/comment/${comment.id}/reaction`)
        .expect(403);
    });

    it('should not create a reaction with invalid type', () => {
      return userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: 'AGREE' })
        .expect(400);
    });

    it('should not create a reaction on own comment', async () => {
      const comment = await createComment({ author: user });

      return userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.APPROVE })
        .expect(403);
    });

    it('should create a reaction', async () => {
      const { body } = await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.APPROVE })
        .expect(201);

      expect(body).toMatchObject({
        reactionsCount: {
          APPROVE: 1,
          REFUTE: 0,
          SKEPTIC: 0,
        },
        userReaction: 'APPROVE',
      });

      const reactionDb = await reactionRepository.findOne(body.id);

      expect(reactionDb).toMatchObject({ type: ReactionType.APPROVE });
    });

    it('should update a reaction', async () => {
      const { body } = await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.SKEPTIC })
        .expect(201);

      expect(body).toMatchObject({
        reactionsCount: {
          APPROVE: 0,
          REFUTE: 0,
          SKEPTIC: 1,
        },
        userReaction: 'SKEPTIC',
      });

      const reactionDb = await reactionRepository.findOne(body.id);

      expect(reactionDb).toMatchObject({ type: ReactionType.SKEPTIC });
    });

    it('should remove a reaction', async () => {
      const { body } = await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: null })
        .expect(201);

      expect(body).toMatchObject({
        reactionsCount: {
          APPROVE: 0,
          REFUTE: 0,
          SKEPTIC: 0,
        },
      });

      expect(body).not.toHaveProperty('userReaction');

      const reactionDb = await reactionRepository.findOne(body.id);

      expect(reactionDb).toMatchObject({ type: null });
    });

  });

  describe('score', () => {
    const [userRequest] = createAuthenticatedUser(server);
    const [userRequest2] = createAuthenticatedUser(server);

    beforeAll(async () => {
      information = await createInformation();
      comment = await createComment({ information });
    });

    it('should increment a comment score by 2 when a reply is created', async () => {
      await userRequest
        .post('/api/comment')
        .send({
          informationId: information.id,
          parentId: comment.id,
          text: 'text',
        })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 2,
      });
    });

    // this is odd, but can still be achived by calling the api directly
    it('should not update the score when a reaction is created with type null', async () => {
      await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: null })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 2,
      });
    });

    it('should increment a comment score when a reaction is created', async () => {
      await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.APPROVE })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 3,
      });
    });

    it('should not change a comment score when a reaction is updated', async () => {
      await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.SKEPTIC })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 3,
      });
    });

    it('should decrement a comment score when a reaction is removed', async () => {
      await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: null })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 2,
      });
    });

    it('should reincrement a comment score when a reaction is recreated', async () => {
      await userRequest
        .post(`/api/comment/${comment.id}/reaction`)
        .send({ type: ReactionType.APPROVE })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 3,
      });
    });

    it('should increment a parent comment score when a reaction is created', async () => {
      const child = await commentRepository.findOne({ parent: comment });

      await userRequest2
        .post(`/api/comment/${child.id}/reaction`)
        .send({ type: ReactionType.APPROVE })
        .expect(201);

      const commentDb = await commentRepository.findOne(comment.id);

      expect(commentDb).toMatchObject({
        score: 4,
      });
    });

  });

});