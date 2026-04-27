import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiArrowLeft, FiMapPin, FiNavigation, FiCreditCard, FiTrash2 } from 'react-icons/fi';
import '../Dashboard.css';

const Cart = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem('cartRestaurantId'));
  const [restaurant, setRestaurant] = useState(null);
  const [ordering, setOrdering] = useState(false);

  // Address State
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [address, setAddress] = useState({
    flat: '',
    landmark: '',
    area: '',
    city: 'Bangalore',
    pincode: ''
  });

  const savedAddresses = [
    { id: 1, label: 'Home', full: 'Flat 402, Sunshine Apts, Koramangala, Bangalore - 560034' },
    { id: 2, label: 'Office', full: 'Level 5, WeWork Galaxy, Residency Rd, Bangalore - 560025' }
  ];

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get(`/restaurants/${restaurantId}`);
      setRestaurant(data);
    } catch (err) { console.error(err); }
  };

  const updateQty = (menuItemId, delta) => {
    const newCart = cart.map(item => 
      item.menuItem === menuItemId ? { ...item, quantity: item.quantity + delta } : item
    ).filter(item => item.quantity > 0);
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (newCart.length === 0) {
      localStorage.removeItem('cartRestaurantId');
      setRestaurantId(null);
    }
  };

  const removeItem = (menuItemId) => {
    const newCart = cart.filter(item => item.menuItem !== menuItemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    if (newCart.length === 0) {
      localStorage.removeItem('cartRestaurantId');
      setRestaurantId(null);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const captureLocation = () => {
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation([pos.coords.longitude, pos.coords.latitude]);
        setLocatingGps(false);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(r => r.json())
          .then(data => {
            if (data.address) {
              setAddress(prev => ({
                ...prev,
                area: data.address.suburb || data.address.neighbourhood || '',
                city: data.address.city || data.address.town || 'Bangalore',
                pincode: data.address.postcode || ''
              }));
            }
          });
      },
      () => setLocatingGps(false),
      { enableHighAccuracy: true }
    );
  };

  const placeOrder = async () => {
    if (!gpsLocation) return alert('Please enable location for delivery');
    if (!address.flat) return alert('Please enter your flat/house number');

    setOrdering(true);
    try {
      const fullAddr = `${address.flat}, ${address.landmark}, ${address.area}, ${address.city} - ${address.pincode}`;
      await api.post('/orders', {
        restaurantId,
        items: cart,
        totalAmount: total,
        deliveryAddress: fullAddr,
        customerLocation: { type: 'Point', coordinates: gpsLocation }
      });
      localStorage.removeItem('cart');
      localStorage.removeItem('cartRestaurantId');
      alert('Order placed successfully! 🎉');
      navigate('/customer');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
    setOrdering(false);
  };

  if (cart.length === 0) {
    return (
      <div className="dashboard-layout">
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <Link to="/" className="dashboard-logo">tomato</Link>
          </div>
        </header>
        <div className="dashboard-content" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Go back to browse restaurants and add some food!</p>
            <button className="primary-btn" onClick={() => navigate('/customer')} style={{ marginTop: '20px' }}>Explore Restaurants</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span className="dashboard-name">{user.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </div>

        <div className="cart-page-grid">
          <div className="cart-main">
            <section className="premium-card cart-items-section">
              <h3>Order Summary {restaurant && `from ${restaurant.name}`}</h3>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.menuItem} className="cart-page-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                    <div className="item-actions">
                      <div className="qty-control">
                        <button onClick={() => updateQty(item.menuItem, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.menuItem, 1)}>+</button>
                      </div>
                      <button className="delete-btn" onClick={() => removeItem(item.menuItem)}><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary-total">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </section>

            <section className="premium-card address-section">
              <h3><FiMapPin /> Delivery Address</h3>
              
              <div className="saved-addresses">
                <p className="section-label">Saved Addresses</p>
                <div className="address-options">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className="address-pill" onClick={() => setAddress({ ...address, flat: addr.full })}>
                      <strong>{addr.label}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="location-picker">
                {!gpsLocation ? (
                  <button className="location-btn" onClick={captureLocation} disabled={locatingGps}>
                    {locatingGps ? 'Locating...' : <><FiNavigation /> Use Current Location</>}
                  </button>
                ) : (
                  <div className="location-success">📍 Location Captured Successfully</div>
                )}
              </div>

              <div className="address-form">
                <div className="input-group">
                  <label>Flat / House No. / Building</label>
                  <input type="text" value={address.flat} onChange={e => setAddress({...address, flat: e.target.value})} placeholder="e.g. Flat 302, Tower B" />
                </div>
                <div className="input-group">
                  <label>Landmark</label>
                  <input type="text" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} placeholder="e.g. Near Metro Station" />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Area</label>
                    <input type="text" value={address.area} onChange={e => setAddress({...address, area: e.target.value})} placeholder="Area" />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="cart-sidebar">
            <div className="premium-card payment-card">
              <h3>Payment</h3>
              <div className="payment-method selected">
                <FiCreditCard />
                <span>Cash on Delivery</span>
              </div>
              <div className="bill-details">
                <div className="bill-row"><span>Item Total</span><span>₹{total}</span></div>
                <div className="bill-row"><span>Delivery Fee</span><span>₹40</span></div>
                <div className="bill-row total"><span>Total Pay</span><span>₹{total + 40}</span></div>
              </div>
              <button className="checkout-btn-full" onClick={placeOrder} disabled={ordering}>
                {ordering ? 'Processing...' : `Place Order`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
