import React from 'react';

import { act, render, wait, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import mockAxios, { mockAxiosResponseFor, mockAxiosError } from 'src/testing/jest-mock-axios';
import { UserProvider } from 'src/utils/UserContext';

import LoginForm from '../LoginForm';

const mockUser: any = {
  id: 1,
  nick: 'nick',
  avatar: null,
  email: 'email@domain.tld',
  created: new Date().toString(),
  updated: new Date().toString(),
};

describe('LoginForm', () => {

  afterEach(() => {
    mockAxios.reset();
  });

  it('should login', async () => {
    const setUser = jest.fn();
    const { getByTestId, getByLabelText } = render(
      <BrowserRouter>
        <UserProvider value={{ user: null, setUser }}>
          <LoginForm />
        </UserProvider>
      </BrowserRouter>,
    );

    await act(async () => {
      await userEvent.type(getByLabelText('Email *'), 'user@domain.tld');
      await userEvent.type(getByLabelText('Mot de passe *'), 'secure p4ssword');
    });

    act(() => {
      fireEvent.submit(getByTestId('login-form'));
    });

    await mockAxiosResponseFor(
      { method: 'POST', url: '/api/auth/login' },
      { data: mockUser },
    );

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: 'user@domain.tld',
          password: 'secure p4ssword',
        },
      }),
    );

    expect(setUser).toHaveBeenCalled();
  });

  it('should not login when sending invalid credentials', async () => {
    const setUser = jest.fn();
    const { getByTestId, getByLabelText, getByText } = render(
      <BrowserRouter>
        <UserProvider value={{ user: null, setUser }}>
          <LoginForm />
        </UserProvider>
      </BrowserRouter>,
    );

    await act(async () => {
      await userEvent.type(getByLabelText('Email *'), 'user@domain.tld');
      await userEvent.type(getByLabelText('Mot de passe *'), 'secure p4ssword');
    });

    act(() => {
      fireEvent.submit(getByTestId('login-form'));
    });

    await mockAxiosError({
      response: {
        status: 401,
        data: { message: 'INVALID_CREDENTIALS' },
      },
    });

    expect(getByText('Combinaison email / mot de passe non valide')).toBeInTheDocument();
  });

});
