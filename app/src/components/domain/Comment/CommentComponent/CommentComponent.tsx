import React from 'react';

import styled from '@emotion/styled';

import { borderRadius, color } from 'src/theme';
import { Comment as CommentType } from 'src/types/Comment';

import CommentBody from '../CommentBody/CommentBody';
import CommentFooter from '../CommentFooter/CommentFooter';
import { ReactionType } from '../CommentFooter/Reactions/ReactionType';
import CommentHeader from '../CommentHeader/CommentHeader';

export const CommentContainer = styled.div`
  border: 1px solid ${color('border')};
  border-radius: ${borderRadius(2)};
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1), 0 1px 3px 1px rgba(0, 0, 0, 0.08);
`;

type CommentComponentProps = {
  comment: CommentType;
  isPin?: boolean;
  repliesOpen: boolean;
  repliesLoading: boolean;
  replyFormOpen: boolean;
  onPin?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
  onSetReaction?: (type: ReactionType | null) => void;
  onToggleReplies?: () => void;
  onReply?: () => void;
  onSetSubscription?: (subscribed: boolean) => void;
  onViewHistory?: () => void;
};

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  isPin,
  repliesOpen,
  repliesLoading,
  replyFormOpen,
  onPin,
  onEdit,
  onReport,
  onSetReaction,
  onToggleReplies,
  onReply,
  onSetSubscription,
  onViewHistory,
}) => (
  <CommentContainer>
    <CommentHeader
      isPin={isPin}
      author={comment.author}
      edited={Boolean(comment.edited)}
      date={new Date(comment.edited || comment.date)}
      onEdit={onEdit}
      onReport={onReport}
      onViewHistory={onViewHistory}
      onPin={onPin}
    />

    <CommentBody text={comment.text} />

    <CommentFooter
      userReaction={comment.userReaction}
      reactionsCounts={comment.reactionsCount}
      repliesLoading={repliesLoading}
      repliesCount={comment.repliesCount}
      repliesOpen={repliesOpen}
      replyFormOpen={replyFormOpen}
      isSubscribed={comment.subscribed}
      authorNick={comment.author.nick}
      onSetReaction={onSetReaction}
      onToggleReplies={onToggleReplies}
      onReply={onReply}
      onSetSubscription={onSetSubscription}
    />
  </CommentContainer>
);

export default CommentComponent;
