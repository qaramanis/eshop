import React from "react";
import { Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import '../css/NavigationBar.css';
import { useCart } from './CartContext';

const NavigationBar = () => {
    const { itemCount } = useCart();
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="logo">
                    <Link to="/" className="logo-text">E-Shop</Link>
                </div>

                <div className="search-container">
                    <div className="search-icon">
                        <Search size={15} />
                    </div>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search..."
                    />
                </div>

                <div className="cart-container">
                    <button 
                        className="cart-button"
                        onClick={() => navigate('/cart')}
                    >
                        <ShoppingCart size={24} />
                        <span className="cart-badge">{itemCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;