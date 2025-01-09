import {React, useState} from 'react';
import '../css/ProductGrid.css';
import ProductCard from './ProductCard';
import { marketplaceService } from '../../api/MarketplaceService.js';

const ProductGrid = ({ loading }) => {
    const [products, setProducts] = useState(null);
    // if (loading) {
    //     return <div className="products-loading">Loading products...</div>;
    // }
    
    async function fetchProducts() {
        const products = await marketplaceService.getAllProducts();
        console.log(products);
    }
    
    if (!products || products.length === 0) {
        return <div className="no-products">No products found matching your criteria</div>;
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard 
                    key={`${product.type}-${product.id}`} 
                    product={product} 
                />
            ))}
        </div>
    );
};

export default ProductGrid;