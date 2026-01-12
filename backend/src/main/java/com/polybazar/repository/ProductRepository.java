package com.polybazar.repository;

import com.polybazar.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);

    Page<Product> findBySellerId(String sellerId, Pageable pageable);

    Page<Product> findBySellerIdAndStatus(String sellerId, Product.ProductStatus status, Pageable pageable);

    Page<Product> findByCategory(String category, Pageable pageable);

    Page<Product> findByCategoryAndStatus(String category, Product.ProductStatus status, Pageable pageable);

    Page<Product> findByType(String type, Pageable pageable);

    @Query("{'status': ?0, 'category': ?1}")
    Page<Product> findByStatusAndCategory(Product.ProductStatus status, String category, Pageable pageable);

    @Query("{'status': 'ACTIVE', 'price': {$gte: ?0, $lte: ?1}}")
    Page<Product> findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("{'status': 'ACTIVE', 'location.city': ?0}")
    Page<Product> findByCity(String city, Pageable pageable);

    @Query("{'status': 'ACTIVE', 'location.state': ?0}")
    Page<Product> findByState(String state, Pageable pageable);

    @Query("{'featured': true, 'status': 'ACTIVE'}")
    List<Product> findFeaturedProducts();

    @Query("{'status': 'ACTIVE'}")
    Page<Product> findActiveProducts(Pageable pageable);

    @Query(value = "{'$text': {'$search': ?0}, 'status': 'ACTIVE'}")
    Page<Product> searchProducts(String query, Pageable pageable);

    @Query("{'category': ?0, 'type': ?1, 'status': 'ACTIVE', '_id': {$ne: ?2}}")
    List<Product> findSimilarProducts(String category, String type, String excludeId, Pageable pageable);

    @Query("{'sellerId': ?0, 'status': 'ACTIVE', '_id': {$ne: ?1}}")
    List<Product> findOtherSellerProducts(String sellerId, String excludeId, Pageable pageable);

    long countBySellerId(String sellerId);

    long countBySellerIdAndStatus(String sellerId, Product.ProductStatus status);

    long countByStatus(Product.ProductStatus status);

    @Query("{'grade': ?0, 'status': 'ACTIVE'}")
    Page<Product> findByGrade(String grade, Pageable pageable);

    @Query("{'brand': ?0, 'status': 'ACTIVE'}")
    Page<Product> findByBrand(String brand, Pageable pageable);

    List<Product> findByIdIn(List<String> ids);
}
