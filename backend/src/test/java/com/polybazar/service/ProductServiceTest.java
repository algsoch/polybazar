package com.polybazar.service;

import com.polybazar.dto.ProductRequest;
import com.polybazar.model.Product;
import com.polybazar.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private MlProxyService mlProxyService;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductRequest productRequest;
    private UUID sellerId;

    @BeforeEach
    void setUp() {
        sellerId = UUID.randomUUID();

        testProduct = new Product();
        testProduct.setId("prod-123");
        testProduct.setSellerId(sellerId.toString());
        testProduct.setTitle("HDPE Granules");
        testProduct.setPolymerType("HDPE");
        testProduct.setGrade("Injection");
        testProduct.setMfi(8.0);
        testProduct.setQuantity(1000.0);
        testProduct.setUnit("kg");
        testProduct.setPrice(BigDecimal.valueOf(1.50));
        testProduct.setCurrency("USD");
        testProduct.setLocation(new Product.Location("Mumbai", "India", 19.0760, 72.8777));
        testProduct.setActive(true);
        testProduct.setCreatedAt(Instant.now());

        productRequest = new ProductRequest();
        productRequest.setTitle("HDPE Granules");
        productRequest.setPolymerType("HDPE");
        productRequest.setGrade("Injection");
        productRequest.setMfi(8.0);
        productRequest.setQuantity(1000.0);
        productRequest.setUnit("kg");
        productRequest.setPrice(BigDecimal.valueOf(1.50));
        productRequest.setCurrency("USD");
        productRequest.setCity("Mumbai");
        productRequest.setCountry("India");
    }

    @Nested
    @DisplayName("Create Product Tests")
    class CreateProductTests {

        @Test
        @DisplayName("Should create product successfully")
        void shouldCreateProductSuccessfully() {
            // Given
            given(productRepository.save(any(Product.class))).willReturn(testProduct);
            given(mlProxyService.generateEmbedding(anyString())).willReturn(new float[384]);

            // When
            Product result = productService.createProduct(productRequest, sellerId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTitle()).isEqualTo("HDPE Granules");
            assertThat(result.getPolymerType()).isEqualTo("HDPE");
            
            then(productRepository).should().save(any(Product.class));
        }

        @Test
        @DisplayName("Should set correct seller ID")
        void shouldSetCorrectSellerId() {
            // Given
            given(productRepository.save(any(Product.class))).willAnswer(invocation -> {
                Product saved = invocation.getArgument(0);
                assertThat(saved.getSellerId()).isEqualTo(sellerId.toString());
                return saved;
            });
            given(mlProxyService.generateEmbedding(anyString())).willReturn(new float[384]);

            // When
            productService.createProduct(productRequest, sellerId);

            // Then
            then(productRepository).should().save(any(Product.class));
        }

        @Test
        @DisplayName("Should generate embedding for product")
        void shouldGenerateEmbedding() {
            // Given
            float[] embedding = new float[384];
            given(productRepository.save(any(Product.class))).willReturn(testProduct);
            given(mlProxyService.generateEmbedding(anyString())).willReturn(embedding);

            // When
            productService.createProduct(productRequest, sellerId);

            // Then
            then(mlProxyService).should().generateEmbedding(contains("HDPE"));
        }
    }

    @Nested
    @DisplayName("Get Product Tests")
    class GetProductTests {

        @Test
        @DisplayName("Should get product by ID")
        void shouldGetProductById() {
            // Given
            given(productRepository.findById(anyString())).willReturn(Optional.of(testProduct));

            // When
            Optional<Product> result = productService.getProductById("prod-123");

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo("prod-123");
        }

        @Test
        @DisplayName("Should return empty when product not found")
        void shouldReturnEmptyWhenNotFound() {
            // Given
            given(productRepository.findById(anyString())).willReturn(Optional.empty());

            // When
            Optional<Product> result = productService.getProductById("nonexistent");

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should get products by seller")
        void shouldGetProductsBySeller() {
            // Given
            List<Product> products = List.of(testProduct);
            given(productRepository.findBySellerId(anyString())).willReturn(products);

            // When
            List<Product> result = productService.getProductsBySeller(sellerId.toString());

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getSellerId()).isEqualTo(sellerId.toString());
        }
    }

    @Nested
    @DisplayName("Search Products Tests")
    class SearchProductsTests {

        @Test
        @DisplayName("Should search products with pagination")
        void shouldSearchWithPagination() {
            // Given
            Page<Product> page = new PageImpl<>(List.of(testProduct));
            Pageable pageable = PageRequest.of(0, 10);
            given(productRepository.findByPolymerType(anyString(), any(Pageable.class))).willReturn(page);

            // When
            Page<Product> result = productService.searchByPolymerType("HDPE", pageable);

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should search products by text")
        void shouldSearchByText() {
            // Given
            List<Product> products = List.of(testProduct);
            given(productRepository.searchByText(anyString())).willReturn(products);

            // When
            List<Product> result = productService.searchByText("HDPE granules");

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should search products by location")
        void shouldSearchByLocation() {
            // Given
            List<Product> products = List.of(testProduct);
            given(productRepository.findByLocationNear(anyDouble(), anyDouble(), anyDouble()))
                .willReturn(products);

            // When
            List<Product> result = productService.searchByLocation(19.0760, 72.8777, 100);

            // Then
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Update Product Tests")
    class UpdateProductTests {

        @Test
        @DisplayName("Should update product successfully")
        void shouldUpdateProductSuccessfully() {
            // Given
            given(productRepository.findById(anyString())).willReturn(Optional.of(testProduct));
            given(productRepository.save(any(Product.class))).willReturn(testProduct);

            productRequest.setPrice(BigDecimal.valueOf(1.75));

            // When
            Product result = productService.updateProduct("prod-123", productRequest, sellerId);

            // Then
            assertThat(result).isNotNull();
            then(productRepository).should().save(any(Product.class));
        }

        @Test
        @DisplayName("Should throw exception when updating non-owned product")
        void shouldThrowExceptionWhenNotOwner() {
            // Given
            UUID differentSeller = UUID.randomUUID();
            given(productRepository.findById(anyString())).willReturn(Optional.of(testProduct));

            // When/Then
            assertThatThrownBy(() -> productService.updateProduct("prod-123", productRequest, differentSeller))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Not authorized");
        }
    }

    @Nested
    @DisplayName("Delete Product Tests")
    class DeleteProductTests {

        @Test
        @DisplayName("Should delete product successfully")
        void shouldDeleteProductSuccessfully() {
            // Given
            given(productRepository.findById(anyString())).willReturn(Optional.of(testProduct));
            willDoNothing().given(productRepository).delete(any(Product.class));

            // When
            productService.deleteProduct("prod-123", sellerId);

            // Then
            then(productRepository).should().delete(testProduct);
        }

        @Test
        @DisplayName("Should soft delete product when configured")
        void shouldSoftDeleteProduct() {
            // Given
            given(productRepository.findById(anyString())).willReturn(Optional.of(testProduct));
            given(productRepository.save(any(Product.class))).willAnswer(invocation -> {
                Product saved = invocation.getArgument(0);
                assertThat(saved.isActive()).isFalse();
                return saved;
            });

            // When
            productService.softDeleteProduct("prod-123", sellerId);

            // Then
            then(productRepository).should().save(any(Product.class));
        }
    }
}
