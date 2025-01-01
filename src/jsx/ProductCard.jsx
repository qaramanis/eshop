// ProductCard.jsx
import React from 'react';
import { useState } from 'react';
import '../css/ProductCard.css';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

const ProductCard = ({ product }) => {
    const [selectedColor, setSelectedColor] = useState('');
    const { addToCart } = useCart();
    const [showTooltip, setShowTooltip] = useState(false);

    const handleAddToCart = () => {
        if (product.type === 'smartphones') {
            if (!selectedColor) {
                setShowTooltip(true);
                return;
            }
            addToCart(product, selectedColor);
        } else {
            addToCart(product);
        }
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setShowTooltip(false);
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={product.image_url} alt={product.name} className="product-image" />
                {product.quantity === 0 && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-manufacturer">{product.manufacturer}</p>
                {product.type === 'smartphones' && product.colors?.length > 0 && (
                    <div className="color-selection">
                        <p className="color-label">Color:</p>
                        <div className="color-buttons">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    className={`color-button ${selectedColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorSelect(color)}
                                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                                >
                                    {selectedColor === color && <span className="check-mark">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                    <span className="product-price">${product.price}</span>
                    <div className="cart-button-container">
                        <button 
                            className={`add-to-cart-btn ${product.quantity === 0 ? 'disabled' : ''} ${
                                product.type === 'smartphones' && !selectedColor ? 'color-required' : ''
                            }`}
                            disabled={product.quantity === 0}
                            onClick={handleAddToCart}
                            onMouseEnter={() => {
                                if (product.type === 'smartphones' && !selectedColor) {
                                    setShowTooltip(true);
                                }
                            }}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                        {showTooltip && product.type === 'smartphones' && !selectedColor && (
                            <div className="tooltip">Please select a color first</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;