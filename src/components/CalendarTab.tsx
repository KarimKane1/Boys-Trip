"use client";

import { useMemo } from "react";
import type { Person } from "@/data/tripData";

const CITY_COLORS = {
  London: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300",
    accent: "bg-blue-500",
    dot: "bg-blue-500",
  },
  Paris: {
    bg: "bg-pink-100",
    text: "text-pink-900",
    border: "border-pink-300",
    accent: "bg-pink-500",
    dot: "bg-pink-500",
  },
  Amsterdam: {
    bg: "bg-orange-100",
    text: "text-orange-900",
    border: "border-orange-300",
    accent: "bg-orange-500",
    dot: "bg-orange-500",
  },
};

interface CalendarTabProps {
  people: Person[];
  tripStartDate?: string;
  tripEndDate?: string;
}

// Helper function to parse date string (YYYY-MM-DD) as local date without timezone conversion
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function CalendarTab({ people, tripStartDate = "2026-06-26", tripEndDate = "2026-07-05" }: CalendarTabProps) {
  // Generate all dates in the trip range
  const dates = useMemo(() => {
    const start = parseLocalDate(tripStartDate);
    const end = parseLocalDate(tripEndDate);
    const dateArray: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dateArray.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
    return dateArray;
  }, [tripStartDate, tripEndDate]);

  // Get which city a person is in on a specific date
  // Priority: Paris/Amsterdam over London (if overlap, non-London city wins)
  // London is automatically inferred from arrival/departure if not explicitly set
  const getPersonCity = (person: Person, date: string): string | null => {
    if (person.status === "no") return null;

    const dateObj = parseLocalDate(date);

    // Check Paris first (higher priority than London)
    if (person.cityRanges?.paris) {
      const start = parseLocalDate(person.cityRanges.paris.start);
      const end = parseLocalDate(person.cityRanges.paris.end);
      if (dateObj >= start && dateObj <= end) {
        return "Paris";
      }
    }

    // Check Amsterdam second (higher priority than London)
    if (person.cityRanges?.amsterdam) {
      const start = parseLocalDate(person.cityRanges.amsterdam.start);
      const end = parseLocalDate(person.cityRanges.amsterdam.end);
      if (dateObj >= start && dateObj <= end) {
        return "Amsterdam";
      }
    }

    // Check London - either from explicit cityRanges or inferred from arrival/departure
    let londonStart: Date | null = null;
    let londonEnd: Date | null = null;

    if (person.cityRanges?.london) {
      // Use explicit London dates if set
      londonStart = parseLocalDate(person.cityRanges.london.start);
      londonEnd = parseLocalDate(person.cityRanges.london.end);
    } else if (person.arrival?.date && person.departure?.date) {
      // Auto-infer London from arrival to departure
      londonStart = parseLocalDate(person.arrival.date);
      londonEnd = parseLocalDate(person.departure.date);
    }

    if (londonStart && londonEnd && dateObj >= londonStart && dateObj <= londonEnd) {
      return "London";
    }

    return null;
  };

  // Group people by city for each date
  const calendarData = useMemo(() => {
    const data: Record<
      string,
      { London: Person[]; Paris: Person[]; Amsterdam: Person[] }
    > = {};

    dates.forEach((date) => {
      data[date] = { London: [], Paris: [], Amsterdam: [] };

      people.forEach((person) => {
        if (person.status === "no") return;
        const city = getPersonCity(person, date);
        if (city) {
          data[date][city as keyof typeof data[string]].push(person);
        }
      });
    });

    return data;
  }, [dates, people]);

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div>
      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Cities:</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${CITY_COLORS.London.accent}`}></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">London</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${CITY_COLORS.Paris.accent}`}></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Paris</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${CITY_COLORS.Amsterdam.accent}`}></div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Amsterdam</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 min-w-[100px] sm:min-w-[120px]">
                  Date
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${CITY_COLORS.London.accent}`}></div>
                    London
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${CITY_COLORS.Paris.accent}`}></div>
                    Paris
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${CITY_COLORS.Amsterdam.accent}`}></div>
                    Amsterdam
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dates.map((date) => {
                const dayData = calendarData[date];
                const hasPeople = 
                  dayData.London.length > 0 ||
                  dayData.Paris.length > 0 ||
                  dayData.Amsterdam.length > 0;

                return (
                  <tr key={date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        {formatDate(date)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{formatDateShort(date)}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {dayData.London.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dayData.London.map((person) => (
                            <div
                              key={person.id}
                              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium border ${CITY_COLORS.London.bg} ${CITY_COLORS.London.text} ${CITY_COLORS.London.border}`}
                            >
                              {person.name}
                              {person.status === "tentative" && (
                                <span className="ml-1 text-[10px] opacity-75">(?)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {dayData.Paris.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dayData.Paris.map((person) => (
                            <div
                              key={person.id}
                              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium border ${CITY_COLORS.Paris.bg} ${CITY_COLORS.Paris.text} ${CITY_COLORS.Paris.border}`}
                            >
                              {person.name}
                              {person.status === "tentative" && (
                                <span className="ml-1 text-[10px] opacity-75">(?)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {dayData.Amsterdam.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dayData.Amsterdam.map((person) => (
                            <div
                              key={person.id}
                              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium border ${CITY_COLORS.Amsterdam.bg} ${CITY_COLORS.Amsterdam.text} ${CITY_COLORS.Amsterdam.border}`}
                            >
                              {person.name}
                              {person.status === "tentative" && (
                                <span className="ml-1 text-[10px] opacity-75">(?)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
