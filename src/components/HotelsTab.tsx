"use client";

import { useState, useEffect } from "react";
import { fetchHotels, addHotel, deleteHotel, fetchTripData } from "@/lib/api";
import type { Hotel, TripData } from "@/data/tripData";

export default function HotelsTab() {
  const [activeTab, setActiveTab] = useState<"london" | "paris" | "amsterdam">("london");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [londonHotel, setLondonHotel] = useState<TripData["londonHotel"]>(undefined);
  const [londonHosting, setLondonHosting] = useState<TripData["londonHosting"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newMapLink, setNewMapLink] = useState("");
  const [newWebsiteLink, setNewWebsiteLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "london") {
        const tripData = await fetchTripData();
        setLondonHotel(tripData.londonHotel);
        setLondonHosting(tripData.londonHosting);
      } else {
        const data = await fetchHotels(activeTab);
        setHotels(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddHotel = async () => {
    if (!newHotelName.trim() || !newMapLink.trim() || !newWebsiteLink.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const hotel: Hotel = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newHotelName.trim(),
        mapLink: newMapLink.trim(),
        websiteLink: newWebsiteLink.trim(),
      };

      await addHotel(activeTab, hotel);
      await loadData();
      
      // Reset form
      setNewHotelName("");
      setNewMapLink("");
      setNewWebsiteLink("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add hotel:", error);
      alert("Failed to add hotel. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) {
      return;
    }

    try {
      await deleteHotel(activeTab, hotelId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete hotel:", error);
      alert("Failed to delete hotel. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div>
      {/* City Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {(["london", "paris", "amsterdam"] as const).map((city) => (
            <button
              key={city}
              onClick={() => setActiveTab(city)}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap touch-manipulation ${
                activeTab === city
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* London Section - Fixed Hotel Display */}
      {activeTab === "london" && londonHotel && (
        <div className="space-y-6">
          {/* The Drey Hotel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{londonHotel.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-sm sm:text-base">{londonHotel.location}</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <a
                    href={londonHotel.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
                  >
                    View on Google Maps
                  </a>
                  <a
                    href={londonHotel.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 font-medium text-xs sm:text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Room Types & Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {londonHotel.roomTypes.map((room, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-900">{room.name}</h4>
                        {room.description && (
                          <p className="text-xs text-gray-500 mt-1 italic">{room.description}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          Sleeps: <span className="font-semibold">{room.maxOccupancy} people</span>
                        </p>
                        {room.availability !== undefined && (
                          <p className="text-sm text-gray-600 mt-1">
                            Available: <span className="font-semibold text-emerald-600">{room.availability} left</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price per night:</span>
                        <span className="text-lg font-bold text-gray-900">${room.pricePerNight}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cost per person:</span>
                        <span className="text-lg font-bold text-blue-600">${room.pricePerPerson.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Andrew's Hosting */}
          {londonHosting && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-sm border-2 border-emerald-200 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{londonHosting.name}</h3>
                  <div className="flex items-center gap-2 text-gray-700 mb-3 sm:mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">{londonHosting.location}</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 inline-block">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Can host:</span> {londonHosting.maxGuests} person
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paris & Amsterdam Section - Add Hotel Functionality */}
      {(activeTab === "paris" || activeTab === "amsterdam") && (
        <>
          {/* Add Hotel Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl touch-manipulation active:scale-95"
            >
              + Add Hotel
            </button>
          </div>

          {/* Hotels List */}
          {hotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No hotels added yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Add Hotel" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">{hotel.name}</h3>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete hotel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={hotel.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on Google Maps
                    </a>
                    <a
                      href={hotel.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Hotel Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Hotel</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  placeholder="Enter hotel name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  value={newMapLink}
                  onChange={(e) => setNewMapLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hotel Website Link
                </label>
                <input
                  type="url"
                  value={newWebsiteLink}
                  onChange={(e) => setNewWebsiteLink(e.target.value)}
                  placeholder="https://hotel-website.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHotel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Hotel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
