package com.polybazar.controller;

import com.polybazar.dto.product.*;
import com.polybazar.model.Product;
import com.polybazar.security.CurrentUser;
import com.polybazar.security.UserPrincipal;
import com.polybazar.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> listProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @PageableDefault(size = 12) Pageable pageable) {
        
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .query(q)
                .category(category)
                .grade(grade)
                .location(location)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .verified(verified)
                .featured(featured)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();
        
        return ResponseEntity.ok(productService.getProducts(filter, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @ModelAttribute CreateProductRequest request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @CurrentUser UserPrincipal currentUser) {
        
        // TODO: Handle image upload and set URLs in request
        return ResponseEntity.ok(productService.createProduct(request, currentUser.getId(), currentUser.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        return ResponseEntity.ok(productService.updateProduct(id, request, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser) {
        
        productService.deleteProduct(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<ProductResponse>> getRecommendations(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") int limit) {
        
        return ResponseEntity.ok(productService.getRecommendedProducts(id, limit));
    }
}
