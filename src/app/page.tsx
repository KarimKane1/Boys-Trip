"use client";

import { useState, useEffect, useCallback } from "react";
import PeopleTab from "@/components/PeopleTab";
import HotelsTab from "@/components/HotelsTab";
import CalendarTab from "@/components/CalendarTab";
import ProposedPlanTab from "@/components/ProposedPlanTab";
import { fetchTripData } from "@/lib/api";
import type { Person, TripData } from "@/data/tripData";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"people" | "calendar" | "hotels" | "proposed">("people");
  const [people, setPeople] = useState<Person[]>([]);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      console.log("Loading data from server...", new Date().toISOString());
      const data = await fetchTripData();
      console.log("Data loaded, people count:", data.people.length);
      console.log("Daunte status:", data.people.find(p => p.id === "daunte")?.status);
      setPeople(data.people);
      setTripData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12">
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">Europe Boys Trip Summer 2026</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 mb-4 sm:mb-8 overflow-x-auto">
          <nav className="-mb-0.5 flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab("people")}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === "people"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Your Info
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === "calendar"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("hotels")}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === "hotels"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveTab("proposed")}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === "proposed"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Proposed Plan
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "people" && (
            <PeopleTab 
              people={people} 
              onDataChange={loadData}
              onPersonUpdate={(updatedPerson) => {
                // Optimistically update the local state
                setPeople(prev => prev.map(p => p.id === updatedPerson.id ? updatedPerson : p));
              }}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarTab 
              people={people} 
              tripStartDate={tripData?.trip.startDate}
              tripEndDate={tripData?.trip.endDate}
            />
          )}
          {activeTab === "hotels" && <HotelsTab />}
          {activeTab === "proposed" && <ProposedPlanTab />}
        </div>
      </div>
    </div>
  );
}
