# 🍅 Tomato - Full Stack Food Delivery Application

Tomato is a modern, high-performance food delivery platform built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time order tracking, comprehensive restaurant management, and a premium user experience.

## 🚀 Features

- **Real-time Tracking**: Live order status updates using Socket.io.
- **Multi-user Roles**: Dedicated dashboards for Customers, Restaurant Owners, and Delivery Partners.
- **Authentication**: Secure JWT-based authentication with Firebase integration.
- **Dynamic Maps**: Integrated Leaflet/Google Maps for restaurant locations and delivery tracking.
- **Responsive Design**: Premium, mobile-first UI built with modern CSS and React.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Axios, Socket.io-client, React Router, Leaflet.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, Firebase Admin SDK.
- **Hosting**: Vercel (Frontend), Render (Backend).

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/NotArsal/Tomato.git
cd Tomato
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

### 3. Frontend Setup
```bash
# Return to root
cd ..
npm install
npm run dev
```

## 🌐 Hosting Configuration

### Render (Backend)
1. **Root Directory**: `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`
4. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB string.
   - `JWT_SECRET`: Your secret key.
   - `FIREBASE_SERVICE_ACCOUNT`: The full JSON string from your `serviceAccountKey.json`.
   - `CLIENT_URL`: Your hosted frontend URL.

### Vercel (Frontend)
1. **Framework Preset**: `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Your hosted backend URL (e.g., `https://api.example.com/api`).
   - `VITE_SOCKET_URL`: Your hosted backend URL.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Arsal](https://github.com/NotArsal)
