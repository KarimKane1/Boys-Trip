import type { Person, Hotel, TripData } from "@/data/tripData";

const API_BASE = "/api";

export async function fetchPeople(): Promise<Person[]> {
  const response = await fetch(`${API_BASE}/people`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch people");
  }
  return response.json();
}

export async function updatePerson(person: Person): Promise<Person> {
  const response = await fetch(`${API_BASE}/people`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(person),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update person");
  }
  
  return response.json();
}

export async function fetchHotels(city: "london" | "paris" | "amsterdam"): Promise<Hotel[]> {
  const response = await fetch(`${API_BASE}/hotels/${city}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch hotels");
  }
  return response.json();
}

export async function addHotel(city: "london" | "paris" | "amsterdam", hotel: Hotel): Promise<Hotel> {
  const response = await fetch(`${API_BASE}/hotels/${city}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hotel),
  });
  
  if (!response.ok) {
    throw new Error("Failed to add hotel");
  }
  
  return response.json();
}

export async function deleteHotel(city: "london" | "paris" | "amsterdam", hotelId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/hotels/${city}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: hotelId }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete hotel");
  }
}

export async function fetchTripData(): Promise<TripData> {
  const response = await fetch(`${API_BASE}/trip`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trip data");
  }
  return response.json();
}

