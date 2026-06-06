"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PartyPhoto = {
  id: number;
  image_url: string;
  created_at: string;
};

export default function PhotoWallLivePage() {
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  async function loadPhotos() {
    const { data } = await supabase
      .from("party_photos")
      .select("id, image_url, created_at")
      .order("created_at", { ascending: true });

    if (data) {
      setPhotos(data);

      if (currentIndex >= data.length) {
        setCurrentIndex(0);
      }
    }
  }

  useEffect(() => {
    loadPhotos();

    const loadInterval = setInterval(loadPhotos, 10000);

    return () => clearInterval(loadInterval);
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    const slideshowInterval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentIndex((current) => (current + 1) % photos.length);
        setFade(true);
      }, 500);
    }, 5000);

    return () => clearInterval(slideshowInterval);
  }, [photos.length]);

  const currentPhoto = photos[currentIndex];

  return (
    <main className="min-h-screen bg-black text-white p-6 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-5xl">📸</span>

          <h1 className="text-4xl md:text-5xl font-black">
            RIVIERA PHOTO WALL
          </h1>
        </div>

        {photos.length === 0 || !currentPhoto ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-14 text-gray-400 text-3xl">
            Inga festbilder uppladdade ännu.
          </div>
        ) : (
          <div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-4 shadow-2xl">
              <img
                src={currentPhoto.image_url}
                alt="Festbild"
                className={`w-full max-h-[75vh] object-contain rounded-[1.5rem] transition-opacity duration-500 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            <p className="text-gray-600 mt-4 font-bold text-sm">
              Bild {currentIndex + 1} av {photos.length}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}