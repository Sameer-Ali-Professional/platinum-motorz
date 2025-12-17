import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching car:", error)
    return NextResponse.json({ error: "Car not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

