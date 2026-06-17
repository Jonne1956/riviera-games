import { supabase } from "@/lib/supabase";

export async function getRivieraTeamMembers(team: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("music_guests")
    .select("name")
    .eq("rivieragames_team", team)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Could not load Riviera team members:", error);
    return [];
  }

  return (data || []).map((guest) => guest.name);
}