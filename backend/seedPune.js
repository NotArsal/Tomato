const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tomato';

const puneRestaurants = [
  {
    name: "Vohuman Cafe",
    description: "Famous for Irani Chai and Bun Maska. A legendary breakfast spot in Pune.",
    address: "Millennium Star, Near Ruby Hall Clinic, Sassoon Road, Pune",
    cuisines: ["Irani", "Cafe", "Breakfast"],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800",
    deliveryTime: "25-30 mins",
    costForTwo: 400,
    rating: 4.5,
    location: { type: "Point", coordinates: [73.8744, 18.5292] }, // Sassoon Road
    menu: [
      { name: "Bun Maska", price: 60, description: "Classic Irani bun with generous butter", isVeg: true, category: "Breakfast" },
      { name: "Cheese Omelette", price: 120, description: "Three eggs with melted cheese", isVeg: false, category: "Eggs" },
      { name: "Irani Chai", price: 40, description: "Strong and milky Irani tea", isVeg: true, category: "Beverages" }
    ]
  },
  {
    name: "Marz-O-Rin",
    description: "Historic bakery known for sandwiches and cold coffee in a heritage building.",
    address: "Bakthiar Plaza, MG Road, Camp, Pune",
    cuisines: ["Bakery", "Fast Food", "Desserts"],
    image: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=800",
    deliveryTime: "30-35 mins",
    costForTwo: 500,
    rating: 4.4,
    location: { type: "Point", coordinates: [73.8778, 18.5144] }, // MG Road
    menu: [
      { name: "Chicken Sandwich", price: 90, description: "Their signature cold chicken sandwich", isVeg: false, category: "Sandwiches" },
      { name: "Cold Coffee", price: 110, description: "Thick and creamy cold coffee", isVeg: true, category: "Beverages" },
      { name: "Veg Burger", price: 85, description: "Classic veg patty with mayo", isVeg: true, category: "Burgers" }
    ]
  },
  {
    name: "Blue Nile",
    description: "Iconic restaurant famous for its Irani Mutton Biryani.",
    address: "Opposite Poona Club, Camp, Pune",
    cuisines: ["Mughlai", "North Indian", "Biryani"],
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800",
    deliveryTime: "40-45 mins",
    costForTwo: 1200,
    rating: 4.2,
    location: { type: "Point", coordinates: [73.8765, 18.5255] }, // Near Poona Club
    menu: [
      { name: "Mutton Biryani", price: 450, description: "Signature Irani style mutton biryani", isVeg: false, category: "Main Course" },
      { name: "Butter Chicken", price: 380, description: "Creamy tomato based chicken curry", isVeg: false, category: "Main Course" },
      { name: "Garlic Naan", price: 60, description: "Tandoori bread with garlic", isVeg: true, category: "Breads" }
    ]
  },
  {
    name: "Bedekar Misal",
    description: "One of the oldest and most famous Misal spots in Pune.",
    address: "Narayan Peth, Pune",
    cuisines: ["Maharashtrian", "Street Food"],
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800",
    deliveryTime: "20-25 mins",
    costForTwo: 300,
    rating: 4.6,
    location: { type: "Point", coordinates: [73.8499, 18.5168] }, // Narayan Peth
    menu: [
      { name: "Puneri Misal", price: 110, description: "Spicy sprouts curry with farsan and bread", isVeg: true, category: "Snacks" },
      { name: "Sol Kadhi", price: 50, description: "Refreshing kokum and coconut milk drink", isVeg: true, category: "Beverages" }
    ]
  },
  {
    name: "Le Plaisir",
    description: "Premium European cafe known for exquisite desserts and pasta.",
    address: "Prabhat Road, Deccan Gymkhana, Pune",
    cuisines: ["European", "French", "Desserts"],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800",
    deliveryTime: "35-40 mins",
    costForTwo: 1500,
    rating: 4.7,
    location: { type: "Point", coordinates: [73.8395, 18.5142] }, // Prabhat Road
    menu: [
      { name: "Pesto Pasta", price: 480, description: "Fresh basil pesto with parmesan", isVeg: true, category: "Pasta" },
      { name: "Macarons (Box of 6)", price: 550, description: "Assorted French macarons", isVeg: true, category: "Desserts" }
    ]
  },
  {
    name: "Agent Jack's",
    description: "Popular bar and kitchen with a unique bidding system.",
    address: "Hinjewadi Phase 1, Pune",
    cuisines: ["Multi-cuisine", "Finger Food"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800",
    deliveryTime: "35-45 mins",
    costForTwo: 1400,
    rating: 4.1,
    location: { type: "Point", coordinates: [73.7388, 18.5913] }, // Hinjewadi
    menu: [
      { name: "Chicken Wings", price: 320, description: "Spicy buffalo wings", isVeg: false, category: "Starters" },
      { name: "Paneer Tikka", price: 280, description: "Marinated grilled cottage cheese", isVeg: true, category: "Starters" }
    ]
  },
  {
    name: "George Restaurant",
    description: "Vintage dining room serving classic North Indian and Mughlai dishes.",
    address: "East Street, Camp, Pune",
    cuisines: ["North Indian", "Mughlai"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800",
    deliveryTime: "30-40 mins",
    costForTwo: 1000,
    rating: 4.3,
    location: { type: "Point", coordinates: [73.8795, 18.5125] }, // East Street
    menu: [
      { name: "Chicken Tikka Masala", price: 390, description: "Grilled chicken in spiced gravy", isVeg: false, category: "Main Course" },
      { name: "Dal Makhani", price: 250, description: "Slow cooked black lentils", isVeg: true, category: "Main Course" }
    ]
  },
  {
    name: "Cafe Goodluck",
    description: "Historic Iranian-style cafe, legendary for Keema Pav.",
    address: "Fergusson College Road, Deccan Gymkhana, Pune",
    cuisines: ["Irani", "Breakfast", "Fast Food"],
    image: "https://images.unsplash.com/photo-1544787210-282aa9de44fa?auto=format&fit=crop&w=800",
    deliveryTime: "25-35 mins",
    costForTwo: 500,
    rating: 4.5,
    location: { type: "Point", coordinates: [73.8432, 18.5175] }, // FC Road
    menu: [
      { name: "Keema Pav", price: 180, description: "Minced mutton served with buttered buns", isVeg: false, category: "Main Course" },
      { name: "Bun Maska", price: 50, description: "Iranian bun with butter", isVeg: true, category: "Breakfast" }
    ]
  },
  {
    name: "Terttulia",
    description: "Chic eatery offering global cuisine and creative cocktails.",
    address: "Koregaon Park, Pune",
    cuisines: ["European", "Mediterranean", "Salads"],
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800",
    deliveryTime: "35-45 mins",
    costForTwo: 1800,
    rating: 4.4,
    location: { type: "Point", coordinates: [73.8944, 18.5392] }, // Koregaon Park
    menu: [
      { name: "Quinoa Salad", price: 350, description: "Healthy quinoa with vegetables", isVeg: true, category: "Salads" },
      { name: "Grilled Salmon", price: 750, description: "Fresh salmon with lemon butter sauce", isVeg: false, category: "Main Course" }
    ]
  },
  {
    name: "Durvankur Dining Hall",
    description: "Authentic Maharashtrian Thali experience.",
    address: "Sadashiv Peth, Pune",
    cuisines: ["Maharashtrian", "Thali"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800",
    deliveryTime: "40-50 mins",
    costForTwo: 600,
    rating: 4.6,
    location: { type: "Point", coordinates: [73.8495, 18.5085] }, // Sadashiv Peth
    menu: [
      { name: "Unlimited Thali", price: 350, description: "Puran Poli, Bhaji, Amti, Rice, and more", isVeg: true, category: "Thali" },
      { name: "Puran Poli (Extra)", price: 60, description: "Sweet lentil stuffed flatbread", isVeg: true, category: "Desserts" }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding Pune data...');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared old data.');

    for (const resData of puneRestaurants) {
      const { menu, ...restaurantInfo } = resData;
      
      // Create Restaurant
      const restaurant = await Restaurant.create(restaurantInfo);
      
      // Create Menu Items for this restaurant
      const menuItems = menu.map(item => ({
        ...item,
        restaurant: restaurant._id
      }));
      
      await MenuItem.insertMany(menuItems);
      console.log(`Seeded: ${restaurant.name}`);
    }

    console.log('Successfully seeded Pune restaurants and menus! 🍅');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
