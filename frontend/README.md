# 🍔 Food Delivery Platform - Frontend

React 18 + TypeScript + Vite + Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API URL and Google Maps API key
```

### Development

```bash
# Start development server
npm run dev

# App will be available at http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── utils/         # Utilities
├── types/         # TypeScript types
└── styles/        # Global styles
```

## 🔧 Configuration

- **API Base URL**: Set in `.env` as `VITE_API_BASE_URL`
- **WebSocket URL**: Set in `.env` as `VITE_WS_URL`
- **Google Maps API**: Set in `.env` as `VITE_GOOGLE_MAPS_API_KEY`

## 📚 Features

- ✅ Customer App (Browse, Order, Track)
- ✅ Restaurant Dashboard (Menu, Orders, Analytics)
- ✅ Delivery Agent App (Tasks, Navigation)
- ✅ Real-time Updates (WebSocket)
- ✅ Google Maps Integration

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- WebSocket (SockJS + STOMP)

---

**Status:** 🚧 In Development



