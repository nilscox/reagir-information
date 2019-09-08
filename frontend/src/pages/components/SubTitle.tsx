import React from 'react';

type SubTitleProps = {
  children: React.ReactNode;
};

const SubTitle: React.FC<SubTitleProps> = ({ children }) => (
  <h3 style={{ fontSize: '1.5rem', lineHeight: '1.5rem', margin: 25, marginTop: 40 }}>{ children }</h3>
);

export default SubTitle;
