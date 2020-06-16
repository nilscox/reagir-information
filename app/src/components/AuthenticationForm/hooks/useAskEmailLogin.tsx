import { useEffect, useState } from 'react';

import { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

import useAxios from 'src/hooks/use-axios';
import { FormErrorsHandlers } from 'src/hooks/use-form-errors';
import track from 'src/utils/track';

import { FormFields } from '../types';

const useAskEmailLogin = () => {
  const opts: AxiosRequestConfig = { method: 'POST', url: '/api/auth/ask-email-login' };
  const [{ loading, error, status }, askEmailLogin] = useAxios(opts, null, { manual: true });
  const [email, setEmail] = useState<string>();

  useEffect(() => {
    if (status(204) && email) {
      toast.success(`L'email de connexion a bien été envoyé à l'adresse ${email}`);
      track({ category: 'authentication', action: 'ask-email-login' });
    }
  }, [status, email]);

  const handleAskEmailLogin = (email: string) => {
    setEmail(email);
    askEmailLogin({ data: { email } });
  };

  return [
    handleAskEmailLogin,
    { loading, error },
  ] as const;
};

export default useAskEmailLogin;

export const askEmailLoginErrorsHandlers: FormErrorsHandlers<AxiosError, FormFields> = [
  {
    email: ({ response: { status, data } }) => {
      if (status === 400 && data.email?.isEmail)
        return 'Format d\'adresse email non valide';
    },
  },
  ({ response: { status } }) => {
    if (status === 403)
      return 'Vous êtes déjà connecté.e';
  },
];
