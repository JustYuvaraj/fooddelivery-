const http = require('http');

// Mock data
const mockRestaurants = JSON.stringify([
  { id: 1, name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: '30 mins', deliveryFee: '$2.99', imageUrl: 'https://via.placeholder.com/300x200?text=Pizza+Palace' },
  { id: 2, name: 'Burger Bliss', cuisine: 'American', rating: 4.3, deliveryTime: '25 mins', deliveryFee: '$1.99', imageUrl: 'https://via.placeholder.com/300x200?text=Burger+Bliss' },
  { id: 3, name: 'Sushi Supreme', cuisine: 'Japanese', rating: 4.7, deliveryTime: '35 mins', deliveryFee: '$3.99', imageUrl: 'https://via.placeholder.com/300x200?text=Sushi+Supreme' },
]);

const mockMenuItems = {
  '1': JSON.stringify([
    { id: 1, name: 'Margherita Pizza', price: 12.99, category: 'Pizza', description: 'Classic cheese pizza', isAvailable: true },
    { id: 2, name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', description: 'With pepperoni', isAvailable: true },
    { id: 3, name: 'Garlic Bread', price: 5.99, category: 'Sides', description: 'Crispy garlic bread', isAvailable: true },
  ]),
  '2': JSON.stringify([
    { id: 4, name: 'Classic Burger', price: 9.99, category: 'Burgers', description: 'Beef patty with toppings', isAvailable: true },
    { id: 5, name: 'Cheese Burger', price: 10.99, category: 'Burgers', description: 'Double cheese', isAvailable: true },
  ]),
  '3': JSON.stringify([
    { id: 6, name: 'California Roll', price: 8.99, category: 'Rolls', description: 'Crab, cucumber, avocado', isAvailable: true },
    { id: 7, name: 'Spicy Tuna Roll', price: 9.99, category: 'Rolls', description: 'Spicy tuna filling', isAvailable: true },
  ]),
};

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  // Health check
  if (url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Restaurants
  if (url.startsWith('/api/v1/customer/restaurants')) {
    if (url === '/api/v1/customer/restaurants') {
      res.writeHead(200);
      res.end(mockRestaurants);
    } else if (url.match(/\/api\/v1\/customer\/restaurants\/\d+\/menu/)) {
      const id = url.split('/')[5];
      res.writeHead(200);
      res.end(mockMenuItems[id] || '[]');
    }
    return;
  }

  // Orders
  if (url === '/api/v1/customer/orders' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify([
      { id: 1, restaurantName: 'Pizza Palace', items: 2, total: 28.97, status: 'delivered', date: new Date(Date.now() - 2*24*60*60000).toISOString() },
      { id: 2, restaurantName: 'Burger Bliss', items: 1, total: 10.99, status: 'delivered', date: new Date(Date.now() - 1*24*60*60000).toISOString() },
    ]));
    return;
  }

  if (url === '/api/v1/customer/orders' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      orderId: 'ORDER-' + Date.now(),
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(),
    }));
    return;
  }

  // Auth
  if (url === '/api/v1/auth/login' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      user: { id: 1, name: 'John Doe', email: 'user@example.com' },
      token: 'mock-token-' + Date.now(),
    }));
    return;
  }

  if (url === '/api/v1/auth/register' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      user: { id: 1, name: 'John Doe', email: 'user@example.com' },
      token: 'mock-token-' + Date.now(),
    }));
    return;
  }

  // Favorites
  if (url === '/api/v1/customer/favorites' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(JSON.parse(mockRestaurants).slice(0, 2)));
    return;
  }

  if (url.match(/\/api\/v1\/customer\/favorites\/\d+/)) {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
