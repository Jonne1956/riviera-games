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
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  async function deletePhoto(photoId: number) {
    if (!confirm("Vill du ta bort bilden från festgalleriet?")) return;

    setDeletingId(photoId);

    const { error } = await supabase
      .from("party_photos")
      .delete()
      .eq("id", photoId);

    setDeletingId(null);

    if (error) {
      alert("Kunde inte ta bort bilden.");
      return;
    }

    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <a
  href="/admin"
  className="fixed top-4 left-4 z-50 w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-3xl"
>
  ←
</a>
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
                className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800"
              >
                <img
                  src={photo.image_url}
                  alt="Festbild"
                  className="w-full aspect-square object-cover"
                />

                <button
  onClick={() => deletePhoto(photo.id)}
  disabled={deletingId === photo.id}
  className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg text-xs"
  title="Ta bort bild"
>
  🗑️
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}