"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";

export default function PartyPhotosPage() {
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  async function uploadPhoto() {
    if (!selectedFile) {
      alert("Välj en bild först.");
      return;
    }

    setUploading(true);

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `party-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("party-photos")
      .upload(fileName, selectedFile);

    if (uploadError) {
      alert("Kunde inte ladda upp bilden.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("party-photos")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("party_photos")
      .insert({
        image_url: publicUrl,
        uploader_name: name || null,
      });

    if (insertError) {
      alert("Kunde inte spara bilden.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setUploaded(true);
    setSelectedFile(null);
    setName("");
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />

        <div className="text-center mt-8 mb-8">
          <p className="text-6xl mb-4">📸</p>

          <h1 className="text-4xl font-black">
            Festbilder
          </h1>

          <p className="text-gray-400 mt-4">
            Dela dina bästa bilder från Riviera Pool Party 🌴
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          {uploaded ? (
            <div className="bg-green-500 text-black p-6 rounded-2xl text-center">
              <p className="text-4xl mb-3">✅</p>

              <p className="font-black text-xl">
                Bild uppladdad!
              </p>

              <button
                onClick={() => setUploaded(false)}
                className="mt-4 bg-black text-white px-5 py-3 rounded-2xl font-bold"
              >
                Ladda upp en till bild
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              <input
                type="text"
                placeholder="Ditt namn (valfritt)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
              />

              <label className="bg-yellow-400 text-black p-5 rounded-2xl font-black text-center cursor-pointer">
                📸 Välj bild

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <p className="text-center text-gray-400">
                  {selectedFile.name}
                </p>
              )}

              <button
                onClick={uploadPhoto}
                disabled={uploading}
                className="bg-green-500 text-black p-5 rounded-2xl font-black text-xl"
              >
                {uploading
                  ? "Laddar upp..."
                  : "Skicka bild"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}