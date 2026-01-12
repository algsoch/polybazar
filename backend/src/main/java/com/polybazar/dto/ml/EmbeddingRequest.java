package com.polybazar.dto.ml;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class EmbeddingRequest {
    @NotBlank
    private String text;
    private List<String> texts;
    private String model;
}
