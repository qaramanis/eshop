import { useState, useEffect } from 'react';
import '../css/App.css';
import NavigationBar from './NavigationBar';
import FilterSidebar from './FilterSidebar';
import ProductGrid from './ProductGrid';
import { fetchProducts } from '../SupabaseClient';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: [], 
    manufacturer: undefined,
    priceRange: [0, 2000],
    availability: null
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const productsData = await fetchProducts(filters.type, {
          manufacturer: filters.manufacturer,
          priceRange: filters.priceRange,
          availability: filters.availability
        });

        setProducts(productsData || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="app">
      <NavigationBar />
      <div className="main-content">
        <FilterSidebar onFiltersChange={handleFiltersChange} />
        <main className="products-container">
          <ProductGrid 
            products={products} 
            loading={loading}
            error={error}
          />
        </main>
      </div>
    </div>
  );
}

export default App;