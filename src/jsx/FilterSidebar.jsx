import React, { useState, useEffect } from 'react';
import '../css/FilterSidebar.css';
import { fetchManufacturers, fetchPriceRange } from '../SupabaseClient';

const FilterSidebar = ({ onFiltersChange }) => {
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 2000]);
  const [availability, setAvailability] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeFilters = async () => {
      try {
        setLoading(true);
        // If no type is selected, fetch manufacturers for all types
        const manufacturerList = await fetchManufacturers(selectedTypes[0]);
        setManufacturers(manufacturerList);
        const priceRangeData = await fetchPriceRange(selectedTypes);
        setPriceRange(priceRangeData);
        setSelectedPriceRange([priceRangeData.min, priceRangeData.max]);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeFilters();
  }, [selectedTypes]);

  useEffect(() => {
    const filters = {
      type: selectedTypes,
      manufacturer: selectedManufacturers.length > 0 ? selectedManufacturers : undefined,
      priceRange: selectedPriceRange,
      availability: availability
    };

    onFiltersChange(filters);
  }, [selectedManufacturers, selectedPriceRange, availability, selectedTypes]);

  const handleTypeChange = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleManufacturerChange = (manufacturer) => {
    setSelectedManufacturers(prev => {
      if (prev.includes(manufacturer)) {
        return prev.filter(m => m !== manufacturer);
      } else {
        return [...prev, manufacturer];
      }
    });
  };

  const handlePriceChange = (value, index) => {
    setSelectedPriceRange(prev => {
      const newRange = [...prev];
      newRange[index] = Number(value);
      return newRange;
    });
  };

  const clearFilters = () => {
    setSelectedTypes([]); // Clear all types to show everything
    setSelectedManufacturers([]);
    setSelectedPriceRange([priceRange.min, priceRange.max]);
    setAvailability(null);
  };

  // if (loading) {
  //   return <div className="sidebar loading">Loading filters...</div>;
  // }

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Filters</h2>

      <div className="filter-section">
        <h3 className="filter-heading">Product Type</h3>
        <div className="filter-options">
          <div className="filter-option">
            <label className="filter-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedTypes.includes('smartphones')}
                onChange={() => handleTypeChange('smartphones')}
              />
              <span>Smartphones</span>
            </label>
          </div>
          <div className="filter-option">
            <label className="filter-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={selectedTypes.includes('accessories')}
                onChange={() => handleTypeChange('accessories')}
              />
              <span>Accessories</span>
            </label>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-heading">Price Range</h3>
        <div className="price-range">
          <div className="price-inputs">
            <input 
              type="number"
              className="price-input"
              value={selectedPriceRange[0]}
              onChange={(e) => handlePriceChange(e.target.value, 0)}
              min={priceRange.min}
              max={priceRange.max}
            />
            <span className="price-separator">-</span>
            <input 
              type="number"
              className="price-input"
              value={selectedPriceRange[1]}
              onChange={(e) => handlePriceChange(e.target.value, 1)}
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            className="price-slider"
            value={selectedPriceRange[1]}
            onChange={(e) => handlePriceChange(e.target.value, 1)}
          />
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-heading">Manufacturer</h3>
        <div className="filter-options">
          {manufacturers.map((manufacturer) => (
            <label key={manufacturer} className="filter-label">
              <input 
                type="checkbox" 
                className="filter-checkbox"
                checked={selectedManufacturers.includes(manufacturer)}
                onChange={() => handleManufacturerChange(manufacturer)}
              />
              <span>{manufacturer}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-heading">Availability</h3>
        <div className="filter-options">
          <div className="filter-option">
            <label className="filter-label">
              <input 
                type="radio" 
                name="availability" 
                className="filter-radio"
                checked={availability === true}
                onChange={() => setAvailability(true)}
              />
              <span>In Stock</span>
            </label>
          </div>
          <div className="filter-option">
            <label className="filter-label">
              <input 
                type="radio" 
                name="availability" 
                className="filter-radio"
                checked={availability === false}
                onChange={() => setAvailability(false)}
              />
              <span>Include Out of Stock</span>
            </label>
          </div>
        </div>
      </div>

      <button className="clear-filters-btn" onClick={clearFilters}>
        Clear Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;