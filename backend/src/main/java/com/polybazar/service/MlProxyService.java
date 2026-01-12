package com.polybazar.service;

import com.polybazar.dto.ml.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MlProxyService {

    private final RestTemplate restTemplate;

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    // Methods for controller compatibility
    public ClassificationResponse classifyImage(MultipartFile file) {
        log.info("Classifying image: {}", file.getOriginalFilename());
        // TODO: Implement actual ML service call with file upload
        ClassificationResponse response = new ClassificationResponse();
        response.setPolymerType("HDPE");
        response.setGrade("Injection");
        response.setConfidence(0.85);
        return response;
    }

    public PricePredictionResponse predictPrice(PricePredictionRequest request) {
        log.info("Predicting price for {} {}", request.getPolymerType(), request.getGrade());
        // TODO: Implement actual ML service call
        PricePredictionResponse response = new PricePredictionResponse();
        response.setPredictedPrice(BigDecimal.valueOf(95.50));
        response.setMinPrice(BigDecimal.valueOf(90.00));
        response.setMaxPrice(BigDecimal.valueOf(100.00));
        response.setConfidence(0.78);
        response.setCurrency("INR");
        response.setPriceUnit("per kg");
        return response;
    }

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        log.info("Getting recommendations for products: {}", request.getProductIds());
        // TODO: Implement actual ML service call
        RecommendationResponse response = new RecommendationResponse();
        response.setProducts(new ArrayList<>());
        response.setStrategy("collaborative_filtering");
        return response;
    }

    public OcrResponse extractDocument(MultipartFile file) {
        log.info("Extracting document: {}", file.getOriginalFilename());
        // TODO: Implement actual ML service call
        OcrResponse response = new OcrResponse();
        response.setExtractedText("Document text content");
        response.setConfidence(0.92);
        response.setDocumentType("invoice");
        return response;
    }

    public EmbeddingResponse createEmbedding(EmbeddingRequest request) {
        log.info("Creating embedding for text: {}", request.getText().substring(0, Math.min(50, request.getText().length())));
        // TODO: Implement actual ML service call
        EmbeddingResponse response = new EmbeddingResponse();
        response.setEmbedding(List.of(0.1, 0.2, 0.3, 0.4, 0.5));
        response.setModel("sentence-transformers");
        response.setDimensions(384);
        return response;
    }

    // Legacy methods for backward compatibility

    public List<Float> generateEmbedding(String text) {
        try {
            String url = mlServiceUrl + "/embed";
            
            Map<String, String> request = new HashMap<>();
            request.put("text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<Double> embeddingDoubles = (List<Double>) response.getBody().get("embedding");
                return embeddingDoubles.stream()
                        .map(Double::floatValue)
                        .toList();
            }

            throw new RuntimeException("Failed to generate embedding");
        } catch (Exception e) {
            log.error("Error generating embedding: {}", e.getMessage());
            throw new RuntimeException("ML Service unavailable", e);
        }
    }

    public List<String> getRecommendations(String productId, int limit) {
        try {
            String url = mlServiceUrl + "/recommend?product_id=" + productId + "&limit=" + limit;

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<String> recommendations = (List<String>) response.getBody().get("recommendations");
                return recommendations;
            }

            return List.of();
        } catch (Exception e) {
            log.error("Error getting recommendations: {}", e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> predictPrice(String category, String type, String grade, 
                                            String brand, Double quantity) {
        try {
            String url = mlServiceUrl + "/price/predict";

            Map<String, Object> request = new HashMap<>();
            request.put("category", category);
            request.put("type", type);
            request.put("grade", grade);
            request.put("brand", brand);
            request.put("quantity", quantity);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return Map.of("error", "Failed to predict price");
        } catch (Exception e) {
            log.error("Error predicting price: {}", e.getMessage());
            return Map.of("error", "ML Service unavailable");
        }
    }

    public Map<String, Object> classifyImage(String imageUrl) {
        try {
            String url = mlServiceUrl + "/vision/classify";

            Map<String, String> request = new HashMap<>();
            request.put("image_url", imageUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return Map.of("error", "Failed to classify image");
        } catch (Exception e) {
            log.error("Error classifying image: {}", e.getMessage());
            return Map.of("error", "ML Service unavailable");
        }
    }

    public Map<String, Object> extractOcrData(String documentUrl, String documentType) {
        try {
            String url = mlServiceUrl + "/ocr/extract";

            Map<String, String> request = new HashMap<>();
            request.put("document_url", documentUrl);
            request.put("document_type", documentType);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return Map.of("error", "Failed to extract OCR data");
        } catch (Exception e) {
            log.error("Error extracting OCR data: {}", e.getMessage());
            return Map.of("error", "ML Service unavailable");
        }
    }
}
