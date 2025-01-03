import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { ChevronLeft, CreditCard, Building2, PackageCheck } from 'lucide-react';
import '../css/CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [couponCode, setCouponCode] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>Your cart is empty</h2>
        <button 
          onClick={() => navigate('/')}
          className="return-to-shop"
        >
          <ChevronLeft size={20} />
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Contact Information */}
          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  maxLength="15"
                  placeholder="e.g., 1234567890"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Shipping Address</h2>
            <div className="form-stack">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State/ Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    placeholder="e.g., 12345"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit-card')}
                className={`payment-method-btn ${paymentMethod === 'credit-card' ? 'active' : ''}`}
              >
                <CreditCard size={20} />
                <span>Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`payment-method-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
              >
                <Building2 size={20} />
                <span>Bank Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('digital')}
                className={`payment-method-btn ${paymentMethod === 'digital' ? 'active' : ''}`}
              >
                <PackageCheck size={20} />
                <span>Payment on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="credit-card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.cartId} className="summary-item">
                <div className="item-info">
                  <img src={item.image_url} alt={item.name} />
                  <div>
                    <p className="item-name">{item.name}</p>
                    {item.selectedColor && (
                      <p className="item-color">{item.selectedColor}</p>
                    )}
                  </div>
                </div>
                <p className="item-price">${Number(item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="coupon-section">
            <div className="coupon-input">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <button type="button">Apply</button>
            </div>
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" className="place-order-btn">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;