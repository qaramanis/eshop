import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { ChevronLeft, CreditCard, Building2, PackageCheck } from 'lucide-react';
import '../css/CheckoutPage.css';
import { submitOrder } from '../SupabaseClient';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponError, setShowCouponError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  

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

  const validateForm = () => {
    const newErrors = {};
    
    // Contact Information Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    // Shipping Address Validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = 'Invalid ZIP code';
    }
    
    // Payment Validation (only if credit card is selected)
    if (paymentMethod === 'credit-card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\D/g, ''))) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
      }
      
      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCvv)) {
        newErrors.cardCvv = 'Invalid CVV';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true); 
        
        const orderData = {
          ...formData,
          paymentMethod
        };
        
        const result = await submitOrder(orderData, cartItems, totalPrice);
        
        if (result.success) {
          clearCart();
          setShowConfirmation(true);
        }
      } catch (error) {
        setSubmitError(error.message); 
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  if (showConfirmation) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-container">
          <div className="confirmation-icon">
            <PackageCheck size={32} />
          </div>
          <h2>Order Confirmed!</h2>
          <p>
            Thank you for your order. We'll send you a confirmation email with your order details shortly.
          </p>
          <button
            onClick={() => {
              navigate('/');
            }}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const renderInput = (name, label, type = "text", placeholder = "") => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={errors[name] ? 'error-input' : ''}
      />
      {errors[name] && (
        <span className="error-message">{errors[name]}</span>
      )}
    </div>
  );

  const handleCouponApply = () => {
    setShowCouponError(true);
    // Make error disappear after 2 seconds
    setTimeout(() => {
      setShowCouponError(false);
    }, 2000);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form">        
          <div className="form-section">
            <h2>Contact Information</h2>
            <div className="form-grid">
              {renderInput("firstName", "First Name")}
              {renderInput("lastName", "Last Name")}
              {renderInput("email", "Email", "email")}
              {renderInput("phone", "Phone", "tel")}
            </div>
          </div>

          <div className="form-section">
            <h2>Shipping Address</h2>
            <div className="form-stack">
              {renderInput("address", "Street Address")}
              <div className="form-grid">
                {renderInput("city", "City")}
                {renderInput("state", "State/Province")}
                {renderInput("zipCode", "ZIP Code")}
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
                {renderInput("cardNumber", "Card Number", "text", "1234 5678 9012 3456")}
                <div className="form-grid">
                  {renderInput("cardExpiry", "Expiry Date", "text", "MM/YY")}
                  {renderInput("cardCvv", "CVV", "text", "123")}
                </div>
              </div>
            )}
          </div>
        </div>

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
            <button type="button" onClick={handleCouponApply}>
              Apply
            </button>
            {showCouponError && (
              <div className="coupon-error">Invalid promo code</div>
            )}
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

        {submitError && (
          <div className="error-message" style={{ marginTop: '1rem', textAlign: 'center' }}>
            {submitError}
          </div>
        )}

        <button 
          type="button" 
          className="place-order-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;