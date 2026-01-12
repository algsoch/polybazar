/// <reference types="cypress" />

// Custom commands for PolyBazar E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      createProduct(product: ProductData): Chainable<void>;
      searchProducts(query: string): Chainable<void>;
      addToCart(productId: string): Chainable<void>;
      checkout(): Chainable<void>;
      waitForApi(alias: string): Chainable<void>;
    }
  }
}

interface ProductData {
  title: string;
  polymerType: string;
  grade: string;
  quantity: number;
  price: number;
}

// Login command
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const userEmail = email || Cypress.env('testUserEmail');
  const userPassword = password || Cypress.env('testUserPassword');

  cy.session([userEmail, userPassword], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(userEmail);
    cy.get('[data-testid="password-input"]').type(userPassword);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('not.include', '/login');
    cy.getCookie('accessToken').should('exist');
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Create product command
Cypress.Commands.add('createProduct', (product: ProductData) => {
  cy.visit('/sell/new');
  cy.get('[data-testid="product-title"]').type(product.title);
  cy.get('[data-testid="polymer-type"]').select(product.polymerType);
  cy.get('[data-testid="grade-select"]').select(product.grade);
  cy.get('[data-testid="quantity-input"]').type(product.quantity.toString());
  cy.get('[data-testid="price-input"]').type(product.price.toString());
  cy.get('[data-testid="submit-product"]').click();
  cy.url().should('include', '/products/');
});

// Search products command
Cypress.Commands.add('searchProducts', (query: string) => {
  cy.get('[data-testid="search-input"]').clear().type(query);
  cy.get('[data-testid="search-button"]').click();
  cy.get('[data-testid="product-list"]').should('be.visible');
});

// Add to cart command
Cypress.Commands.add('addToCart', (productId: string) => {
  cy.get(`[data-testid="product-${productId}"]`).within(() => {
    cy.get('[data-testid="add-to-cart"]').click();
  });
  cy.get('[data-testid="cart-notification"]').should('be.visible');
});

// Checkout command
Cypress.Commands.add('checkout', () => {
  cy.get('[data-testid="cart-icon"]').click();
  cy.get('[data-testid="checkout-button"]').click();
  cy.url().should('include', '/checkout');
});

// Wait for API command
Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('be.oneOf', [200, 201]);
});

export {};
