Feature: Authentication

  Background:
    Given I open the popup

  Scenario: Popup navigation
    Then I see the popup header
    When I click on the link with label "Inscription"
    Then the browser navigates to /popup/signup
    When I click on the link with label "Connexion"
    Then the browser navigates to /popup/login

  Scenario: Redirection to the login page
    Then the browser navigates to /popup/login
    When I navigate to /popup/logout
    Then the browser navigates to /popup/login
    When I navigate to /popup/signup/post-signup
    Then the browser navigates to /popup/login
    When I navigate to /popup/signup/wat
    Then the browser navigates to /popup/login

  Scenario: Redirection to the logout page
    Given I am logged in
    When I open the popup
    Then the browser navigates to /popup/logout
    When I navigate to /popup/login
    Then the browser navigates to /popup/logout
    When I navigate to /popup/signup
    Then the browser navigates to /popup/logout
    When I navigate to /popup/signup/wat
    Then the browser navigates to /popup/logout

  Scenario: Account creation
    Given the database is empty
    And the email "email@domain.tld" is authorized
    When I navigate to /popup/signup
    And I type "email@domain.tld" in the "Email" field
    And I type "secure p4ssword" in the "Mot de passe" field
    And I type "someone" in the "Pseudo" field
    Then the button with label "Inscription" is disabled
    When I accept the rules
    Then the button with label "Inscription" is not disabled
    When I click on the button with label "Inscription"
    Then the browser navigates to /popup/signup/post-signup
    And I read "un email vous a été envoyé à email@domain.tld"

  Scenario: Account creation - existing nick
    Given I am logged out
    When I open the popup
    When I navigate to /popup/signup
    And I submit the signup form with values "email@domain.tld", "secure p4ssword" and "someone"
    Then I read "Ce pseudo est déjà utilisé."

  Scenario: Account creation - existing email
    When I navigate to /popup/signup
    And I submit the signup form with values "email@domain.tld", "secure p4ssword" and "likeyou"
    Then I read "Cette adresse email est déjà utilisée."

  Scenario: Account creation - unsecure password
    When I navigate to /popup/signup
    And I submit the signup form with values "other@domain.tld", "likeyou" and "likeyou"
    Then I read "Ce mot de passe n'est pas assez sécurisé."

  Scenario: Account creation - invalid email format
    When I navigate to /popup/signup
    And I submit the signup form with values "other@domain", "secure p4ssword" and "likeyou"
    Then I read "Format d'adresse email invalide."

  Scenario: Account creation - unauthorized email
    When I navigate to /popup/signup
    And I submit the signup form with values "other@domain", "secure p4ssword" and "likeyou"
    Then I read "Format d'adresse email invalide."

  Scenario: Account creation - password too short
    When I navigate to /popup/signup
    And I submit the signup form with values "other@domain.tld", "mdp" and "likeyou"
    Then I read "Ce mot de passe est trop court."

  Scenario: Login
    When I navigate to /popup/login
    And I type "email@domain.tld" in the "Email" field
    Then the button with label "Connexion" is disabled
    When I type "secure p4ssword" in the "Mot de passe" field
    Then the button with label "Connexion" is not disabled
    When I click on the button with label "Connexion"
    Then the browser navigates to /popup/logout
    And I read "Vous êtes connecté(e) sur Réagir à l'information en tant que someone."

  Scenario: Login - invalid credentials
    When I navigate to /popup/login
    And I submit the login form with values "email@domain.tld" and "p4ssword secure"
    Then I read "Combinaison email / mot de passe non valide"

  Scenario: Login - invalid email format
    When I navigate to /popup/login
    And I submit the login form with values "email@domain" and "secure p4ssword"
    Then I read "Format d'adresse email non valide"

  Scenario: Logout
    Given I am logged in
    When I open the popup
    Then the button with label "Déconnexion" is not disabled
    When I click on the button with label "Déconnexion"
    Then the browser navigates to /popup/login
