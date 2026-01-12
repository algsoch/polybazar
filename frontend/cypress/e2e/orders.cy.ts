/// <reference types="cypress" />

describe('Orders & Checkout', () => {
  describe('Cart', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/products');
      cy.wait('@getProducts');
    });

    it('should add product to cart', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });

      cy.get('[data-testid="cart-count"]').should('contain', '1');
      cy.get('[data-testid="cart-notification"]').should('be.visible');
    });

    it('should update cart quantity', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });

      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="quantity-input"]').clear().type('5');
      cy.get('[data-testid="update-quantity"]').click();

      cy.get('[data-testid="cart-item-quantity"]').should('contain', '5');
    });

    it('should remove item from cart', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });

      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="remove-item"]').click();

      cy.get('[data-testid="empty-cart"]').should('be.visible');
    });

    it('should persist cart across sessions', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });

      cy.reload();
      cy.get('[data-testid="cart-count"]').should('contain', '1');
    });

    it('should calculate cart total', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });

      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="cart-total"]').should('be.visible');
      cy.get('[data-testid="cart-total"]').invoke('text').should('match', /\$[\d,]+\.\d{2}/);
    });
  });

  describe('Checkout', () => {
    beforeEach(() => {
      cy.login();
      // Add item to cart
      cy.visit('/products');
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart"]').click();
      });
      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="checkout-button"]').click();
    });

    it('should display checkout page', () => {
      cy.url().should('include', '/checkout');
      cy.get('[data-testid="checkout-form"]').should('be.visible');
    });

    it('should display order summary', () => {
      cy.get('[data-testid="order-summary"]').should('be.visible');
      cy.get('[data-testid="order-item"]').should('have.length.at.least', 1);
      cy.get('[data-testid="order-total"]').should('be.visible');
    });

    it('should validate shipping address', () => {
      cy.get('[data-testid="place-order"]').click();
      cy.get('[data-testid="address-error"]').should('be.visible');
    });

    it('should complete order', () => {
      cy.intercept('POST', '**/api/orders').as('createOrder');

      // Fill shipping address
      cy.get('[data-testid="shipping-address"]').type('123 Main St');
      cy.get('[data-testid="shipping-city"]').type('Mumbai');
      cy.get('[data-testid="shipping-state"]').type('Maharashtra');
      cy.get('[data-testid="shipping-zip"]').type('400001');
      cy.get('[data-testid="shipping-country"]').select('India');

      // Select payment method
      cy.get('[data-testid="payment-bank-transfer"]').check();

      cy.get('[data-testid="place-order"]').click();

      cy.wait('@createOrder');
      cy.url().should('include', '/orders/');
      cy.get('[data-testid="order-confirmation"]').should('be.visible');
    });

    it('should show negotiation option', () => {
      cy.get('[data-testid="negotiate-price"]').should('be.visible');
    });
  });

  describe('Order Management', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/dashboard/orders');
    });

    it('should display order list', () => {
      cy.get('[data-testid="orders-list"]').should('be.visible');
    });

    it('should filter orders by status', () => {
      cy.get('[data-testid="status-filter"]').select('PENDING');
      cy.get('[data-testid="order-status"]').each(($status) => {
        cy.wrap($status).should('contain', 'Pending');
      });
    });

    it('should view order details', () => {
      cy.get('[data-testid="order-row"]').first().click();
      cy.get('[data-testid="order-detail"]').should('be.visible');
      cy.get('[data-testid="order-items"]').should('be.visible');
      cy.get('[data-testid="order-status-timeline"]').should('be.visible');
    });

    it('should download invoice', () => {
      cy.intercept('GET', '**/api/orders/*/invoice').as('downloadInvoice');

      cy.get('[data-testid="order-row"]').first().click();
      cy.get('[data-testid="download-invoice"]').click();

      cy.wait('@downloadInvoice');
    });

    it('should track order status', () => {
      cy.get('[data-testid="order-row"]').first().click();
      cy.get('[data-testid="order-status-timeline"]').should('be.visible');
      cy.get('[data-testid="status-step"]').should('have.length.at.least', 1);
    });
  });

  describe('Seller Order Management', () => {
    beforeEach(() => {
      cy.login('seller@polybazar.com', 'Seller123!');
      cy.visit('/dashboard/sales');
    });

    it('should display sales orders', () => {
      cy.get('[data-testid="sales-list"]').should('be.visible');
    });

    it('should accept order', () => {
      cy.intercept('PATCH', '**/api/orders/*/status').as('updateStatus');

      cy.get('[data-testid="order-row"]')
        .filter(':contains("Pending")')
        .first()
        .within(() => {
          cy.get('[data-testid="accept-order"]').click();
        });

      cy.wait('@updateStatus');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should reject order', () => {
      cy.intercept('PATCH', '**/api/orders/*/status').as('updateStatus');

      cy.get('[data-testid="order-row"]')
        .filter(':contains("Pending")')
        .first()
        .within(() => {
          cy.get('[data-testid="reject-order"]').click();
        });

      cy.get('[data-testid="rejection-reason"]').type('Out of stock');
      cy.get('[data-testid="confirm-reject"]').click();

      cy.wait('@updateStatus');
    });

    it('should mark order as shipped', () => {
      cy.intercept('PATCH', '**/api/orders/*/status').as('updateStatus');

      cy.get('[data-testid="order-row"]')
        .filter(':contains("Confirmed")')
        .first()
        .within(() => {
          cy.get('[data-testid="mark-shipped"]').click();
        });

      cy.get('[data-testid="tracking-number"]').type('TRACK123456');
      cy.get('[data-testid="confirm-shipped"]').click();

      cy.wait('@updateStatus');
    });
  });

  describe('Price Negotiation', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/products');
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().click();
    });

    it('should open negotiation chat', () => {
      cy.get('[data-testid="negotiate-button"]').click();
      cy.get('[data-testid="negotiation-chat"]').should('be.visible');
    });

    it('should send price proposal', () => {
      cy.intercept('POST', '**/api/chat/negotiate').as('sendProposal');

      cy.get('[data-testid="negotiate-button"]').click();
      cy.get('[data-testid="proposed-price"]').type('1.25');
      cy.get('[data-testid="proposal-message"]').type('Can we agree on this price for bulk order?');
      cy.get('[data-testid="send-proposal"]').click();

      cy.wait('@sendProposal');
      cy.get('[data-testid="proposal-sent"]').should('be.visible');
    });

    it('should receive real-time chat messages', () => {
      cy.get('[data-testid="negotiate-button"]').click();
      
      // Simulate WebSocket message (in real test, this would be from the server)
      cy.window().then((win) => {
        // Trigger a mock WebSocket message event
        const event = new CustomEvent('ws-message', {
          detail: { type: 'chat', message: 'Counter offer: $1.30' }
        });
        win.dispatchEvent(event);
      });

      cy.get('[data-testid="chat-message"]').should('contain', 'Counter offer');
    });

    it('should accept negotiated price', () => {
      cy.intercept('POST', '**/api/chat/accept').as('acceptPrice');

      cy.get('[data-testid="negotiate-button"]').click();
      // Assuming there's a pending offer
      cy.get('[data-testid="accept-offer"]').click();

      cy.wait('@acceptPrice');
      cy.get('[data-testid="negotiation-complete"]').should('be.visible');
    });
  });
});
