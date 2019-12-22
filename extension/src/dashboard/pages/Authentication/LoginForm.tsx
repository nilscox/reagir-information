import React, { useState, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { AxiosRequestConfig, AxiosError } from 'axios';

import { makeStyles, Theme } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import Flex from 'src/components/common/Flex';

import useAxios from 'src/hooks/use-axios';
import { parseUser } from 'src/types/User';
import useUser from 'src/hooks/use-user';

// TODO: make it common ?
import { useFormErrors, GlobalErrorHandler, FieldErrorsHandler } from 'src/popup/components/Form';

// TODO: make it common ?
const getGlobalError: GlobalErrorHandler = (error: AxiosError) => {
  if (!error || !error.response)
    return;

  const { response: { status, data: { message } } } = error;

  if (status === 401 && message === 'INVALID_CREDENTIALS')
    return 'Combinaison email / mot de passe non valide';

  if (status === 401 && message === 'EMAIL_NOT_VALIDATED')
    return 'Votre adresse email n\'a pas été validée, verifiez dans vos spams !';
};

// TODO: make it common ?
const getFieldErrors: FieldErrorsHandler = (error: AxiosError) => {
  if (!error || !error.response || error.response.status !== 400)
    return;

  const fields = error.response.data;

  const getErrorMessage = (field: string, obj: { [key: string]: string }) => {
    const constraint = Object.keys(obj)[0];

    if (field === 'email' && constraint === 'isEmail')
      return 'Format d\'adresse email non valide';
  };

  return Object.keys(fields)
    .reduce((errors, field) => ({
      [field]: getErrorMessage(field, fields[field]),
      ...errors,
    }), {});
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    '& > div': {
      marginTop: theme.spacing(2),
    },
  },
  globalError: {
    textAlign: 'center',
  },
  buttonWrapper: {
    margin: theme.spacing(1, 0),
    position: 'relative',
    alignSelf: 'center',
  },
  button: {
    fontWeight: 'bold',
  },
  loader: {
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);

  const [currentUser, setUser] = useUser();
  const history = useHistory();
  const classes = useStyles({});

  const opts: AxiosRequestConfig = { method: 'POST', url: '/api/auth/login' };
  const [{ data: user, loading, error, status }, login] = useAxios(opts, parseUser, { manual: true });

  const [globalError, errors = {}, resetErrors] = useFormErrors(error, getGlobalError, getFieldErrors);

  useEffect(() => {
    if (status(200)) {
      setUser(user);
      history.push('/');
    }
  }, [status, user, setUser, history]);

  useEffect(() => void setValid(![email, password].some((value) => value.length <= 0)), [email, password]);

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    login({
      data: {
        email,
        password,
      },
    });
  };

  if (currentUser)
    return <Redirect to="/" />;

  return (
    <form onSubmit={onSubmit}>
      <Flex flexDirection="column" className={classes.container}>

        <TextField
          type="email"
          value={email}
          label="Email"
          required
          variant="outlined"
          margin="dense"
          error={!!errors.email}
          helperText={errors.email}
          onChange={(e) => {
            resetErrors();
            setEmail(e.target.value);
          }}
        />

        <TextField
          type="password"
          value={password}
          label="Mot de passe"
          required
          variant="outlined"
          margin="dense"
          error={!!errors.password}
          helperText={errors.password}
          onChange={(e) => {
            resetErrors();
            setPassword(e.target.value);
          }}
        />

        <FormHelperText error className={classes.globalError}>
          { globalError }
        </FormHelperText>

        <div className={classes.buttonWrapper}>
          <Button type="submit" variant="contained" color="secondary" className={classes.button} disabled={!valid}>
            { loading ? <CircularProgress size={24} className={classes.loader} /> : 'Connexion' }
          </Button>
        </div>

      </Flex>
    </form>
  );
};

export default LoginForm;