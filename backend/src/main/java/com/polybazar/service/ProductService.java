package com.polybazar.service;

import com.polybazar.dto.product.*;
import com.polybazar.model.Product;
import com.polybazar.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final MlProxyService mlProxyService;

    public Page<ProductResponse> getProducts(ProductFilterRequest filter, Pageable pageable) {
        Sort sort = buildSort(filter.getSortBy(), filter.getSortOrder());
        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Product> products;

        if (filter.getQuery() != null && !filter.getQuery().isEmpty()) {
            products = productRepository.searchProducts(filter.getQuery(), pageRequest);
        } else if (filter.getCategory() != null) {
            products = productRepository.findByCategoryAndStatus(filter.getCategory(), Product.ProductStatus.ACTIVE, pageRequest);
        } else {
            products = productRepository.findActiveProducts(pageRequest);
        }

        return products.map(this::toProductResponse);
    }

    public ProductDetailResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        List<ProductResponse> similarProducts = getSimilarProducts(product, 4);
        List<ProductResponse> sellerProducts = getOtherSellerProducts(product, 4);

        return toProductDetailResponse(product, similarProducts, sellerProducts);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request, String sellerId, String sellerName) {
        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .type(request.getType())
                .grade(request.getGrade())
                .brand(request.getBrand())
                .form(request.getForm())
                .color(request.getColor())
                .origin(request.getOrigin())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .priceUnit(request.getPriceUnit())
                .minOrderQuantity(request.getMinOrderQuantity())
                .availableQuantity(request.getAvailableQuantity())
                .quantityUnit(request.getQuantityUnit())
                .images(request.getImages())
                .primaryImage(request.getImages() != null && !request.getImages().isEmpty() ? request.getImages().get(0) : null)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .location(buildLocation(request))
                .specs(buildSpecs(request))
                .negotiable(request.getNegotiable() != null ? request.getNegotiable() : true)
                .status(Product.ProductStatus.ACTIVE)
                .build();

        try {
            List<Float> embedding = mlProxyService.generateEmbedding(
                    product.getTitle() + " " + product.getDescription() + " " + product.getCategory()
            );
            product.setEmbedding(embedding);
        } catch (Exception e) {
            log.warn("Failed to generate embedding for product: {}", e.getMessage());
        }

        Product savedProduct = productRepository.save(product);
        log.info("Product created: {} by seller: {}", savedProduct.getId(), sellerId);

        return toProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(String id, UpdateProductRequest request, String sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized to update this product");
        }

        if (request.getTitle() != null) product.setTitle(request.getTitle());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getAvailableQuantity() != null) product.setAvailableQuantity(request.getAvailableQuantity());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
            product.setPrimaryImage(request.getImages().isEmpty() ? null : request.getImages().get(0));
        }
        if (request.getStatus() != null) product.setStatus(Product.ProductStatus.valueOf(request.getStatus()));

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: {}", id);

        return toProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(String id, String sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized to delete this product");
        }

        product.setStatus(Product.ProductStatus.ARCHIVED);
        productRepository.save(product);
        log.info("Product archived: {}", id);
    }

    public Page<ProductResponse> getSellerProducts(String sellerId, Pageable pageable) {
        return productRepository.findBySellerId(sellerId, pageable)
                .map(this::toProductResponse);
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findFeaturedProducts()
                .stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getRecommendedProducts(String productId, int limit) {
        try {
            List<String> recommendedIds = mlProxyService.getRecommendations(productId, limit);
            return productRepository.findByIdIn(recommendedIds)
                    .stream()
                    .map(this::toProductResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get recommendations: {}", e.getMessage());
            Product product = productRepository.findById(productId).orElse(null);
            if (product != null) {
                return getSimilarProducts(product, limit);
            }
            return List.of();
        }
    }

    private List<ProductResponse> getSimilarProducts(Product product, int limit) {
        return productRepository.findSimilarProducts(
                        product.getCategory(),
                        product.getType(),
                        product.getId(),
                        PageRequest.of(0, limit)
                ).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    private List<ProductResponse> getOtherSellerProducts(Product product, int limit) {
        return productRepository.findOtherSellerProducts(
                        product.getSellerId(),
                        product.getId(),
                        PageRequest.of(0, limit)
                ).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        if (sortBy == null) sortBy = "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, sortBy);
    }

    private Product.Location buildLocation(CreateProductRequest request) {
        if (request.getCity() == null) return null;
        return Product.Location.builder()
                .city(request.getCity())
                .state(request.getState())
                .country("India")
                .pincode(request.getPincode())
                .build();
    }

    private Product.ProductSpecs buildSpecs(CreateProductRequest request) {
        return Product.ProductSpecs.builder()
                .mfi(request.getMfi() != null ? String.valueOf(request.getMfi()) : null)
                .density(request.getDensity() != null ? String.valueOf(request.getDensity()) : null)
                .tensileStrength(request.getTensileStrength() != null ? String.valueOf(request.getTensileStrength()) : null)
                .applications(request.getApplications() != null ? String.join(",", request.getApplications()) : null)
                .certifications(request.getCertifications() != null ? String.join(",", request.getCertifications()) : null)
                .build();
    }

    private ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .type(product.getType())
                .grade(product.getGrade())
                .brand(product.getBrand())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .priceUnit(product.getPriceUnit())
                .minOrderQuantity(product.getMinOrderQuantity())
                .availableQuantity(product.getAvailableQuantity())
                .quantityUnit(product.getQuantityUnit())
                .primaryImage(product.getPrimaryImage())
                .images(product.getImages())
                .sellerId(product.getSellerId())
                .sellerName(product.getSellerName())
                .sellerVerified(product.getSellerVerified())
                .city(product.getLocation() != null ? product.getLocation().getCity() : null)
                .state(product.getLocation() != null ? product.getLocation().getState() : null)
                .negotiable(product.getNegotiable())
                .featured(product.getFeatured())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .build();
    }

    private ProductDetailResponse toProductDetailResponse(Product product, List<ProductResponse> similar, List<ProductResponse> sellerProducts) {
        return ProductDetailResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .type(product.getType())
                .grade(product.getGrade())
                .brand(product.getBrand())
                .form(product.getForm())
                .color(product.getColor())
                .origin(product.getOrigin())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .priceUnit(product.getPriceUnit())
                .minOrderQuantity(product.getMinOrderQuantity())
                .availableQuantity(product.getAvailableQuantity())
                .quantityUnit(product.getQuantityUnit())
                .images(product.getImages())
                .primaryImage(product.getPrimaryImage())
                .sellerId(product.getSellerId())
                .sellerName(product.getSellerName())
                .sellerCompany(product.getSellerCompany())
                .sellerVerified(product.getSellerVerified())
                .location(product.getLocation())
                .specs(product.getSpecs())
                .negotiable(product.getNegotiable())
                .featured(product.getFeatured())
                .viewCount(product.getViewCount())
                .inquiryCount(product.getInquiryCount())
                .similarProducts(similar)
                .sellerProducts(sellerProducts)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
