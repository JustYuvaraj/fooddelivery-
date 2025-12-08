import React from 'react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
};

export default PageLoader;
