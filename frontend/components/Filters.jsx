'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'HDPE', label: 'HDPE' },
  { value: 'LDPE', label: 'LDPE' },
  { value: 'LLDPE', label: 'LLDPE' },
  { value: 'PP', label: 'PP' },
  { value: 'PET', label: 'PET' },
  { value: 'PVC', label: 'PVC' },
  { value: 'PS', label: 'PS' },
  { value: 'ABS', label: 'ABS' },
  { value: 'PC', label: 'PC' },
];

const grades = [
  { value: '', label: 'All Grades' },
  { value: 'A+', label: 'Grade A+' },
  { value: 'A', label: 'Grade A' },
  { value: 'B+', label: 'Grade B+' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' },
];

const locations = [
  { value: '', label: 'All Locations' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Hyderabad', label: 'Hyderabad' },
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    grade: searchParams.get('grade') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    verified: searchParams.get('verified') === 'true',
  });

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      grade: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      verified: false,
    });
    router.push('/products');
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== false);

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-small font-medium text-gray-900 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="input py-2"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Grade */}
      <div>
        <label className="block text-small font-medium text-gray-900 mb-2">
          Grade
        </label>
        <select
          value={filters.grade}
          onChange={(e) => updateFilters({ grade: e.target.value })}
          className="input py-2"
        >
          {grades.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-small font-medium text-gray-900 mb-2">
          Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => updateFilters({ location: e.target.value })}
          className="input py-2"
        >
          {locations.map(loc => (
            <option key={loc.value} value={loc.value}>{loc.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-small font-medium text-gray-900 mb-2">
          Price Range (₹/kg)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            className="input py-2 w-full"
            min="0"
          />
          <span className="flex items-center text-neutral-muted">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="input py-2 w-full"
            min="0"
          />
        </div>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => updateFilters({ verified: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-border text-primary focus:ring-primary"
          />
          <span className="text-small font-medium text-gray-900">Verified sellers only</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-neutral-border">
        <button onClick={applyFilters} className="btn-primary w-full">
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost w-full text-danger">
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
