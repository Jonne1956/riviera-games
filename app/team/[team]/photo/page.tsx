"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import RivieraHeader from "@/app/components/RivieraHeader";

export default function PhotoPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(
    null
  );

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    } = supabase.storage
      .from("team-photos")
      .getPublicUrl(fileName);

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

    setTimeout(() => {
      router.push(`/team/${team}`);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />

        <div className="text-center mb-10 mt-8">
          <h1 className="text-4xl font-bold mb-3">
            Gruppbild
          </h1>

          <p className="text-gray-400">
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
                      if (
                        e.target.files &&
                        e.target.files[0]
                      ) {
                        setSelectedFile(
                          e.target.files[0]
                        );
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
                {uploading
                  ? "Laddar upp..."
                  : "Skicka gruppbild"}
              </button>
            </div>
          ) : (
            <div className="bg-green-500 text-black p-6 rounded-2xl text-center font-bold text-2xl">
              Gruppbild inskickad ✅
            </div>
          )}
        </div>
      </div>
    </main>
  );
}