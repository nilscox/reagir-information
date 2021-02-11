import React, { ComponentProps } from 'react';

import styled from '@emotion/styled';
import clsx from 'clsx';
import { darken } from 'polished';

import { borderRadius, color, fontSize, fontWeight, spacing, textColor, transition } from 'src/theme';

const StyledInput = styled.input`
  border: none;
  border-bottom: 2px solid ${color('border')};
  padding: ${spacing(1, 0)};
  font-size: ${fontSize('default')};
  color: ${textColor('default')};
  outline: none;
  box-sizing: border-box;
  transition: ${transition('fast', 'border-bottom-color')};

  &.outlined {
    padding: ${spacing(1, 2)};
    border-top: 1px solid ${color('border')};
    border-left: 1px solid ${color('border')};
    border-right: 1px solid ${color('border')};
    border-radius: ${borderRadius(2)};
  }

  &.full-width {
    width: 100%;
  }

  &:hover,
  &:focus {
    border-bottom-color: ${color('primary')};
  }

  &:disabled {
    border-bottom-color: ${color('border')};
    background-color: ${color('disabled')};
  }
`;

const Error = styled.div`
  margin-top: ${spacing(0.5)};
  color: ${color('error', darken(0.15))};
  font-size: ${fontSize('small')};
  font-weight: ${fontWeight('bold')};
`;

export type InputProps = ComponentProps<typeof StyledInput> & {
  outlined?: boolean;
  fullWidth?: boolean;
  error?: React.ReactNode;
  consistentHeight?: boolean;
};

const Input: React.FC<InputProps> = ({ outlined, fullWidth, error, consistentHeight, ...props }) => (
  <>
    <StyledInput {...props} className={clsx(outlined && 'outlined', fullWidth && 'full-width', props.className)} />
    {(error || consistentHeight) && <Error>{error || <>&nbsp;</>}</Error>}
  </>
);

export default Input;