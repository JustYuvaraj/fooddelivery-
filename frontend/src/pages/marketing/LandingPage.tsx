import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Food Delivery Made Easy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Order from your favorite restaurants and get food delivered to your doorstep
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
