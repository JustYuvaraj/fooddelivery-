import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-2xl text-gray-800 mb-4">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
