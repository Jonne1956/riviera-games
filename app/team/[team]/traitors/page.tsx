"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RivieraHeader from "@/app/components/RivieraHeader";
import { teamMembers } from "@/app/data/teamMembers";
import { traitors } from "@/app/data/traitors";

export default function TraitorsPage() {
  const params = useParams();
  const router = useRouter();
  const team = params.team as string;

  const members = teamMembers[team] || [];

  const [selectedName, setSelectedName] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkExistingVote() {
      const { data } = await supabase
        .from("traitor_votes")
        .select("suspect_name")
        .eq("team", team)
        .limit(1);

      if (data && data.length > 0) {
        setAlreadySubmitted(true);
        setSubmittedName(data[0].suspect_name);
      }
    }

    checkExistingVote();
  }, [team]);

  async function submitVote() {
    if (!selectedName) {
      alert("Välj en person först.");
      return;
    }

    const isCorrect = selectedName === traitors[team];
    const points = isCorrect ? 5 : 0;

    setSubmitting(true);

    const { error } = await supabase.from("traitor_votes").insert({
      team,
      suspect_name: selectedName,
      is_correct: isCorrect,
      points,
    });

    setSubmitting(false);

    if (error) {
      alert("Det gick inte att spara. Laget kan redan ha skickat in.");
      return;
    }

    setAlreadySubmitted(true);
    setSubmittedName(selectedName);

    setTimeout(() => {
      router.push(`/team/${team}`);
    }, 2000);
  }

  if (alreadySubmitted) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-md mx-auto pt-6">
          <RivieraHeader />

          <div className="mt-10 bg-yellow-400 text-black p-8 rounded-3xl text-center">
            <p className="text-5xl mb-4">🕵️</p>

            <h1 className="text-3xl font-black mb-3">
              Svar registrerat
            </h1>

            <p className="font-bold">
              Ni har valt:
            </p>

            <p className="text-4xl font-black mt-3">
              {submittedName}
            </p>

            <p className="mt-5 font-bold">
              Resultatet avslöjas vid prisutdelningen.
            </p>
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

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <p className="text-yellow-400 font-black text-center uppercase tracking-wide mt-8">
          Moment 4
        </p>

        <h1 className="text-4xl font-black text-center mt-2">
          The Traitors
        </h1>

        <p className="text-gray-400 text-center mt-4 mb-8">
          I ert lag finns en förrädare. Diskutera, rösta och välj den person ni tror är förrädaren. Ni har bara ett försök.
        </p>

        <div className="grid gap-3">
          {members.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedName(name)}
              className={`p-4 rounded-2xl font-black text-xl border transition-all ${
                selectedName === name
                  ? "bg-yellow-400 text-black border-yellow-400 scale-105"
                  : "bg-zinc-900 text-white border-zinc-800"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <button
          onClick={submitVote}
          disabled={submitting}
          className="w-full mt-8 p-5 rounded-3xl bg-yellow-400 text-black font-black text-xl hover:scale-105 transition"
        >
          {submitting ? "Skickar..." : "🕵️ Skicka svar"}
        </button>

        <button
          onClick={() => router.push(`/team/${team}`)}
          className="w-full mt-4 p-4 rounded-2xl bg-zinc-800 text-white font-bold"
        >
          Tillbaka till momentmenyn
        </button>
      </div>
    </main>
  );
}