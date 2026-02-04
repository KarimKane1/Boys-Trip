"use client";

import { useState } from "react";
import { updatePerson } from "@/lib/api";
import type { Person } from "@/data/tripData";

const CITIES = ["London", "Paris", "Amsterdam"];

const CITY_COLORS = {
  London: "bg-blue-50 border-blue-200 text-blue-900",
  Paris: "bg-pink-50 border-pink-200 text-pink-900",
  Amsterdam: "bg-orange-50 border-orange-200 text-orange-900",
};

interface PeopleTabProps {
  people: Person[];
  onDataChange: () => Promise<void>;
  onPersonUpdate?: (updatedPerson: Person) => void;
}

export default function PeopleTab({ people, onDataChange, onPersonUpdate }: PeopleTabProps) {
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editStatus, setEditStatus] = useState<"confirmed" | "tentative" | "no">("confirmed");
  const [editArrivalDate, setEditArrivalDate] = useState("");
  const [editArrivalCity, setEditArrivalCity] = useState("");
  const [editDepartureDate, setEditDepartureDate] = useState("");
  const [editDepartureCity, setEditDepartureCity] = useState("");
  const [editLondonStart, setEditLondonStart] = useState("");
  const [editLondonEnd, setEditLondonEnd] = useState("");
  const [editParisStart, setEditParisStart] = useState("");
  const [editParisEnd, setEditParisEnd] = useState("");
  const [editAmsterdamStart, setEditAmsterdamStart] = useState("");
  const [editAmsterdamEnd, setEditAmsterdamEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCardClick = (person: Person) => {
    setEditingPerson({ ...person });
    setEditStatus(person.status);
    setEditArrivalDate(person.arrival?.date || "");
    setEditArrivalCity(person.arrival?.city || "");
    setEditDepartureDate(person.departure?.date || "");
    setEditDepartureCity(person.departure?.city || "");
    setEditLondonStart(person.cityRanges?.london?.start || "");
    setEditLondonEnd(person.cityRanges?.london?.end || "");
    setEditParisStart(person.cityRanges?.paris?.start || "");
    setEditParisEnd(person.cityRanges?.paris?.end || "");
    setEditAmsterdamStart(person.cityRanges?.amsterdam?.start || "");
    setEditAmsterdamEnd(person.cityRanges?.amsterdam?.end || "");
  };

  const handleSave = async () => {
    if (!editingPerson) return;

    setSaving(true);
    try {
      const cityRanges: Person["cityRanges"] = {};
      if (editLondonStart && editLondonEnd) {
        cityRanges.london = { start: editLondonStart, end: editLondonEnd };
      }
      if (editParisStart && editParisEnd) {
        cityRanges.paris = { start: editParisStart, end: editParisEnd };
      }
      if (editAmsterdamStart && editAmsterdamEnd) {
        cityRanges.amsterdam = { start: editAmsterdamStart, end: editAmsterdamEnd };
      }

      const updatedPerson: Person = {
        ...editingPerson,
        status: editStatus,
        arrival: editArrivalDate && editArrivalCity
          ? { date: editArrivalDate, city: editArrivalCity }
          : undefined,
        departure: editDepartureDate && editDepartureCity
          ? { date: editDepartureDate, city: editDepartureCity }
          : undefined,
        cityRanges: Object.keys(cityRanges).length > 0 ? cityRanges : undefined,
      };

      console.log("Saving person with status:", editStatus);
      console.log("Full updatedPerson object:", JSON.stringify(updatedPerson, null, 2));

      // Save to database
      const savedPerson = await updatePerson(updatedPerson);
      console.log("Person saved, returned status:", savedPerson.status);
      
      // Update the UI with the saved person data (already verified by the API)
      if (onPersonUpdate) {
        onPersonUpdate(savedPerson);
      }
      
      // Close modal
      setEditingPerson(null);
      
      // Show success message
      alert("Changes saved successfully!");
      
      // Note: We don't refresh from server here because:
      // 1. The API already verified the write succeeded
      // 2. The optimistic update already shows the correct data
      // 3. Automatic refresh was causing data to revert due to race conditions with GitHub API caching
      // Users can manually refresh if they want to see other people's updates
    } catch (error) {
      console.error("Failed to save person:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to save changes: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPerson(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    // Parse date string manually to avoid timezone issues
    // Format: YYYY-MM-DD
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateRange = (start: string, end: string) => {
    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);
    if (!startFormatted || !endFormatted) return null;
    return `${startFormatted} - ${endFormatted}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 border-emerald-200";
      case "tentative":
        return "bg-amber-50 border-amber-200";
      case "no":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
      case "tentative":
        return "bg-amber-100 text-amber-700";
      case "no":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 sm:mb-8 rounded-r-lg">
        <p className="text-blue-800 font-semibold mb-1 text-sm sm:text-base">📝 Add Your Travel Details</p>
        <p className="text-blue-700 text-xs sm:text-sm">
          Tap your name card below to enter your arrival/departure dates and which cities you'll be visiting. 
          Your changes will be saved automatically and visible to everyone!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {people.map((person) => (
          <div
            key={person.id}
            onClick={() => handleCardClick(person)}
            className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer active:scale-[0.98] hover:shadow-xl transition-all duration-200 touch-manipulation ${getStatusColor(
              person.status
            )}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{person.name}</h3>
              <span className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${getStatusBadge(person.status)}`}>
                {person.status === "confirmed" ? "Coming" : person.status === "tentative" ? "Tentative" : "Not Coming"}
              </span>
            </div>

            <div className="space-y-3">
              {person.arrival ? (
                <div className="text-sm">
                  <span className="text-gray-500">Arriving: </span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(person.arrival.date)} in {person.arrival.city}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Arrival not set</div>
              )}

              {person.departure ? (
                <div className="text-sm">
                  <span className="text-gray-500">Departing: </span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(person.departure.date)} from {person.departure.city}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Departure not set</div>
              )}

              {person.cityRanges && (
                <div className="pt-3 mt-3 border-t border-gray-300 space-y-2">
                  {person.cityRanges.london && (
                    <div className={`text-xs px-3 py-1.5 rounded-lg border ${CITY_COLORS.London}`}>
                      <div className="font-semibold">London</div>
                      <div>{formatDateRange(person.cityRanges.london.start, person.cityRanges.london.end)}</div>
                    </div>
                  )}
                  {person.cityRanges.paris && (
                    <div className={`text-xs px-3 py-1.5 rounded-lg border ${CITY_COLORS.Paris}`}>
                      <div className="font-semibold">Paris</div>
                      <div>{formatDateRange(person.cityRanges.paris.start, person.cityRanges.paris.end)}</div>
                    </div>
                  )}
                  {person.cityRanges.amsterdam && (
                    <div className={`text-xs px-3 py-1.5 rounded-lg border ${CITY_COLORS.Amsterdam}`}>
                      <div className="font-semibold">Amsterdam</div>
                      <div>{formatDateRange(person.cityRanges.amsterdam.start, person.cityRanges.amsterdam.end)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPerson && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 pr-2">
                {editingPerson.name}'s Travel Plan
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 touch-manipulation"
                aria-label="Close"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Status</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => setEditStatus("confirmed")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-95 ${
                      editStatus === "confirmed"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          editStatus === "confirmed" ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Coming</div>
                  </button>

                  <button
                    onClick={() => setEditStatus("tentative")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-95 ${
                      editStatus === "tentative"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          editStatus === "tentative" ? "bg-amber-500" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Tentative</div>
                  </button>

                  <button
                    onClick={() => setEditStatus("no")}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-95 ${
                      editStatus === "no"
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          editStatus === "no" ? "bg-gray-400" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Not Coming</div>
                  </button>
                </div>
              </div>

              {/* Arrival */}
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Arrival
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editArrivalDate}
                        onChange={(e) => setEditArrivalDate(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                      />
                      {editArrivalDate && (
                        <button
                          type="button"
                          onClick={() => setEditArrivalDate("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                          aria-label="Clear date"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      value={editArrivalCity}
                      onChange={(e) => setEditArrivalCity(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select city</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Departure */}
              <div className="bg-purple-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Departure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editDepartureDate}
                        onChange={(e) => setEditDepartureDate(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10"
                      />
                      {editDepartureDate && (
                        <button
                          type="button"
                          onClick={() => setEditDepartureDate("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                          aria-label="Clear date"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      value={editDepartureCity}
                      onChange={(e) => setEditDepartureCity(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                    >
                      <option value="">Select city</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* City Date Ranges */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">
                  When will you be in each city?
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  {/* London */}
                  <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.London}`}>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">London</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Start Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editLondonStart}
                            onChange={(e) => setEditLondonStart(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-10"
                          />
                          {editLondonStart && (
                            <button
                              type="button"
                              onClick={() => setEditLondonStart("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">End Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editLondonEnd}
                            onChange={(e) => setEditLondonEnd(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-10"
                          />
                          {editLondonEnd && (
                            <button
                              type="button"
                              onClick={() => setEditLondonEnd("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paris */}
                  <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.Paris}`}>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Paris</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Start Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editParisStart}
                            onChange={(e) => setEditParisStart(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white pr-10"
                          />
                          {editParisStart && (
                            <button
                              type="button"
                              onClick={() => setEditParisStart("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">End Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editParisEnd}
                            onChange={(e) => setEditParisEnd(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white pr-10"
                          />
                          {editParisEnd && (
                            <button
                              type="button"
                              onClick={() => setEditParisEnd("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amsterdam */}
                  <div className={`border-2 rounded-xl p-4 sm:p-6 ${CITY_COLORS.Amsterdam}`}>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Amsterdam</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Start Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editAmsterdamStart}
                            onChange={(e) => setEditAmsterdamStart(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white pr-10"
                          />
                          {editAmsterdamStart && (
                            <button
                              type="button"
                              onClick={() => setEditAmsterdamStart("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">End Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editAmsterdamEnd}
                            onChange={(e) => setEditAmsterdamEnd(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white pr-10"
                          />
                          {editAmsterdamEnd && (
                            <button
                              type="button"
                              onClick={() => setEditAmsterdamEnd("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                              aria-label="Clear date"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-200">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-4 sm:px-6 py-3 text-base border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 touch-manipulation active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 sm:px-6 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 touch-manipulation active:scale-95"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
