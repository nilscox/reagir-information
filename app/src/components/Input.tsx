import React, { PropsWithoutRef } from 'react';

import { Fade, Input as MUIInput, InputProps as MUIInputProps, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles<Theme, { disabled?: boolean }>(({ spacing, palette }) => ({
  root: ({ disabled }) => ({
    margin: spacing(1, 0),
    borderBottom: `2px solid ${palette.border.main}`,
    '&:hover': {
      borderBottomColor: disabled ? undefined : palette.primary.light,
    },
  }),
  input: {
    padding: spacing(1, 2),
    fontSize: '1rem',
  },
  focused: {
    borderBottomColor: palette.primary.main,
  },
  disabled: {
    backgroundColor: palette.grey[100],
  },
  error: {
    marginTop: spacing(0.5),
    color: palette.error.main,
    fontWeight: 'bold',
    fontSize: 12,
  },
}));

export type InputProps = PropsWithoutRef<Omit<MUIInputProps, 'error'>> & {
  className?: string;
  error?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({ error, ...props }) => {
  const classes = useStyles({ disabled: props.disabled });

  return (
    <>
      <MUIInput
        disableUnderline
        classes={{ root: classes.root, input: classes.input, disabled: classes.disabled, focused: classes.focused }}
        {...props}
      />
      <Fade in={!!error}>
        <div className={classes.error}>{error}&nbsp;</div>
      </Fade>
    </>
  );
};

export default Input;