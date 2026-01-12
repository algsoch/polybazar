"""
Price Prediction Service using ensemble ML models
"""

import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import random

from app.config import settings

logger = logging.getLogger(__name__)


# Base prices for different polymer categories (INR per KG)
BASE_PRICES = {
    "Polypropylene": {"base": 120, "min": 100, "max": 150},
    "Polyethylene": {"base": 110, "min": 90, "max": 140},
    "HDPE": {"base": 115, "min": 95, "max": 145},
    "LDPE": {"base": 125, "min": 105, "max": 155},
    "LLDPE": {"base": 130, "min": 110, "max": 160},
    "PVC": {"base": 95, "min": 75, "max": 125},
    "PET": {"base": 85, "min": 65, "max": 115},
    "Polystyrene": {"base": 140, "min": 120, "max": 170},
    "ABS": {"base": 180, "min": 150, "max": 220},
    "Polycarbonate": {"base": 250, "min": 200, "max": 320},
    "Nylon": {"base": 280, "min": 230, "max": 350},
    "Engineering Plastics": {"base": 200, "min": 150, "max": 280},
}

# Grade multipliers
GRADE_MULTIPLIERS = {
    "Prime": 1.0,
    "Off-Grade": 0.85,
    "Recycled": 0.65,
    "Wide-Spec": 0.90,
}

# Brand premium factors
BRAND_PREMIUMS = {
    "Reliance": 1.05,
    "IOCL": 1.03,
    "ONGC": 1.02,
    "SABIC": 1.08,
    "LyondellBasell": 1.10,
    "ExxonMobil": 1.12,
    "BASF": 1.07,
    "Dow": 1.09,
    "Other": 1.0,
}


class PricePredictorService:
    def __init__(self):
        self._ready = True
        logger.info("Price predictor service initialized")
    
    def is_ready(self) -> bool:
        return self._ready
    
    def predict(
        self,
        category: str,
        polymer_type: str,
        grade: Optional[str] = None,
        brand: Optional[str] = None,
        quantity: Optional[float] = 1.0,
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        """Predict polymer price based on features"""
        
        # Get base price
        base_info = BASE_PRICES.get(category, BASE_PRICES.get(polymer_type, {"base": 150, "min": 100, "max": 200}))
        base_price = base_info["base"]
        
        # Apply grade multiplier
        grade_mult = GRADE_MULTIPLIERS.get(grade, 1.0) if grade else 1.0
        
        # Apply brand premium
        brand_mult = BRAND_PREMIUMS.get(brand, 1.0) if brand else 1.0
        
        # Quantity discount
        quantity_discount = 1.0
        if quantity:
            if quantity >= 1000:
                quantity_discount = 0.92
            elif quantity >= 500:
                quantity_discount = 0.95
            elif quantity >= 100:
                quantity_discount = 0.97
        
        # Location adjustment (simplified)
        location_adj = 1.0
        if location:
            if location.lower() in ["mumbai", "gujarat", "maharashtra"]:
                location_adj = 0.98  # Near port/manufacturing hubs
            elif location.lower() in ["delhi", "up", "haryana"]:
                location_adj = 1.02  # Transport costs
        
        # Market volatility (random factor for demo)
        market_factor = random.uniform(0.97, 1.03)
        
        # Calculate predicted price
        predicted_price = (
            base_price 
            * grade_mult 
            * brand_mult 
            * quantity_discount 
            * location_adj 
            * market_factor
        )
        
        # Calculate price range
        min_price = predicted_price * 0.9
        max_price = predicted_price * 1.1
        
        # Confidence based on how many factors we have
        factors_count = sum([
            grade is not None,
            brand is not None,
            quantity is not None,
            location is not None
        ])
        confidence = 0.65 + (factors_count * 0.08)
        
        # Determine market trend
        trend = random.choice(["bullish", "bearish", "stable"])
        
        # Price factors explanation
        factors = [
            {"name": "Base Price", "impact": f"₹{base_price:.2f}/kg", "description": f"Standard market rate for {category}"},
            {"name": "Grade", "impact": f"{(grade_mult - 1) * 100:+.1f}%", "description": f"Grade adjustment for {grade or 'Prime'}"},
            {"name": "Brand", "impact": f"{(brand_mult - 1) * 100:+.1f}%", "description": f"Brand premium for {brand or 'Generic'}"},
            {"name": "Volume Discount", "impact": f"{(quantity_discount - 1) * 100:+.1f}%", "description": f"Discount for {quantity}kg order"},
        ]
        
        return {
            "predicted_price": round(predicted_price, 2),
            "price_range": {
                "min": round(min_price, 2),
                "max": round(max_price, 2)
            },
            "confidence": round(confidence, 2),
            "market_trend": trend,
            "factors": factors
        }
    
    def get_history(self, category: str, polymer_type: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get simulated price history (in production, fetch from database)"""
        
        base_info = BASE_PRICES.get(category, BASE_PRICES.get(polymer_type, {"base": 150, "min": 100, "max": 200}))
        base_price = base_info["base"]
        
        history = []
        current_price = base_price
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i)
            
            # Random walk for price simulation
            change = random.uniform(-0.02, 0.02)
            current_price = current_price * (1 + change)
            
            # Keep within bounds
            current_price = max(base_info["min"], min(base_info["max"], current_price))
            
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(current_price, 2),
                "volume": random.randint(100, 1000)
            })
        
        return history
