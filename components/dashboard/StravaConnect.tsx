"use client";

import { useState } from "react";

export function StravaConnect() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    window.location.href = "/api/strava/connect";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-orange-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h-5.667l2.831-5.599m10.163 0l-2.836 5.599h-5.667l2.831-5.599M24 0H0v24h24V0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your Strava Account
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Connect your Strava account to view and organize all your activities by year.
          We&apos;ll sync your activities and keep them up to date automatically.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What you&apos;ll get:</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>View all your activities organized by year</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>See detailed statistics for each year</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Access your data on any device</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Automatic sync with your Strava account</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full md:w-auto px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isConnecting ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Connecting...
            </span>
          ) : (
            "Connect Strava Account"
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Your data is secure and private. We only access your activity data.
        </p>
      </div>
    </div>
  );
}

