/// <reference types="cypress" />

import './commands';

// Runs before each test file
beforeEach(() => {
  // Intercept API calls
  cy.intercept('GET', '**/api/products*').as('getProducts');
  cy.intercept('POST', '**/api/auth/login').as('login');
  cy.intercept('POST', '**/api/auth/register').as('register');
  cy.intercept('POST', '**/api/orders').as('createOrder');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing on Next.js hydration errors
  if (err.message.includes('Hydration failed')) {
    return false;
  }
  // Prevent failing on ResizeObserver errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// Add custom assertion
chai.Assertion.addMethod('beValidPrice', function () {
  const price = this._obj;
  new chai.Assertion(price).to.be.a('number');
  new chai.Assertion(price).to.be.greaterThan(0);
});
