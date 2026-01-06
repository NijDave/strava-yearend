"use client";

import { LocationInsights as LocationInsightsType } from "@/lib/statistics";

interface LocationInsightsProps {
  insights: LocationInsightsType;
}

export function LocationInsights({ insights }: LocationInsightsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">🗺️ Location Insights</h3>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Total Unique Locations</div>
        <div className="text-3xl font-bold text-gray-900">{insights.totalLocations}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-4">🏙️ Top Cities</h4>
          {insights.topCities.length > 0 ? (
            <div className="space-y-3">
              {insights.topCities.map((city, index) => (
                <div
                  key={city.city}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{city.city}</span>
                  </div>
                  <span className="font-bold text-gray-700">{city.count} activities</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No location data available</p>
          )}
        </div>

        {/* Top Countries */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-4">🌍 Top Countries</h4>
          {insights.topCountries.length > 0 ? (
            <div className="space-y-3">
              {insights.topCountries.map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{country.country}</span>
                  </div>
                  <span className="font-bold text-gray-700">{country.count} activities</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No location data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

