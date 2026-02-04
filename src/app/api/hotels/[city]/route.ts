import { NextRequest, NextResponse } from "next/server";
import { getHotels, addHotel, deleteHotel } from "@/lib/database";
import type { Hotel } from "@/data/tripData";

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = params.city as "london" | "paris" | "amsterdam";
    const hotels = await getHotels(city);
    return NextResponse.json(hotels, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = params.city as "london" | "paris" | "amsterdam";
    const hotel = (await request.json()) as Hotel;
    
    const addedHotel = await addHotel(city, hotel);
    return NextResponse.json(addedHotel);
  } catch (error) {
    console.error("Error adding hotel:", error);
    return NextResponse.json({ error: "Failed to add hotel" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = params.city as "london" | "paris" | "amsterdam";
    const body = await request.json();
    const { id: hotelId } = body as { id: string };
    
    if (!hotelId) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }
    
    await deleteHotel(city, hotelId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json({ error: "Failed to delete hotel" }, { status: 500 });
  }
}

