const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

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
    location: { type: "Point", coordinates: [73.8744, 18.5292] },
    menu: [
      { name: "Bun Maska", price: 60, description: "Classic Irani bun with generous butter", isVeg: true, category: "Breakfast" },
      { name: "Cheese Omelette", price: 120, description: "Three eggs with melted cheese", isVeg: false, category: "Eggs" },
      { name: "Irani Chai", price: 40, description: "Strong and milky Irani tea", isVeg: true, category: "Beverages" }
    ]
  },
  {
    name: "Sujata Mastani",
    description: "Famous for its thick milkshakes topped with ice cream and dry fruits.",
    address: "Sadashiv Peth, Pune",
    cuisines: ["Desserts", "Beverages"],
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800",
    deliveryTime: "15-20 mins",
    costForTwo: 300,
    rating: 4.8,
    location: { type: "Point", coordinates: [73.8475, 18.5085] },
    menu: [
      { name: "Mango Mastani", price: 140, description: "Thick mango milkshake with ice cream", isVeg: true, category: "Mastani" },
      { name: "Sitaphal Mastani", price: 160, description: "Custard apple thick shake", isVeg: true, category: "Mastani" }
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
    location: { type: "Point", coordinates: [73.8395, 18.5142] },
    menu: [
      { name: "Pesto Pasta", price: 480, description: "Fresh basil pesto with parmesan", isVeg: true, category: "Pasta" },
      { name: "Blueberry Cheesecake", price: 250, description: "Signature creamy cheesecake", isVeg: true, category: "Desserts" }
    ]
  },
  {
    name: "Goodluck Cafe",
    description: "Iconic Irani cafe famous for Bun Maska and Keema Pav.",
    address: "FC Road, Deccan Gymkhana, Pune",
    cuisines: ["Irani", "North Indian"],
    image: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=800",
    deliveryTime: "20-30 mins",
    costForTwo: 500,
    rating: 4.5,
    location: { type: "Point", coordinates: [73.8432, 18.5175] },
    menu: [
      { name: "Keema Pav", price: 180, description: "Minced mutton with buttered buns", isVeg: false, category: "Main Course" },
      { name: "Bun Maska Jam", price: 70, description: "Classic bun with butter and jam", isVeg: true, category: "Breakfast" }
    ]
  },
  {
    name: "Malaka Spice",
    description: "Award-winning Southeast Asian inspired restaurant.",
    address: "Koregaon Park, Lane 5, Pune",
    cuisines: ["Asian", "Thai", "Malaysian"],
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800",
    deliveryTime: "45-50 mins",
    costForTwo: 2000,
    rating: 4.4,
    location: { type: "Point", coordinates: [73.8965, 18.5398] },
    menu: [
      { name: "Top Hats", price: 350, description: "Crispy cups with minced chicken", isVeg: false, category: "Starters" },
      { name: "Thai Green Curry", price: 550, description: "Authentic spicy green curry", isVeg: true, category: "Main Course" }
    ]
  },
  {
    name: "George Restaurant",
    description: "Heritage restaurant serving classic North Indian and Mughlai.",
    address: "MG Road, Camp, Pune",
    cuisines: ["North Indian", "Mughlai"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800",
    deliveryTime: "30-40 mins",
    costForTwo: 1200,
    rating: 4.2,
    location: { type: "Point", coordinates: [73.8778, 18.5144] },
    menu: [
      { name: "Chicken Biryani", price: 380, description: "Slow-cooked aromatic biryani", isVeg: false, category: "Biryani" },
      { name: "Butter Chicken", price: 420, description: "Classic creamy chicken curry", isVeg: false, category: "Main Course" }
    ]
  },
  {
    name: "Durvankur Dining Hall",
    description: "Legendary for its authentic Maharashtrian Thali.",
    address: "Tilak Road, Sadashiv Peth, Pune",
    cuisines: ["Maharashtrian", "Thali"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800",
    deliveryTime: "40-45 mins",
    costForTwo: 600,
    rating: 4.6,
    location: { type: "Point", coordinates: [73.8495, 18.5085] },
    menu: [
      { name: "Standard Thali", price: 350, description: "Unlimited traditional Maharashtrian meal", isVeg: true, category: "Thali" },
      { name: "Puran Poli Thali", price: 400, description: "Thali with Puran Poli sweet", isVeg: true, category: "Thali" }
    ]
  },
  {
    name: "German Bakery",
    description: "Famous for its desserts, breakfast, and chill vibe.",
    address: "Koregaon Park, Pune",
    cuisines: ["Bakery", "European", "Cafe"],
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800",
    deliveryTime: "25-35 mins",
    costForTwo: 1000,
    rating: 4.3,
    location: { type: "Point", coordinates: [73.8912, 18.5365] },
    menu: [
      { name: "Shrewsbury Biscuits", price: 200, description: "Traditional buttery biscuits", isVeg: true, category: "Bakery" },
      { name: "Red Velvet Cake", price: 180, description: "Rich and moist red velvet", isVeg: true, category: "Desserts" }
    ]
  },
  {
    name: "Prem's",
    description: "A favorite open-air restaurant in KP known for North Indian food.",
    address: "North Main Road, Koregaon Park, Pune",
    cuisines: ["North Indian", "Continental"],
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800",
    deliveryTime: "40-50 mins",
    costForTwo: 1400,
    rating: 4.1,
    location: { type: "Point", coordinates: [73.8925, 18.5412] },
    menu: [
      { name: "Dal Tadka", price: 220, description: "Yellow lentils with tempered spices", isVeg: true, category: "Main Course" },
      { name: "Paneer Lababdar", price: 340, description: "Cottage cheese in rich gravy", isVeg: true, category: "Main Course" }
    ]
  },
  {
    name: "Savya Rasa",
    description: "Premium South Indian fine dining restaurant.",
    address: "Koregaon Park, Pune",
    cuisines: ["South Indian", "Kerala", "Chettinad"],
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800",
    deliveryTime: "45-55 mins",
    costForTwo: 2200,
    rating: 4.7,
    location: { type: "Point", coordinates: [73.8988, 18.5425] },
    menu: [
      { name: "Chicken Chettinad", price: 480, description: "Spicy chicken with coconut spices", isVeg: false, category: "Main Course" },
      { name: "Appam with Stew", price: 320, description: "Lacy pancakes with veg stew", isVeg: true, category: "Main Course" }
    ]
  },
  {
    name: "Blue Nile",
    description: "Famous for its iconic Biryani and Persian specialties.",
    address: "Bund Garden Road, Camp, Pune",
    cuisines: ["North Indian", "Mughlai", "Biryani"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800",
    deliveryTime: "30-40 mins",
    costForTwo: 1200,
    rating: 4.2,
    location: { type: "Point", coordinates: [73.8765, 18.5255] },
    menu: [
      { name: "Mutton Biryani", price: 450, description: "Signature Blue Nile biryani", isVeg: false, category: "Biryani" },
      { name: "Chicken Masala", price: 360, description: "Spicy chicken gravy", isVeg: false, category: "Main Course" }
    ]
  },
  {
    name: "Paasha",
    description: "Rooftop dining with spectacular views and premium North Indian food.",
    address: "JW Marriott, Senapati Bapat Road, Pune",
    cuisines: ["North Indian", "Kebab"],
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800",
    deliveryTime: "50-60 mins",
    costForTwo: 3500,
    rating: 4.6,
    location: { type: "Point", coordinates: [73.8298, 18.5355] },
    menu: [
      { name: "Galouti Kebab", price: 850, description: "Melt-in-mouth minced meat kebabs", isVeg: false, category: "Appetizers" },
      { name: "Dal Paasha", price: 650, description: "Signature slow-cooked black dal", isVeg: true, category: "Main Course" }
    ]
  },
  {
    name: "Yolkshire",
    description: "All things eggs! Perfect breakfast and brunch spot.",
    address: "Kothrud, Pune",
    cuisines: ["Continental", "Cafe", "Breakfast"],
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800",
    deliveryTime: "25-35 mins",
    costForTwo: 800,
    rating: 4.4,
    location: { type: "Point", coordinates: [73.8125, 18.5025] },
    menu: [
      { name: "Spanish Omelette", price: 280, description: "Potatoes and onions omelette", isVeg: false, category: "Eggs" },
      { name: "Eggs Benedict", price: 350, description: "Poached eggs on English muffin", isVeg: false, category: "Eggs" }
    ]
  },
  {
    name: "Nisarg",
    description: "Best authentic Malvani and Konkani seafood in Pune.",
    address: "Erandwane, Pune",
    cuisines: ["Seafood", "Malvani", "Konkan"],
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800",
    deliveryTime: "35-45 mins",
    costForTwo: 1800,
    rating: 4.5,
    location: { type: "Point", coordinates: [73.8344, 18.5055] },
    menu: [
      { name: "Surmai Thali", price: 650, description: "Malvani kingfish meal", isVeg: false, category: "Thali" },
      { name: "Sol Kadhi", price: 60, description: "Traditional coconut-kokum drink", isVeg: true, category: "Beverages" }
    ]
  },
  {
    name: "Vaishali",
    description: "The soul of FC Road. Legendary for South Indian breakfast.",
    address: "FC Road, Pune",
    cuisines: ["South Indian", "Street Food"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800",
    deliveryTime: "20-30 mins",
    costForTwo: 500,
    rating: 4.7,
    location: { type: "Point", coordinates: [73.8415, 18.5205] },
    menu: [
      { name: "S.P.D.P.", price: 110, description: "Vaishali's famous Chaat specialty", isVeg: true, category: "Chaat" },
      { name: "Mysore Masala Dosa", price: 160, description: "Crispy dosa with spicy chutney", isVeg: true, category: "South Indian" }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Ensure an Admin/Owner user exists to own these restaurants
    let owner = await User.findOne({ role: 'restaurant' });
    if (!owner) {
      console.log('Creating a default restaurant owner user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      owner = await User.create({
        name: 'Pune Admin',
        email: 'puneadmin@tomato.com',
        password: hashedPassword,
        role: 'restaurant',
        phone: '9876543210',
        address: 'MG Road, Pune'
      });
    }

    // 2. Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data.');

    // 3. Seed Restaurants and Menus
    for (const resData of puneRestaurants) {
      const { menu, ...restaurantInfo } = resData;
      
      const restaurant = await Restaurant.create({
        ...restaurantInfo,
        owner: owner._id
      });
      
      const menuItems = menu.map(item => ({
        ...item,
        restaurant: restaurant._id
      }));
      
      await MenuItem.insertMany(menuItems);
      console.log(`Seeded: ${restaurant.name}`);
    }

    console.log(`\nSuccessfully seeded ${puneRestaurants.length} Pune restaurants! 🍅`);
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
