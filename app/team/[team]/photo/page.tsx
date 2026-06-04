"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import RivieraHeader from "@/app/components/RivieraHeader";

type TeamDisplayName = {
  team: string;
  display_name: string;
  icon: string;
};

const fallbackTeamNames: Record<string, TeamDisplayName> = {
  gul: { team: "gul", display_name: "Lag Gul", icon: "⛷️" },
  bla: { team: "bla", display_name: "Lag Blå", icon: "🔨" },
  gron: { team: "gron", display_name: "Lag Grön", icon: "🍺" },
  rod: { team: "rod", display_name: "Lag Röd", icon: "⛳" },
};

export default function PhotoPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [teamDisplay, setTeamDisplay] = useState<TeamDisplayName | null>(null);

  const fallback = fallbackTeamNames[team] || {
    team,
    display_name: `Lag ${team}`,
    icon: "",
  };

  const display = teamDisplay || fallback;

  useEffect(() => {
    async function loadPageData() {
      const { data: teamNameData } = await supabase
        .from("team_display_names")
        .select("*")
        .eq("team", team)
        .maybeSingle();

      const { data: photoData } = await supabase
        .from("photo_submissions")
        .select("id")
        .eq("team", team)
        .limit(1);

      if (teamNameData) {
        setTeamDisplay(teamNameData);
      }

      if (photoData && photoData.length > 0) {
        setAlreadySubmitted(true);
      }
    }

    loadPageData();
  }, [team]);

  async function uploadPhoto() {
    if (!selectedFile) {
      alert("Välj en bild först");
      return;
    }

    setUploading(true);

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${team}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("team-photos")
      .upload(fileName, selectedFile);

    if (uploadError) {
      alert("Kunde inte ladda upp bild");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("team-photos").getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("photo_submissions")
      .insert({
        team,
        image_url: publicUrl,
      });

    if (insertError) {
      alert("Kunde inte spara bild");
      setUploading(false);
      return;
    }

    setUploading(false);
    setSubmitted(true);
    setAlreadySubmitted(true);

    setTimeout(() => {
      router.push(`/team/${team}`);
    }, 1500);
  }

  if (alreadySubmitted && !submitted) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-md mx-auto pt-10">
          <RivieraHeader />

          <div className="bg-green-500 text-black p-8 rounded-3xl text-center mt-10">
            <p className="text-5xl mb-3">{display.icon}</p>

            <h1 className="text-3xl font-black mb-3">
              Gruppbild redan inskickad
            </h1>

            <p className="font-black text-xl">
              {display.display_name}
            </p>

            <p className="font-bold opacity-80 mt-1">
              {fallback.display_name}
            </p>

            <p className="mt-5 font-bold">
              Ni har redan laddat upp er gruppbild ✅
            </p>
          </div>

          <button
            onClick={() => router.push(`/team/${team}`)}
            className="w-full mt-6 p-4 rounded-2xl bg-yellow-400 text-black font-black"
          >
            Tillbaka till momentmenyn
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />

        <div className="text-center mb-10 mt-8">
          <p className="text-5xl mb-2">{display.icon}</p>

          <p className="text-yellow-400 font-black uppercase tracking-wide">
            Moment 3
          </p>

          <h1 className="text-4xl font-black mt-2">
            Gruppbild
          </h1>

          <p className="text-yellow-400 font-black mt-2">
            {display.display_name}
          </p>

          <p className="text-gray-500 font-bold mt-1">
            {fallback.display_name}
          </p>

          <p className="text-gray-400 mt-4">
            Ladda upp lagets bästa Riviera-bild 🌴
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          {!submitted ? (
            <div className="grid gap-6">
              <div className="grid gap-3">
                <label className="bg-yellow-400 text-black p-5 rounded-2xl font-bold text-xl text-center cursor-pointer hover:scale-105 transition">
                  📸 Välj gruppbild

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <p className="text-center text-gray-400">
                    Vald fil: {selectedFile.name}
                  </p>
                )}
              </div>

              <button
                onClick={uploadPhoto}
                disabled={uploading}
                className="bg-green-500 p-5 rounded-2xl font-bold text-xl hover:scale-105 transition"
              >
                {uploading ? "Laddar upp..." : "Skicka gruppbild"}
              </button>
            </div>
          ) : (
            <div className="bg-green-500 text-black p-6 rounded-2xl text-center font-bold text-2xl">
              Gruppbild inskickad ✅
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/team/${team}`)}
          className="w-full mt-6 p-4 rounded-2xl bg-zinc-800 text-white font-bold"
        >
          Tillbaka till momentmenyn
        </button>
      </div>
    </main>
  );
}