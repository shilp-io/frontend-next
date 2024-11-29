// app/not-found.tsx
'use strict';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full space-y-8 p-10">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-bold text-gray-900 tracking-tight">
            404 - Page Not Found
          </h1>
          
          <p className="mt-4 text-lg text-gray-500">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. Please check the URL
            or navigate back to the homepage.
          </p>

          <div className="mt-10">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent 
                         text-base font-medium rounded-md text-white bg-red-600 
                         hover:bg-red-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-red-500"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}