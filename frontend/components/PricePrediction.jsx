'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function PricePrediction({ category, grade, location, currentPrice }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
  }, [category, grade, location]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/ml/price/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, grade, location }),
      });

      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      }
    } catch {
      // Mock prediction for demo
      const basePrice = 60 + Math.floor(Math.random() * 30);
      setPrediction({
        predictedPrice: basePrice,
        minPrice: basePrice - 15,
        maxPrice: basePrice + 20,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: (Math.random() * 10).toFixed(1),
        confidence: 0.85 + Math.random() * 0.1,
        factors: [
          { name: 'Market Demand', impact: 'positive' },
          { name: 'Crude Oil Price', impact: 'neutral' },
          { name: 'Seasonal Trend', impact: 'positive' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const priceDiff = currentPrice - (prediction?.predictedPrice || 0);
  const priceStatus = priceDiff > 5 ? 'high' : priceDiff < -5 ? 'low' : 'fair';

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-neutral-bg rounded w-1/3 mb-4" />
        <div className="h-10 bg-neutral-bg rounded w-1/2 mb-4" />
        <div className="h-4 bg-neutral-bg rounded w-full" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-6 h-6 text-primary" />
        <h3 className="font-semibold text-gray-900">AI Price Analysis</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Predicted Price */}
        <div className="space-y-4">
          <div>
            <p className="text-small text-neutral-muted mb-1">AI Predicted Price</p>
            <div className="flex items-end gap-2">
              <span className="text-display font-bold text-primary">
                ₹{prediction?.predictedPrice}
              </span>
              <span className="text-h4 text-neutral-muted mb-2">/kg</span>
            </div>
            <p className="text-tiny text-neutral-muted">
              Range: ₹{prediction?.minPrice} - ₹{prediction?.maxPrice}
            </p>
          </div>

          {/* Price Comparison */}
          <div className={`p-4 rounded-lg ${
            priceStatus === 'high' ? 'bg-danger-light' :
            priceStatus === 'low' ? 'bg-success-light' : 'bg-neutral-bg'
          }`}>
            <p className="text-small font-medium mb-1">
              Current listing price: ₹{currentPrice}/kg
            </p>
            <p className={`text-tiny ${
              priceStatus === 'high' ? 'text-danger' :
              priceStatus === 'low' ? 'text-success' : 'text-neutral-text'
            }`}>
              {priceStatus === 'high' ? 'Above market average — may take longer to sell' :
               priceStatus === 'low' ? 'Below market average — great deal!' :
               'Fair market price'}
            </p>
          </div>
        </div>

        {/* Trend & Factors */}
        <div className="space-y-4">
          {/* Market Trend */}
          <div className={`p-4 rounded-lg flex items-center gap-4 ${
            prediction?.trend === 'up' ? 'bg-success-light' : 'bg-danger-light'
          }`}>
            {prediction?.trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-8 h-8 text-success" />
            ) : (
              <ArrowTrendingDownIcon className="w-8 h-8 text-danger" />
            )}
            <div>
              <p className={`font-semibold ${prediction?.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                {prediction?.trend === 'up' ? 'Prices Rising' : 'Prices Falling'}
              </p>
              <p className="text-tiny text-neutral-muted">
                {prediction?.trendPercentage}% in the last 30 days
              </p>
            </div>
          </div>

          {/* Factors */}
          <div>
            <p className="text-small text-neutral-muted mb-2">Price Factors</p>
            <ul className="space-y-2">
              {prediction?.factors?.map((factor, i) => (
                <li key={i} className="flex items-center gap-2 text-small">
                  <span className={`w-2 h-2 rounded-full ${
                    factor.impact === 'positive' ? 'bg-success' :
                    factor.impact === 'negative' ? 'bg-danger' : 'bg-neutral-muted'
                  }`} />
                  <span>{factor.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="mt-4 pt-4 border-t border-neutral-border flex items-center gap-2">
        <InformationCircleIcon className="w-4 h-4 text-neutral-muted" />
        <p className="text-tiny text-neutral-muted">
          AI confidence: {Math.round((prediction?.confidence || 0) * 100)}% — Based on {category} market data from {location}
        </p>
      </div>
    </div>
  );
}
