import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiStar, FiClock, FiShoppingBag, FiPackage } from 'react-icons/fi';
import '../Dashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('restaurants');

  useEffect(() => {
    fetchRestaurants();
    fetchOrders();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">tomato</Link>
          <div className="dashboard-user-info">
            <span className={`dashboard-role-badge ${user.role}`}>{user.role}</span>
            <span>{user.name}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red"><FiShoppingBag /></div>
            <div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FiPackage /></div>
            <div><div className="stat-value">{activeOrders.length}</div><div className="stat-label">Active Orders</div></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className={`filter-btn ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')} style={tab === 'restaurants' ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
            Browse Restaurants
          </button>
          <button className={`filter-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')} style={tab === 'orders' ? { background: 'var(--color-primary)', color: 'white', border: 'none' } : {}}>
            My Orders
          </button>
        </div>

        {tab === 'restaurants' && (
          <div className="restaurant-list">
            {restaurants.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🍽️</div><p>No restaurants available yet</p></div>
            ) : (
              restaurants.map(r => (
                <div key={r._id} className="rest-card" onClick={() => navigate(`/customer/restaurant/${r._id}`)}>
                  <div className="rest-card-img"><img src={r.image} alt={r.name} /></div>
                  <div className="rest-card-info">
                    <h3>{r.name}</h3>
                    <div className="rest-card-meta">
                      <span className="rest-rating"><FiStar /> {r.rating || '4.0'}</span>
                      <span><FiClock /> {r.deliveryTime}</span>
                    </div>
                    <div className="rest-cuisines">{r.cuisines?.join(', ')}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>₹{r.costForTwo} for two</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="order-list">
            {orders.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📦</div><p>No orders yet</p></div>
            ) : (
              orders.map(o => (
                <div key={o._id} className="order-card" onClick={() => !['delivered', 'cancelled'].includes(o.status) && navigate(`/customer/track/${o._id}`)}>
                  <div className="order-card-header">
                    <span className="order-id">#{o._id.slice(-6)}</span>
                    <span className={`order-status ${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="order-restaurant">{o.restaurant?.name || 'Restaurant'}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="order-amount">₹{o.totalAmount}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
