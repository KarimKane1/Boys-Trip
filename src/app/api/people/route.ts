import { NextRequest, NextResponse } from "next/server";
import { getAllPeople, updatePerson } from "@/lib/database";
import type { Person } from "@/data/tripData";

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Person & { id: string };
    
    if (!id) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 });
    }
    
    const updatedPerson = await updatePerson(id, updates);
    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Error updating person:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to update person",
      details: errorMessage 
    }, { status: 500 });
  }
}


