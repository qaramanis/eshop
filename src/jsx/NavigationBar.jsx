import React from "react";
import { Search, ShoppingCart } from "lucide-react";
import '../css/NavigationBar.css';
import { useCart } from './CartContext';

const NavigationBar = () => {
    const { cartItems } = useCart();


    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="logo">
                    <h1 className="logo-text">E-Shop</h1>
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
                    <button className="cart-button">
                        <ShoppingCart size={24} />
                        <span className="cart-badge">{cartItems.length}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;