import React, { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import '../css/CartPage.css';

const CartPage = () => {
    const { cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + Number(item.price), 0);
    };

    const isTextTruncated = (element) => {
        return element ? element.offsetWidth < element.scrollWidth : false;
    };

    const ProductName = ({ name }) => {
        const nameRef = useRef(null);
        const [isTruncated, setIsTruncated] = React.useState(false);

        useEffect(() => {
            const checkTruncation = () => {
                setIsTruncated(isTextTruncated(nameRef.current));
            };

            checkTruncation();
            window.addEventListener('resize', checkTruncation);
            
            return () => window.removeEventListener('resize', checkTruncation);
        }, [name]);

        return (
            <h3 
                ref={nameRef}
                title={isTruncated ? name : undefined}
                className={isTruncated ? 'truncated' : ''}
            >
                {name}
            </h3>
        );
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page empty-cart">
                <h2>Your Cart is Empty</h2>
                <p>Add some items to your cart to see them here!</p>
                <button 
                    className="checkout-button" 
                    onClick={() => navigate('/')}
                    style={{ maxWidth: '200px', marginTop: '2rem' }}
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h2>Your Cart</h2>
            <div className="cart-content">
                <ul className="cart-items">
                    {cartItems.map((item, index) => (
                        <li key={item.cartId || index} className="cart-item">
                            <div className="item-image">
                                <img src={item.image_url} alt={item.name} />
                            </div>
                            <div className="item-details">
                                <ProductName name={item.name} />
                                <p className="item-manufacturer">{item.manufacturer}</p>
                                {item.selectedColor && (
                                    <p className="item-color">
                                        Color: <span style={{ color: item.selectedColor }}>{item.selectedColor}</span>
                                    </p>
                                )}
                            </div>
                            <div className="item-price">${Number(item.price).toFixed(2)}</div>
                            <button 
                                className="remove-item"
                                onClick={() => removeFromCart(index)}
                                aria-label="Remove item"
                            >
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="cart-summary">
                    <div className="summary-row total">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <button 
                        className="checkout-button"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;