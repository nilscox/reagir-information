/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';

import { borderRadius, color, domain } from 'src/theme';

import Reactions from './Reactions/Reactions';
import { ReactionType } from './Reactions/ReactionType';
import RepliesButton from './RepliesButton/RepliesButton';
import ReplyButton from './ReplyButton/ReplyButton';
import SubscribeButton from './SubscribeButton/SubscribeButton';

export const CommentFooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${color('border')};
  border-bottom-left-radius: ${borderRadius(2)};
  border-bottom-right-radius: ${borderRadius(2)};
  background: ${domain('commentLightBackground')};
`;

const Right = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

type CommentFooterProps = {
  userReaction?: ReactionType | null;
  reactionsCounts: Record<ReactionType, number>;
  repliesLoading: boolean;
  repliesCount: number;
  repliesOpen: boolean;
  replyFormOpen: boolean;
  isSubscribed?: boolean;
  authorNick: string;
  onSetReaction?: (reaction: ReactionType | null) => void;
  onSetSubscription?: (subscribed: boolean) => void;
  onToggleReplies?: () => void;
  onReply?: () => void;
};

const CommentFooter: React.FC<CommentFooterProps> = ({
  userReaction,
  reactionsCounts,
  repliesLoading,
  repliesOpen,
  repliesCount,
  replyFormOpen,
  isSubscribed,
  authorNick,
  onSetReaction,
  onSetSubscription,
  onToggleReplies,
  onReply,
}) => (
  <CommentFooterContainer>
    <Reactions counts={reactionsCounts} userReaction={userReaction} onSetReaction={onSetReaction} />

    <RepliesButton
      disabled={replyFormOpen}
      loading={repliesLoading}
      repliesOpen={repliesOpen}
      repliesCount={repliesCount}
      onClick={onToggleReplies}
    />

    <Right>
      {onSetSubscription && isSubscribed !== undefined && (
        <SubscribeButton
          isSubscribed={isSubscribed}
          onClick={() => onSetSubscription(!isSubscribed)}
          css={theme => ({ marginRight: theme.spacings[1] })}
        />
      )}

      {onReply && <ReplyButton isReplyFormOpen={replyFormOpen} authorNick={authorNick} onClick={onReply} />}
    </Right>
  </CommentFooterContainer>
);

export default CommentFooter;
