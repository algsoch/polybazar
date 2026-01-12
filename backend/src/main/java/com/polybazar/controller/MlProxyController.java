package com.polybazar.controller;

import com.polybazar.dto.ml.*;
import com.polybazar.service.MlProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ml")
@RequiredArgsConstructor
public class MlProxyController {

    private final MlProxyService mlProxyService;

    @PostMapping(value = "/vision/classify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClassificationResponse> classifyImage(
            @RequestParam("file") MultipartFile file) {
        
        return ResponseEntity.ok(mlProxyService.classifyImage(file));
    }

    @PostMapping("/price/predict")
    public ResponseEntity<PricePredictionResponse> predictPrice(
            @RequestBody PricePredictionRequest request) {
        
        return ResponseEntity.ok(mlProxyService.predictPrice(request));
    }

    @PostMapping("/recommend")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @RequestBody RecommendationRequest request) {
        
        return ResponseEntity.ok(mlProxyService.getRecommendations(request));
    }

    @PostMapping(value = "/ocr/doc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcrResponse> extractDocument(
            @RequestParam("file") MultipartFile file) {
        
        return ResponseEntity.ok(mlProxyService.extractDocument(file));
    }

    @PostMapping("/embed")
    public ResponseEntity<EmbeddingResponse> createEmbedding(
            @RequestBody EmbeddingRequest request) {
        
        return ResponseEntity.ok(mlProxyService.createEmbedding(request));
    }
}
