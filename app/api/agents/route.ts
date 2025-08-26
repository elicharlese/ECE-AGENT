import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServer } from "@/lib/supabase/server"
import { AgentInsertSchema } from "@/types/agent"

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ agents: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const parsed = AgentInsertSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const payload = {
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      model: parsed.data.model ?? null,
      avatar_url: parsed.data.avatar_url ?? null,
      capabilities: parsed.data.capabilities ?? [],
      mcp_tools: parsed.data.mcp_tools ?? [],
      status: parsed.data.status,
      system_prompt: parsed.data.system_prompt ?? null,
    }

    const { data, error } = await supabase.from("agents").insert(payload).select("*").single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ agent: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 })
  }
}
