import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiArrowLeft, FiStar, FiClock, FiShoppingCart } from 'react-icons/fi';
import '../Dashboard.css';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, [id]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length > 0) {
      localStorage.setItem('cartRestaurantId', id);
    } else {
      localStorage.removeItem('cartRestaurantId');
    }
  }, [cart, id]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      setRestaurant(data);
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}/menu`);
      setMenuItems(data);
    } catch (err) { console.error(err); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      // Check if adding from a different restaurant
      const currentResId = localStorage.getItem('cartRestaurantId');
      if (currentResId && currentResId !== id) {
        if (!window.confirm('You have items from another restaurant. Clear cart and add this item?')) {
          return prev;
        }
        return [{ menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
      }

      const existing = prev.find(c => c.menuItem === item._id);
      if (existing) {
        return prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  if (!restaurant) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="back-link" onClick={() => navigate('/customer')}>
          <FiArrowLeft /> Back to restaurants
        </div>

        {/* Restaurant Header */}
        <div className="menu-header premium-card">
          <div className="menu-header-img"><img src={restaurant.image} alt={restaurant.name} /></div>
          <div className="menu-header-info">
            <h1>{restaurant.name}</h1>
            <p className="cuisines-text">{restaurant.cuisines?.join(', ')}</p>
            <p className="address-text">{restaurant.address}</p>
            <div className="meta-info">
              <span className="rest-rating"><FiStar /> {restaurant.rating || '4.0'}</span>
              <span className="meta-item"><FiClock /> {restaurant.deliveryTime}</span>
              <span className="meta-item">₹{restaurant.costForTwo} for two</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="menu-section">
          <h2 className="section-title">Menu</h2>
          {menuItems.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><p>No menu items yet</p></div>
          ) : (
            <div className="menu-grid">
              {menuItems.map(item => (
                <div key={item._id} className="menu-item-card premium-card">
                  <div className="menu-item-img"><img src={item.image} alt={item.name} /></div>
                  <div className="menu-item-info">
                    <h4><span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></span>{item.name}</h4>
                    <div className="price">₹{item.price}</div>
                    <p className="item-desc">{item.description}</p>
                    <button className="add-to-cart-btn" onClick={() => addToCart(item)}>ADD</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart FAB */}
        {cart.length > 0 && (
          <div className="cart-fab" onClick={() => navigate('/customer/cart')}>
            <div className="cart-fab-info">
              <span className="item-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              <span className="total-amount">₹{totalPrice} plus taxes</span>
            </div>
            <div className="cart-fab-link">
              View Cart <FiShoppingCart />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;

