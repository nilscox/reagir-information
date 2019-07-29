import React from 'react';

import { Subject } from 'src/types/Subject';
import { useTheme } from 'src/utils/Theme';

import Box from 'src/components/common/Box';
import Text from 'src/components/common/Text';
import MarkdownMessage from 'src/components/common/MarkdownMessage';

import SubjectHeader from './SubjectHeader';

type SubjectProps = {
  subject: Subject;
  onHeaderClick?: () => void;
  onViewReactions?: () => void;
};

const ViewReactions: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { sizes: { medium } } = useTheme();

  return (
    <Box my={medium}>
      <Text variant="button" align="center" onClick={onClick}>
        Voir les réactions
      </Text>
    </Box>
  );
};

const SubjectComponent: React.FC<SubjectProps> = ({ subject, onHeaderClick, onViewReactions }) => (
  <>

    <SubjectHeader subject={subject} onClick={onHeaderClick} />
    <MarkdownMessage markdown={subject.text} />
    { onViewReactions && <ViewReactions onClick={onViewReactions} /> }

  </>
);

export default SubjectComponent;
