import React from 'react';

import { Link as ReactRouterLink } from 'react-router-dom';

type LinkProps = React.PropsWithRef<React.HTMLProps<HTMLAnchorElement>> & {
  openInNewTab?: boolean;
};

const Link: React.FC<LinkProps> = ({ openInNewTab = false, href, ...props }) => {
  if (openInNewTab) {
    return <a target="_blank" rel="noopener noreferrer" href={href} {...props} />;
  }

  return <ReactRouterLink to={href || ''} {...props} />;
};

export default Link;
