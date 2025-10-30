import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/30 z-50">
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid mb-2"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

