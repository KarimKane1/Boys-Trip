import { promises as fs } from "fs";
import path from "path";
import type { Person, Hotel, TripData } from "@/data/tripData";

const DB_PATH = path.join(process.cwd(), "src/data/database.json");

export async function readDatabase(): Promise<TripData> {
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
    await writeDatabase(defaultData);
    return defaultData;
  }
}

export async function writeDatabase(data: TripData): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function updatePerson(personId: string, updates: Partial<Person>): Promise<Person> {
  const data = await readDatabase();
  const personIndex = data.people.findIndex((p) => p.id === personId);
  
  if (personIndex === -1) {
    throw new Error(`Person with id ${personId} not found`);
  }
  
  data.people[personIndex] = { ...data.people[personIndex], ...updates };
  await writeDatabase(data);
  
  return data.people[personIndex];
}

export async function getHotels(city: "london" | "paris" | "amsterdam"): Promise<Hotel[]> {
  const data = await readDatabase();
  return data.hotelsByCity[city] || [];
}

export async function addHotel(city: "london" | "paris" | "amsterdam", hotel: Hotel): Promise<Hotel> {
  const data = await readDatabase();
  if (!data.hotelsByCity[city]) {
    data.hotelsByCity[city] = [];
  }
  data.hotelsByCity[city].push(hotel);
  await writeDatabase(data);
  return hotel;
}

export async function deleteHotel(city: "london" | "paris" | "amsterdam", hotelId: string): Promise<void> {
  const data = await readDatabase();
  if (data.hotelsByCity[city]) {
    data.hotelsByCity[city] = data.hotelsByCity[city].filter((h) => h.id !== hotelId);
    await writeDatabase(data);
  }
}

export async function getAllPeople(): Promise<Person[]> {
  const data = await readDatabase();
  return data.people;
}

export async function getTripData(): Promise<TripData> {
  return readDatabase();
}

