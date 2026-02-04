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
    // Use multiple cache-busting techniques to ensure fresh data
    // GitHub API can cache responses, so we need to be aggressive
    const cacheBuster = Date.now();
    const random = Math.random().toString(36).substring(7);
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}?t=${cacheBuster}&r=${random}&_=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "If-None-Match": "", // Force fresh fetch
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
    const parsed = JSON.parse(content);
    console.log("Read from GitHub - people count:", parsed.people?.length);
    console.log("Read from GitHub - File SHA:", data.sha?.substring(0, 10));
    return parsed;
  } catch (error) {
    console.error("GitHub read error:", error);
    throw error;
  }
}

async function writeToGitHub(data: TripData): Promise<void> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured. Please add it in Vercel environment variables.");
  }

  try {
    console.log("Writing to GitHub...", { repo: GITHUB_REPO, path: DB_FILE_PATH });
    
    // First, get the current file to get its SHA (required for update)
    // Use cache-busting to ensure we get the latest version
    // Retry a few times to handle GitHub API eventual consistency
    let sha: string | undefined;
    let getResponse;
    const maxGetAttempts = 3;
    
    for (let getAttempt = 1; getAttempt <= maxGetAttempts; getAttempt++) {
      if (getAttempt > 1) {
        // Wait a bit before retrying to let GitHub propagate
        await new Promise(resolve => setTimeout(resolve, 500 * getAttempt));
      }
      
      const cacheBuster = Date.now();
      getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}?t=${cacheBuster}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
          },
        }
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
        if (sha) {
          console.log("Got existing file SHA:", sha.substring(0, 10) + "...");
          break; // Success, exit retry loop
        }
      } else if (getResponse.status === 404) {
        console.log("File doesn't exist yet, will create new file");
        break; // File doesn't exist, that's fine - we'll create it
      } else if (getAttempt < maxGetAttempts) {
        console.warn(`Failed to get file SHA (attempt ${getAttempt}), will retry...`);
        continue; // Retry
      } else {
        // Last attempt failed
        const errorText = await getResponse.text();
        throw new Error(`Failed to get file after ${maxGetAttempts} attempts: ${getResponse.status} - ${errorText}`);
      }
    }

    // Update or create the file
    // Log what we're about to write to verify it's correct
    const daunteInData = data.people?.find((p: Person) => p.id === "daunte");
    console.log("About to write to GitHub - Daunte status in data:", daunteInData?.status);
    console.log("About to write - All people statuses:", data.people?.map((p: Person) => ({ id: p.id, status: p.status })));
    
    const content = JSON.stringify(data, null, 2);
    // Verify Daunte is in the JSON string
    const daunteInJson = content.includes('"id": "daunte"') && content.match(/"id": "daunte"[\s\S]{0,200}"status": "([^"]+)"/);
    if (daunteInJson) {
      console.log("Daunte status in JSON string:", daunteInJson[1]);
    }
    const encodedContent = Buffer.from(content).toString("base64");

    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
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
      const errorText = await updateResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error("GitHub API error response:", errorData);
      throw new Error(`GitHub API error: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await updateResponse.json();
    console.log("Successfully wrote to GitHub - Commit SHA:", result.commit?.sha?.substring(0, 10));
    console.log("New file SHA:", result.content?.sha?.substring(0, 10));
    
    // The write succeeded if we got a commit SHA back
    // The commit SHA proves the write was committed to GitHub
    if (!result.commit?.sha) {
      throw new Error("Write response missing commit SHA - write may have failed");
    }
    
    console.log("Write confirmed by commit SHA:", result.commit.sha.substring(0, 10));
    
    // Small delay to ensure GitHub has processed the commit
    // This helps with eventual consistency when reading back immediately
    await new Promise(resolve => setTimeout(resolve, 500));
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
  console.log("Updating person:", personId, updates);
  
  // Retry logic to handle race conditions with GitHub
  let lastError: Error | null = null;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Retry attempt ${attempt} for updatePerson`);
        // Wait a bit before retrying to let GitHub propagate
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      const data = await readDatabase();
      const personIndex = data.people.findIndex((p) => p.id === personId);
      
      if (personIndex === -1) {
        throw new Error(`Person with id ${personId} not found`);
      }
      
      // Merge updates, but handle undefined values to remove fields
      const currentPerson = data.people[personIndex];
      console.log("Current person before update:", JSON.stringify(currentPerson, null, 2));
      console.log("Updates received:", JSON.stringify(updates, null, 2));
      
      const updatedPerson: Person = {
        ...currentPerson,
        // Explicitly set status if provided - THIS IS CRITICAL
        status: updates.status !== undefined ? updates.status : currentPerson.status,
        // Explicitly handle undefined values to remove fields
        arrival: updates.arrival !== undefined ? updates.arrival : currentPerson.arrival,
        departure: updates.departure !== undefined ? updates.departure : currentPerson.departure,
        cityRanges: updates.cityRanges !== undefined ? updates.cityRanges : currentPerson.cityRanges,
        // Include all other fields from updates
        ...Object.fromEntries(
          Object.entries(updates).filter(([key]) => 
            !["status", "arrival", "departure", "cityRanges"].includes(key)
          )
        ),
      };
      
      // Remove undefined fields
      if (updatedPerson.arrival === undefined) {
        delete updatedPerson.arrival;
      }
      if (updatedPerson.departure === undefined) {
        delete updatedPerson.departure;
      }
      if (updatedPerson.cityRanges === undefined || Object.keys(updatedPerson.cityRanges).length === 0) {
        delete updatedPerson.cityRanges;
      }
      
      console.log("Updated person after merge:", JSON.stringify(updatedPerson, null, 2));
      console.log("Status specifically:", updatedPerson.status);
      console.log("Full data object being written (first person status):", data.people[0]?.status);
      
      data.people[personIndex] = updatedPerson;
      console.log("Writing database with updated person...");
      console.log("Person in data array before write:", JSON.stringify(data.people[personIndex], null, 2));
      console.log("Full data object statuses:", data.people.map(p => ({ id: p.id, status: p.status })));
      
      // CRITICAL: Make sure we're writing the complete data object with all fields preserved
      // Deep clone to ensure we're not missing any nested fields
      const dataToWrite: TripData = {
        ...data,
        people: data.people.map(p => ({ ...p })),
        hotelsByCity: {
          ...data.hotelsByCity,
          london: [...(data.hotelsByCity.london || [])],
          paris: [...(data.hotelsByCity.paris || [])],
          amsterdam: [...(data.hotelsByCity.amsterdam || [])],
        },
        // Preserve optional fields
        ...(data.londonHotel && { londonHotel: data.londonHotel }),
        ...(data.londonHosting && { londonHosting: data.londonHosting }),
      };
      
      console.log("DataToWrite - Person status:", dataToWrite.people.find(p => p.id === personId)?.status);
      await writeDatabase(dataToWrite);
      console.log("Database write complete");
      
      // The writeDatabase function confirms success via commit SHA from GitHub API
      // We trust that if writeDatabase didn't throw an error, the write succeeded
      // GitHub API eventual consistency means reads might be slightly delayed, but the write is committed
      // Return the updated person - the data is saved and will be available on next read
      console.log("Write successful, returning updated person");
      return updatedPerson;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Update attempt ${attempt} failed:`, lastError);
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error("Failed to update person after retries");
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
