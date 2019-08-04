import React, { useState } from 'react';
import moment from 'moment';

import { Subject } from 'src/types/Subject';
import { useTheme } from 'src/utils/Theme';

import Flex from 'src/components/common/Flex';
import Text from 'src/components/common/Text';

type SubjectHeaderProps = {
  subject: Subject;
  transparent?: boolean;
  onClick?: () => void;
};

const SubjectHeader: React.FC<SubjectHeaderProps> = ({ subject: { subject, author, date }, transparent, onClick }) => {
  const [hover, setHover] = useState(false);
  const {
    sizes: { medium, big },
    colors,
    borderRadius,
  } = useTheme();

  return (
    <Flex
      py={medium}
      px={big}
      flexDirection="row"
      alignItems="center"
      style={{
        backgroundColor: (!transparent || hover) && colors.backgroundLight,
        borderBottom: `1px solid ${colors.borderLight}`,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        cursor: onClick && 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >

      <div style={{ maxWidth: '100%' }}>
        <Text oneline variant="subject-title" size="big">{ subject }</Text>
        <Text variant="note" size="small">Par <b>{ author.nick }</b>, le { moment(date).format('DD.MM.YYYY') }</Text>
      </div>

    </Flex>
  );
};

export default SubjectHeader;