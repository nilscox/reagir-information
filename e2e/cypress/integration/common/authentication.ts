import { Given } from 'cypress-cucumber-preprocessor/steps';

const API_URL = Cypress.env('API_URL');

export const loginOrSignup = ({ email = 'email@domain.tld', password = 'secure p4ssword', nick = 'someone' } = {}) => {
  let user: any = null;

  const setUserOnStatus = (status: number | number[]) => (res: Cypress.Response) => {
    if (Array.isArray(status)) {
      if (status.includes(res.status))
        user = res.body;
    } else if (res.status === status)
      user = res.body;
  };

  const fetchMe = () => {
    return cy.request({ url: API_URL + '/api/auth/me', failOnStatusCode: false })
      .then(setUserOnStatus([200, 304]));
  };

  const login = () => {
    if (user)
      return;

    return cy.request({
      method: 'POST',
      url: API_URL + '/api/auth/login',
      body: { email, password },
      failOnStatusCode: false,
    })
      .then(setUserOnStatus(200));
  };

  const signup = () => {
    if (user)
      return;

    return cy.request({
      method: 'POST',
      url: API_URL + '/api/email/authorize',
      body: { email },
      failOnStatusCode: false,
    })
      .then(() => {
        return cy.request({
          method: 'POST',
          url: API_URL + '/api/auth/signup',
          body: { email, password, nick },
        });
      })
      .then(setUserOnStatus(201));
  };

  return fetchMe()
    .then(login)
    .then(signup);
};

Given('the email {string} is authorized', (email: string) => {
  cy.request({
    method: 'POST',
    url: API_URL + '/api/email/authorize',
    body: { email },
  });
});

Given('I am logged in', () => {
  loginOrSignup();
});
