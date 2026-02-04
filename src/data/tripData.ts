export interface Person {
  id: string;
  name: string;
  status: "confirmed" | "tentative" | "no";
  arrival?: {
    date: string;
    city: string;
  };
  departure?: {
    date: string;
    city: string;
  };
  cityRanges?: {
    london?: { start: string; end: string };
    paris?: { start: string; end: string };
    amsterdam?: { start: string; end: string };
  };
}

export interface RoomOption {
  name: string;
  maxOccupancy: number;
  pricePerNightGBP: number;
  notes?: string;
}

export interface Hotel {
  id: string;
  name: string;
  mapLink: string;
  websiteLink: string;
}

export interface LondonHotel {
  name: string;
  location: string;
  mapLink: string;
  websiteLink: string;
  roomTypes: {
    name: string;
    maxOccupancy: number;
    pricePerNight: number;
    pricePerPerson: number;
    availability: number;
    description: string;
  }[];
}

export interface LondonHosting {
  name: string;
  location: string;
  maxGuests: number;
}

export interface RoomType {
  name: string;
  maxOccupancy: number;
  pricePerNight: number;
  pricePerPerson: number;
}

export interface LondonAccommodation {
  hotel: {
    name: string;
    location: string;
    mapLink: string;
    websiteLink: string;
    roomTypes: RoomType[];
  };
  hosting: {
    name: string;
    location: string;
    maxGuests: number;
  };
}

export interface TripData {
  trip: {
    title: string;
    startDate: string;
    endDate: string;
  };
  cities: string[];
  people: Person[];
  hotelsByCity: {
    london: Hotel[];
    paris: Hotel[];
    amsterdam: Hotel[];
  };
  londonHotel?: LondonHotel;
  londonHosting?: LondonHosting;
}

const defaultArrival = { date: "2026-06-26", city: "London" };
const defaultDeparture = { date: "2026-07-05", city: "London" };
const defaultLondonRange = { start: "2026-06-26", end: "2026-07-05" };

export const tripData: TripData = {
  trip: {
    title: "Trip HQ",
    startDate: "2026-06-26",
    endDate: "2026-07-05",
  },
  cities: ["London", "Paris", "Amsterdam"],
  people: [
    {
      id: "karim",
      name: "Karim",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "lucas",
      name: "Lucas",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "kachi",
      name: "Kachi",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "jake",
      name: "Jake",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "justin",
      name: "Justin",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "adam",
      name: "Adam",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "andrew",
      name: "Andrew",
      status: "confirmed",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
    {
      id: "daunte",
      name: "Daunte",
      status: "tentative",
      arrival: defaultArrival,
      departure: defaultDeparture,
      cityRanges: { london: defaultLondonRange },
    },
  ],
  hotelsByCity: {
    london: [],
    paris: [],
    amsterdam: [],
  },
};
