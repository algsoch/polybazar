/// <reference types="cypress" />

describe('Products', () => {
  describe('Product Listing', () => {
    beforeEach(() => {
      cy.visit('/products');
    });

    it('should display product list', () => {
      cy.wait('@getProducts');
      cy.get('[data-testid="product-list"]').should('be.visible');
      cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
    });

    it('should display product details on card', () => {
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="product-title"]').should('be.visible');
        cy.get('[data-testid="product-price"]').should('be.visible');
        cy.get('[data-testid="polymer-type-badge"]').should('be.visible');
      });
    });

    it('should paginate products', () => {
      cy.wait('@getProducts');
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getProducts');
      cy.url().should('include', 'page=2');
    });

    it('should filter by polymer type', () => {
      cy.get('[data-testid="filter-polymer-type"]').select('HDPE');
      cy.wait('@getProducts');
      cy.get('[data-testid="polymer-type-badge"]').each(($badge) => {
        cy.wrap($badge).should('contain', 'HDPE');
      });
    });

    it('should filter by price range', () => {
      cy.get('[data-testid="min-price"]').type('1');
      cy.get('[data-testid="max-price"]').type('2');
      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getProducts');
      cy.url().should('include', 'minPrice=1');
      cy.url().should('include', 'maxPrice=2');
    });

    it('should sort products by price', () => {
      cy.get('[data-testid="sort-select"]').select('price-asc');
      cy.wait('@getProducts');
      cy.url().should('include', 'sort=price-asc');
    });
  });

  describe('Product Search', () => {
    beforeEach(() => {
      cy.visit('/products');
    });

    it('should search products by keyword', () => {
      cy.get('[data-testid="search-input"]').type('HDPE granules');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getProducts');
      cy.url().should('include', 'q=HDPE');
    });

    it('should show search suggestions', () => {
      cy.get('[data-testid="search-input"]').type('HDP');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="suggestion-item"]').should('have.length.at.least', 1);
    });

    it('should handle no results', () => {
      cy.get('[data-testid="search-input"]').type('xyznonexistent123');
      cy.get('[data-testid="search-button"]').click();
      cy.wait('@getProducts');
      cy.get('[data-testid="no-results"]').should('be.visible');
    });

    it('should use semantic search', () => {
      cy.intercept('POST', '**/api/ml/search').as('semanticSearch');
      
      cy.get('[data-testid="search-input"]').type('polymer for injection molding');
      cy.get('[data-testid="ai-search-toggle"]').check();
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@semanticSearch');
      cy.get('[data-testid="ai-results-badge"]').should('be.visible');
    });
  });

  describe('Product Detail', () => {
    beforeEach(() => {
      cy.visit('/products');
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().click();
    });

    it('should display product details', () => {
      cy.get('[data-testid="product-detail"]').should('be.visible');
      cy.get('[data-testid="product-title"]').should('be.visible');
      cy.get('[data-testid="product-price"]').should('be.visible');
      cy.get('[data-testid="product-description"]').should('be.visible');
    });

    it('should display polymer specifications', () => {
      cy.get('[data-testid="specs-section"]').within(() => {
        cy.get('[data-testid="polymer-type"]').should('be.visible');
        cy.get('[data-testid="grade"]').should('be.visible');
        cy.get('[data-testid="mfi"]').should('be.visible');
      });
    });

    it('should display seller information', () => {
      cy.get('[data-testid="seller-info"]').should('be.visible');
      cy.get('[data-testid="seller-rating"]').should('be.visible');
    });

    it('should display product images', () => {
      cy.get('[data-testid="product-images"]').should('be.visible');
      cy.get('[data-testid="main-image"]').should('be.visible');
      cy.get('[data-testid="thumbnail"]').should('have.length.at.least', 1);
    });

    it('should show AI price suggestion', () => {
      cy.get('[data-testid="ai-price-widget"]').should('be.visible');
      cy.get('[data-testid="suggested-price"]').should('be.visible');
    });

    it('should show similar products', () => {
      cy.get('[data-testid="similar-products"]').should('be.visible');
      cy.get('[data-testid="similar-product-card"]').should('have.length.at.least', 1);
    });
  });

  describe('Create Product (Seller)', () => {
    beforeEach(() => {
      cy.login('seller@polybazar.com', 'Seller123!');
      cy.visit('/sell/new');
    });

    it('should display product creation form', () => {
      cy.get('[data-testid="create-product-form"]').should('be.visible');
    });

    it('should create new product listing', () => {
      cy.intercept('POST', '**/api/products').as('createProduct');

      cy.get('[data-testid="product-title"]').type('High Quality HDPE Granules');
      cy.get('[data-testid="polymer-type"]').select('HDPE');
      cy.get('[data-testid="grade-select"]').select('Injection');
      cy.get('[data-testid="mfi-input"]').type('8');
      cy.get('[data-testid="quantity-input"]').type('1000');
      cy.get('[data-testid="unit-select"]').select('kg');
      cy.get('[data-testid="price-input"]').type('1.50');
      cy.get('[data-testid="description-input"]').type('Premium quality HDPE granules');
      cy.get('[data-testid="submit-product"]').click();

      cy.wait('@createProduct');
      cy.url().should('include', '/products/');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should upload product images', () => {
      cy.get('[data-testid="image-upload"]').attachFile('test-polymer.jpg');
      cy.get('[data-testid="image-preview"]').should('be.visible');
    });

    it('should get AI price suggestion', () => {
      cy.intercept('POST', '**/api/ml/predict/price').as('pricePredict');

      cy.get('[data-testid="polymer-type"]').select('HDPE');
      cy.get('[data-testid="grade-select"]').select('Injection');
      cy.get('[data-testid="quantity-input"]').type('1000');
      cy.get('[data-testid="get-price-suggestion"]').click();

      cy.wait('@pricePredict');
      cy.get('[data-testid="suggested-price-display"]').should('be.visible');
    });

    it('should classify polymer from image', () => {
      cy.intercept('POST', '**/api/ml/classify').as('classifyImage');

      cy.get('[data-testid="image-upload"]').attachFile('test-polymer.jpg');
      cy.get('[data-testid="classify-image"]').click();

      cy.wait('@classifyImage');
      cy.get('[data-testid="classification-result"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="submit-product"]').click();
      
      cy.get('[data-testid="title-error"]').should('be.visible');
      cy.get('[data-testid="polymer-type-error"]').should('be.visible');
      cy.get('[data-testid="quantity-error"]').should('be.visible');
      cy.get('[data-testid="price-error"]').should('be.visible');
    });
  });

  describe('Product Management (Seller)', () => {
    beforeEach(() => {
      cy.login('seller@polybazar.com', 'Seller123!');
      cy.visit('/dashboard/products');
    });

    it('should display seller products', () => {
      cy.get('[data-testid="my-products-list"]').should('be.visible');
      cy.get('[data-testid="product-row"]').should('have.length.at.least', 1);
    });

    it('should edit product', () => {
      cy.intercept('PUT', '**/api/products/*').as('updateProduct');

      cy.get('[data-testid="product-row"]').first().within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });

      cy.get('[data-testid="price-input"]').clear().type('1.75');
      cy.get('[data-testid="save-button"]').click();

      cy.wait('@updateProduct');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should delete product', () => {
      cy.intercept('DELETE', '**/api/products/*').as('deleteProduct');

      cy.get('[data-testid="product-row"]').first().within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });

      cy.get('[data-testid="confirm-delete"]').click();
      cy.wait('@deleteProduct');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should toggle product active status', () => {
      cy.intercept('PATCH', '**/api/products/*/status').as('toggleStatus');

      cy.get('[data-testid="product-row"]').first().within(() => {
        cy.get('[data-testid="status-toggle"]').click();
      });

      cy.wait('@toggleStatus');
    });
  });
});
