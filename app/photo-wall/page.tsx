"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type PhotoSubmission = {
  team: string;
  image_url: string;
};

const teamNames: Record<string, string> = {
  gul: "Gul",
  bla: "Blå",
  gron: "Grön",
  rod: "Röd",
};

export default function PhotoWallPage() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);

  async function loadPhotos() {
    const { data } = await supabase
      .from("photo_submissions")
      .select("team, image_url")
      .not("image_url", "is", null);

    if (data) setPhotos(data);
  }

  useEffect(() => {
    loadPhotos();
    const interval = setInterval(loadPhotos, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto pt-8">
        <RivieraHeader />
        <a
  href="/admin"
  className="inline-block mb-6 bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold"
>
  ← Admin
</a>

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
            {photos.map((photo) => (
              <div
                key={photo.team}
                className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl"
              >
                <img
                  src={photo.image_url}
                  alt={`Lag ${teamNames[photo.team]}`}
                  className="w-full h-[420px] object-cover"
                />

                <div className="p-5 text-center">
                  <p className="text-3xl font-black uppercase">
                    Lag {teamNames[photo.team]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}