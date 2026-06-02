"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type PhotoSubmission = {
  team: string;
  image_url: string;
};

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

export default function PhotoWallPage() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [teamDisplayNames, setTeamDisplayNames] = useState<TeamDisplayName[]>([]);

  async function loadPhotos() {
    const { data: photoData } = await supabase
      .from("photo_submissions")
      .select("team, image_url")
      .not("image_url", "is", null);

    const { data: teamNameData } = await supabase
      .from("team_display_names")
      .select("*");

    if (photoData) setPhotos(photoData);
    if (teamNameData) setTeamDisplayNames(teamNameData);
  }

  useEffect(() => {
    loadPhotos();
    const interval = setInterval(loadPhotos, 3000);
    return () => clearInterval(interval);
  }, []);

  function getTeamDisplay(team: string) {
    return (
      teamDisplayNames.find((row) => row.team === team) ||
      fallbackTeamNames[team]
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
        href="/admin"
        className="fixed top-4 left-4 z-50 bg-zinc-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all"
      >
        ←
      </a>

      <div className="max-w-6xl mx-auto pt-8">
        <RivieraHeader />

        <h1 className="text-5xl font-black text-center mt-10">
          LIVE PHOTO WALL
        </h1>

        <p className="text-center text-gray-400 mt-3 mb-10">
          Gruppbilder från Riviera Games 📸
        </p>

        {photos.length === 0 ? (
          <div className="bg-zinc-900 rounded-3xl p-10 text-center text-gray-400">
            Inga bilder uppladdade ännu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo) => {
              const display = getTeamDisplay(photo.team);

              return (
                <div
                  key={photo.team}
                  className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
                >
                  <img
                    src={photo.image_url}
                    alt={display.display_name}
                    className="w-full h-[420px] object-cover"
                  />

                  <div className="p-5 text-center">
                    <p className="text-4xl mb-2">
                      {display.icon}
                    </p>

                    <p className="text-3xl font-black uppercase">
                      {display.display_name}
                    </p>

                    <p className="text-gray-500 font-bold mt-1">
                      {fallbackTeamNames[photo.team].display_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}