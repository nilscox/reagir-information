import React, { useState } from 'react';
import ReactModal from 'react-modal';

import { Reaction } from 'src/types/Reaction';

import { ReactionForm } from '../ReactionForm';

import { ReactionHeader } from './ReactionHeader';
import { ReactionBody } from './ReactionBody';
import { ReactionFooter } from './ReactionFooter';
import { ReactionHistoryModalContent } from './ReactionHistoryModalContent';
import { ReportModalContent } from './ReportModalContent';

import './ReactionContent.css';

export type ExpandType = 'fold' | 'default' | 'full';

type ReactionContentProps = {
  reaction: Reaction;
  displayReplies: boolean;
  displayReplyForm: boolean;
  toggleReplies: () => void;
  onShowReplyForm: () => void;
  onReactionUpdated: (reaction: Reaction) => void;
};

const ReactionContent = (props: ReactionContentProps) => {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [edittingReaction, setEdittingReaction] = useState(false);
  const [expand, setExpand] = useState<ExpandType>('default');

  if (edittingReaction) {
    const onReactionSubmitted = (reaction: Reaction) => {
      props.onReactionUpdated(reaction);
      setEdittingReaction(false);
    };

    return (
      <ReactionForm
        preloadedReaction={props.reaction}
        onSubmitted={onReactionSubmitted}
        onClose={() => setEdittingReaction(false)}
      />
    );
  }

  return (
    <div id={`reaction-${props.reaction.id}`} className="reaction">

      <ReactionHeader
        reaction={props.reaction}
        expand={expand}
        onOpenHistory={() => setHistoryModalOpen(true)}
        onEditReaction={() => setEdittingReaction(true)}
        onReportReaction={() => setReportModalOpen(true)}
        setExpand={setExpand}
      />

      <ReactionBody
        reaction={props.reaction}
        expand={expand}
        expandFull={() => setExpand('full')}
      />

      <ReactionFooter
        reaction={props.reaction}
        displayReplies={props.displayReplies}
        displayReplyForm={props.displayReplyForm}
        toggleReplies={props.toggleReplies}
        onShowReplyForm={props.onShowReplyForm}
      />

      { props.reaction.edited && (
        <ReactModal
          isOpen={historyModalOpen}
          onRequestClose={() => setHistoryModalOpen(false)}
          closeTimeoutMS={200}
        >
          <ReactionHistoryModalContent reaction={props.reaction} />
        </ReactModal>
      ) }

      <ReactModal
        portalClassName="ReactModalPortal reaction-report-modal-portal"
        isOpen={reportModalOpen}
        onRequestClose={() => setReportModalOpen(false)}
        closeTimeoutMS={200}
      >
        <ReportModalContent reaction={props.reaction} closeModal={() => setReportModalOpen(false)} />
      </ReactModal>

    </div>
  );
};

export { ReactionContent };