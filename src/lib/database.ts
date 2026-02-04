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
          Authorization: `Bearer ${GITHUB_TOKEN}`,
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
    throw new Error("GITHUB_TOKEN not configured. Please add it in Vercel environment variables.");
  }

  try {
    console.log("Writing to GitHub...", { repo: GITHUB_REPO, path: DB_FILE_PATH });
    
    // First, get the current file to get its SHA (required for update)
    const getResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
      if (sha) {
        console.log("Got existing file SHA:", sha.substring(0, 10) + "...");
      }
    } else if (getResponse.status === 404) {
      console.log("File doesn't exist yet, will create new file");
    } else {
      const errorText = await getResponse.text();
      throw new Error(`Failed to get file: ${getResponse.status} - ${errorText}`);
    }

    // Update or create the file
    const content = JSON.stringify(data, null, 2);
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
    console.log("Successfully wrote to GitHub:", result.commit?.sha?.substring(0, 10));
    
    // Verify the write by reading back after a delay
    // GitHub API can have eventual consistency, so we retry reading until we get the new data
    let verified = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!verified && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000 + (attempts * 500))); // Increasing delay
      attempts++;
      
      try {
        const verifyResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${DB_FILE_PATH}`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          const verifyContent = Buffer.from(verifyData.content, "base64").toString("utf8");
          const verifyJson = JSON.parse(verifyContent);
          
          // Check if the file SHA has changed (indicating a new write)
          // The new SHA should be different from the old one we used for the write
          if (sha && verifyData.sha !== sha) {
            // Also verify the content matches what we wrote
            const writtenContent = JSON.stringify(data, null, 2);
            const verifyContentNormalized = JSON.stringify(verifyJson, null, 2);
            
            if (writtenContent === verifyContentNormalized) {
              console.log(`Verified write on attempt ${attempts} - SHA changed and content matches`);
              verified = true;
            } else {
              // SHA changed but content doesn't match - might be a concurrent write
              console.log(`SHA changed but content mismatch on attempt ${attempts} - possible concurrent write`);
              // Check if at least our person update is in there
              const personInVerify = verifyJson.people?.find((p: Person) => {
                const personInData = data.people.find(p2 => p2.id === p.id);
                return personInData && JSON.stringify(p) === JSON.stringify(personInData);
              });
              if (personInVerify) {
                console.log("Our person update is present in the file");
                verified = true;
              }
            }
          } else if (!sha) {
            // If there was no previous file, any SHA means it was created
            console.log(`Verified write on attempt ${attempts} - file created`);
            verified = true;
          } else {
            console.log(`Write not yet visible, attempt ${attempts}/${maxAttempts} - SHA still ${verifyData.sha.substring(0, 10)}`);
          }
        }
      } catch (error) {
        console.log(`Verification attempt ${attempts} failed:`, error);
      }
    }
    
    if (!verified) {
      console.warn("Could not verify write after all attempts, but write appeared successful");
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
      await writeDatabase(data);
      console.log("Database write complete");
      
      // Verify the write by reading back immediately
      const verifyData = await readDatabase();
      const verifyPerson = verifyData.people.find((p) => p.id === personId);
      if (verifyPerson && verifyPerson.status === updatedPerson.status) {
        console.log("Write verified - status matches:", verifyPerson.status);
        return verifyPerson;
      } else {
        console.warn(`Write verification failed - expected status ${updatedPerson.status}, got ${verifyPerson?.status}`);
        if (attempt < maxRetries) {
          lastError = new Error(`Status mismatch on attempt ${attempt}`);
          continue; // Retry
        }
      }
      
      return data.people[personIndex];
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
