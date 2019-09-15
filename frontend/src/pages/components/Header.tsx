import React from 'react';

import Flex from 'src/components/common/Flex';

const TITLE = 'Chercheurs de vérité';
const SUBTITLE = 'Décryptons l\'information !';

const Header: React.FC = () => (
  <Flex
    flexDirection="row"
    alignItems="center"
    mt={40}
    pb={15}
    style={{ borderBottom: '1px solid #CCC' }}
  >

    <Flex flexDirection="row" alignItems="flex-start" style={{ height: 90 }}>

      <img
        src="/assets/images/logo.png"
        alt="logo"
        style={{ height: '100%', width: 'auto', marginTop: -6, opacity: 0.8 }}
      />

      <Flex flexDirection="column" pl={15}>

        <h1
          style={{
            flex: 1,
            fontSize: '3rem',
            lineHeight: '3rem',
            fontFamily: 'domine',
          }}
        >
          { TITLE }
        </h1>

        <div
          style={{
            flex: 1,
            fontSize: '1.5rem',
            color: '#666',
            letterSpacing: '6px',
            textAlign: 'left',
            marginLeft: 3,
          }}
        >
          { SUBTITLE }
        </div>

      </Flex>

    </Flex>

  </Flex>
);

export default Header;