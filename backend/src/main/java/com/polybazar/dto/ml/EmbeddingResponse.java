package com.polybazar.dto.ml;

import lombok.Data;
import java.util.List;

@Data
public class EmbeddingResponse {
    private List<Double> embedding;
    private List<List<Double>> embeddings;
    private String model;
    private Integer dimensions;
}
