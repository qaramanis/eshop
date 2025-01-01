// ProductGrid.jsx
import React from 'react';
import '../css/ProductGrid.css';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading }) => {
    if (loading) {
        return <div className="products-loading">Loading products...</div>;
    }

    if (!products || products.length === 0) {
        return <div className="no-products">No products found matching your criteria</div>;
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;