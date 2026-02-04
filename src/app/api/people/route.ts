import { NextRequest, NextResponse } from "next/server";
import { getAllPeople, updatePerson } from "@/lib/database";
import type { Person } from "@/data/tripData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const people = await getAllPeople();
    return NextResponse.json(people, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/people - Received request");
    const body = await request.json();
    const person = body as Person;
    
    console.log("Updating person:", person.id, { 
      status: person.status, 
      hasCityRanges: !!person.cityRanges,
      arrival: person.arrival,
      departure: person.departure 
    });
    
    if (!person.id) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 });
    }
    
    const { id, ...updates } = person;
    const updatedPerson = await updatePerson(id, updates);
    console.log("Successfully updated person:", updatedPerson.id);
    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Error updating person:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json({ 
      error: "Failed to update person",
      details: errorMessage 
    }, { status: 500 });
  }
}


