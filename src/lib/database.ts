import { promises as fs } from "fs";
import path from "path";
import type { Person, Hotel, TripData } from "@/data/tripData";
import { Redis } from "@upstash/redis";

const DB_PATH = path.join(process.cwd(), "src/data/database.json");
const DB_KEY = "trip_data";

// Initialize Redis only if we have the environment variables (production)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Helper to get database - tries Redis first, falls back to file system
async function getDatabase(): Promise<TripData> {
  // Try Redis first (production)
  if (redis) {
    try {
      const data = await redis.get<TripData>(DB_KEY);
      if (data) {
        return data;
      }
    } catch (error) {
      console.error("Redis read error:", error);
      // Fall through to file system
    }
  }

  // Fall back to file system (local development)
  try {
    const fileContents = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist, return default data
    const defaultData: TripData = {
      trip: {
        title: "Trip HQ",
        startDate: "2026-06-26",
        endDate: "2026-07-05",
      },
      cities: ["London", "Paris", "Amsterdam"],
      people: [],
      hotelsByCity: {
        london: [],
        paris: [],
        amsterdam: [],
      },
    };
    await saveDatabase(defaultData);
    return defaultData;
  }
}

// Helper to save database - tries Redis first, falls back to file system
async function saveDatabase(data: TripData): Promise<void> {
  // Try Redis first (production)
  if (redis) {
    try {
      await redis.set(DB_KEY, data);
      return;
    } catch (error) {
      console.error("Redis write error:", error);
      // Fall through to file system
    }
  }

  // Fall back to file system (local development)
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("File system write error:", error);
    throw new Error("Failed to save database");
  }
}

export async function readDatabase(): Promise<TripData> {
  return getDatabase();
}

export async function writeDatabase(data: TripData): Promise<void> {
  await saveDatabase(data);
}

export async function updatePerson(personId: string, updates: Partial<Person>): Promise<Person> {
  const data = await getDatabase();
  const personIndex = data.people.findIndex((p) => p.id === personId);
  
  if (personIndex === -1) {
    throw new Error(`Person with id ${personId} not found`);
  }
  
  data.people[personIndex] = { ...data.people[personIndex], ...updates };
  await saveDatabase(data);
  
  return data.people[personIndex];
}

export async function getHotels(city: "london" | "paris" | "amsterdam"): Promise<Hotel[]> {
  const data = await getDatabase();
  return data.hotelsByCity[city] || [];
}

export async function addHotel(city: "london" | "paris" | "amsterdam", hotel: Hotel): Promise<Hotel> {
  const data = await getDatabase();
  if (!data.hotelsByCity[city]) {
    data.hotelsByCity[city] = [];
  }
  data.hotelsByCity[city].push(hotel);
  await saveDatabase(data);
  return hotel;
}

export async function deleteHotel(city: "london" | "paris" | "amsterdam", hotelId: string): Promise<void> {
  const data = await getDatabase();
  if (data.hotelsByCity[city]) {
    data.hotelsByCity[city] = data.hotelsByCity[city].filter((h) => h.id !== hotelId);
    await saveDatabase(data);
  }
}

export async function getAllPeople(): Promise<Person[]> {
  const data = await getDatabase();
  return data.people;
}

export async function getTripData(): Promise<TripData> {
  return getDatabase();
}
