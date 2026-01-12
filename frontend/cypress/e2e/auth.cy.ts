/// <reference types="cypress" />

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should display login page', () => {
      cy.visit('/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('test@polybazar.com');
      cy.get('[data-testid="password-input"]').type('Test123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@login');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('wrong@email.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });

    it('should validate email format', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.get('[data-testid="email-error"]').should('be.visible');
    });

    it('should redirect to originally requested page after login', () => {
      cy.visit('/sell/new');
      cy.url().should('include', '/login');

      cy.get('[data-testid="email-input"]').type('test@polybazar.com');
      cy.get('[data-testid="password-input"]').type('Test123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@login');
      cy.url().should('include', '/sell/new');
    });
  });

  describe('Registration', () => {
    it('should display registration page', () => {
      cy.visit('/register');
      cy.get('[data-testid="register-form"]').should('be.visible');
    });

    it('should register new user as buyer', () => {
      const email = `test-${Date.now()}@polybazar.com`;

      cy.visit('/register');
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type('SecurePass123!');
      cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
      cy.get('[data-testid="company-name"]').type('Test Company Ltd');
      cy.get('[data-testid="role-buyer"]').click();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@register');
      cy.url().should('not.include', '/register');
    });

    it('should register new user as seller', () => {
      const email = `seller-${Date.now()}@polybazar.com`;

      cy.visit('/register');
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type('SecurePass123!');
      cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
      cy.get('[data-testid="company-name"]').type('Seller Company Ltd');
      cy.get('[data-testid="role-seller"]').click();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@register');
      cy.url().should('include', '/kyc');
    });

    it('should validate password strength', () => {
      cy.visit('/register');
      cy.get('[data-testid="password-input"]').type('weak');
      cy.get('[data-testid="password-strength"]').should('contain', 'Weak');
    });

    it('should show error for duplicate email', () => {
      cy.visit('/register');
      cy.get('[data-testid="email-input"]').type('existing@polybazar.com');
      cy.get('[data-testid="password-input"]').type('SecurePass123!');
      cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
      cy.get('[data-testid="company-name"]').type('Test Company');
      cy.get('[data-testid="role-buyer"]').click();
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="error-message"]').should('contain', 'already registered');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', () => {
      cy.login();
      cy.visit('/');
      
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      cy.url().should('include', '/login');
      cy.getCookie('refreshToken').should('not.exist');
    });
  });

  describe('Password Reset', () => {
    it('should show forgot password link', () => {
      cy.visit('/login');
      cy.get('[data-testid="forgot-password-link"]').should('be.visible');
    });

    it('should navigate to password reset page', () => {
      cy.visit('/login');
      cy.get('[data-testid="forgot-password-link"]').click();
      cy.url().should('include', '/forgot-password');
    });

    it('should send password reset email', () => {
      cy.intercept('POST', '**/api/auth/forgot-password').as('forgotPassword');

      cy.visit('/forgot-password');
      cy.get('[data-testid="email-input"]').type('test@polybazar.com');
      cy.get('[data-testid="submit-button"]').click();

      cy.wait('@forgotPassword');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });
});
