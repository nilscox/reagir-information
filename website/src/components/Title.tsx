import React from 'react';

const Title: React.FC<{ id: string }> = ({ id, children }) => (
  <h2 id={id.replace(' ', '_')}>{ children }</h2>
);

export default Title;
