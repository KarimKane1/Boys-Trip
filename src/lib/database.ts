import { promises as fs } from "fs";
import path from "path";
import type { Person, Hotel, TripData } from "@/data/tripData";

const DB_PATH = path.join(process.cwd(), "src/data/database.json");

// Use GitHub API in production, file system in local dev
const isProduction = process.env.VERCEL === "1";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "KarimKane1/Boys-Trip";
const DB_FILE_PATH = "src/data/database.json";

async function readFromGitHub(): Promise<TripData> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // File doesn't exist, return default
        return getDefaultData();
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, "base64").toString("utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("GitHub read error:", error);
    throw error;
  }
}

async function writeToGitHub(data: TripData): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  try {
    // First, get the current file to get its SHA (required for update)
    const getResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Update or create the file
    const content = JSON.stringify(data, null, 2);
    const encodedContent = Buffer.from(content).toString("base64");

    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update trip data - ${new Date().toISOString()}`,
          content: encodedContent,
          sha: sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`GitHub API error: ${updateResponse.status} - ${JSON.stringify(error)}`);
    }
  } catch (error) {
    console.error("GitHub write error:", error);
    throw error;
  }
}

function getDefaultData(): TripData {
  return {
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
}

export async function readDatabase(): Promise<TripData> {
  // Use GitHub in production, file system in local dev
  if (isProduction && GITHUB_TOKEN) {
    try {
      return await readFromGitHub();
    } catch (error) {
      console.error("Failed to read from GitHub, falling back to default:", error);
      return getDefaultData();
    }
  }

  // Local development - use file system
  try {
    const fileContents = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    const defaultData = getDefaultData();
    await writeDatabase(defaultData);
    return defaultData;
  }
}

export async function writeDatabase(data: TripData): Promise<void> {
  // Use GitHub in production, file system in local dev
  if (isProduction && GITHUB_TOKEN) {
    await writeToGitHub(data);
    return;
  }

  // Local development - use file system
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
