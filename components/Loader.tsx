
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="w-12 h-12 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-gray-700">{message}</p>
    </div>
  );
};
