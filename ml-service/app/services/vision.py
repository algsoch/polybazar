"""
Vision Service using EfficientNet for polymer image classification
"""

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms
import httpx
from io import BytesIO
from typing import Dict, Any, List
import logging

from app.config import settings

logger = logging.getLogger(__name__)


# Polymer categories for classification
POLYMER_CATEGORIES = [
    "Polypropylene (PP)",
    "High Density Polyethylene (HDPE)",
    "Low Density Polyethylene (LDPE)",
    "Linear Low Density Polyethylene (LLDPE)",
    "Polyvinyl Chloride (PVC)",
    "Polyethylene Terephthalate (PET)",
    "Polystyrene (PS)",
    "Acrylonitrile Butadiene Styrene (ABS)",
    "Polycarbonate (PC)",
    "Polyamide/Nylon (PA)",
    "Polyurethane (PU)",
    "Polymethyl Methacrylate (PMMA)",
    "Engineering Plastics",
    "Recycled Polymers",
    "Other"
]

POLYMER_TYPES = {
    "Polypropylene (PP)": ["Homopolymer", "Copolymer", "Random Copolymer", "Impact Copolymer"],
    "High Density Polyethylene (HDPE)": ["Blow Molding", "Injection Molding", "Film Grade", "Pipe Grade"],
    "Polyethylene Terephthalate (PET)": ["Bottle Grade", "Fiber Grade", "Film Grade"],
    "Polyvinyl Chloride (PVC)": ["Rigid", "Flexible", "Pipe Grade", "Cable Grade"],
}


class VisionService:
    def __init__(self):
        self._model = None
        self._ready = False
        self._transform = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        self._load_model()
    
    def _load_model(self):
        try:
            logger.info(f"Loading vision model: {settings.VISION_MODEL}")
            
            # Load pre-trained EfficientNet
            from efficientnet_pytorch import EfficientNet
            
            # Load base model
            self._model = EfficientNet.from_pretrained('efficientnet-b0')
            
            # Modify classifier for our categories
            num_features = self._model._fc.in_features
            self._model._fc = nn.Linear(num_features, len(POLYMER_CATEGORIES))
            
            # For demo purposes, we'll use random weights
            # In production, load fine-tuned weights
            # self._model.load_state_dict(torch.load('polymer_classifier.pth'))
            
            self._model.to(self._device)
            self._model.eval()
            
            # Image transforms
            self._transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
            
            self._ready = True
            logger.info("Vision model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load vision model: {e}")
            self._ready = False
    
    def is_ready(self) -> bool:
        return self._ready
    
    async def classify(self, image_url: str) -> Dict[str, Any]:
        """Classify polymer from image URL"""
        if not self._ready:
            raise RuntimeError("Vision model not loaded")
        
        # Download image
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            image_bytes = response.content
        
        return self.classify_bytes(image_bytes)
    
    def classify_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """Classify polymer from image bytes"""
        if not self._ready:
            raise RuntimeError("Vision model not loaded")
        
        # Load and preprocess image
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        input_tensor = self._transform(image).unsqueeze(0).to(self._device)
        
        # Inference
        with torch.no_grad():
            outputs = self._model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        
        # Get top predictions
        top_probs, top_indices = torch.topk(probabilities, 5)
        
        predictions = []
        for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
            category = POLYMER_CATEGORIES[idx]
            predictions.append({
                "category": category,
                "confidence": float(prob)
            })
        
        top_category = predictions[0]["category"]
        top_confidence = predictions[0]["confidence"]
        
        # Get polymer type if available
        polymer_type = "General"
        if top_category in POLYMER_TYPES:
            polymer_type = POLYMER_TYPES[top_category][0]
        
        return {
            "category": top_category,
            "type": polymer_type,
            "confidence": top_confidence,
            "all_predictions": predictions
        }
    
    def extract_features(self, image_bytes: bytes) -> np.ndarray:
        """Extract feature vector from image for similarity search"""
        if not self._ready:
            raise RuntimeError("Vision model not loaded")
        
        # Load and preprocess image
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        input_tensor = self._transform(image).unsqueeze(0).to(self._device)
        
        # Extract features from penultimate layer
        features = []
        def hook(module, input, output):
            features.append(output.detach())
        
        handle = self._model._avg_pooling.register_forward_hook(hook)
        
        with torch.no_grad():
            self._model(input_tensor)
        
        handle.remove()
        
        # Flatten and return
        feature_vector = features[0].squeeze().cpu().numpy()
        return feature_vector
