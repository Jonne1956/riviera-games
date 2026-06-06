"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

type PartyPhoto = {
  id: number;
  image_url: string;
  uploader_name: string | null;
  created_at: string;
};

export default function PartyGalleryPage() {
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);

  async function loadPhotos() {
    const { data } = await supabase
      .from("party_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPhotos(data);
    }
  }

  useEffect(() => {
    loadPhotos();

    const interval = setInterval(loadPhotos, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto pt-8">
        <RivieraHeader />

        <div className="text-center mb-10">
          <p className="text-6xl mb-4">📸</p>

          <h1 className="text-5xl font-black">
            Festgalleri
          </h1>

          <p className="text-gray-400 mt-4">
            Bilder från Riviera Pool Party 🌴
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center text-gray-400">
            Inga bilder uppladdade ännu.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800"
              >
                <img
                  src={photo.image_url}
                  alt="Festbild"
                  className="w-full aspect-square object-cover"
                />

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}