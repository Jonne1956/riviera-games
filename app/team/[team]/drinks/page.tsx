"use client";

import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import RivieraHeader from "@/app/components/RivieraHeader";


const drinkOptions = [
  "Öl",
  "Alkoholfri öl",
  "Läsk med socker",
  "Sockerfri läsk",
];

export default function DrinksPage() {
  const params = useParams();
  const router = useRouter(); 
  const team = params.team as string;
 
  const [drink1, setDrink1] = useState("");
  const [drink2, setDrink2] = useState("");
  const [drink3, setDrink3] = useState("");
  const [drink4, setDrink4] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submitAnswers() {
    if (!drink1 || !drink2 || !drink3 || !drink4) {
      alert("Välj svar för alla fyra drycker.");
      return;
    }

    const { error } = await supabase.from("drink_answers").insert({
      team,
      drink_1: drink1,
      drink_2: drink2,
      drink_3: drink3,
      drink_4: drink4,
    });

    if (error) {
      alert("Fel: " + error.message);
      return;
    }

    setSubmitted(true);

setTimeout(() => {
  router.push(`/team/${team}`);
}, 1500);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-10 rounded-3xl text-center max-w-md w-full">
          <h1 className="text-4xl font-bold mb-4">
            Dryckestest inskickat ✅
          </h1>
          <p className="text-gray-400">
            Era svar är sparade.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <RivieraHeader />
        <div className="mb-6 text-center">
          <p className="text-blue-400 font-bold uppercase tracking-wide">
            Moment 2
          </p>
          <h1 className="text-4xl font-bold mt-2">
            Dryckestest
          </h1>
          <p className="text-gray-400 mt-2">
            Matcha dryck 1–4 med rätt alternativ.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-800 grid gap-5">
          {[1, 2, 3, 4].map((number) => {
            const value =
              number === 1 ? drink1 :
              number === 2 ? drink2 :
              number === 3 ? drink3 :
              drink4;

            const setter =
              number === 1 ? setDrink1 :
              number === 2 ? setDrink2 :
              number === 3 ? setDrink3 :
              setDrink4;

            return (
              <label key={number} className="grid gap-2">
                <span className="font-bold text-xl">
                  Dryck {number}
                </span>

                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white text-lg"
                >
                  <option value="">Välj dryck</option>
                  {drinkOptions.map((drink) => (
                    <option key={drink} value={drink}>
                      {drink}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}

          <button
            onClick={submitAnswers}
            className="bg-blue-500 p-5 rounded-2xl font-bold text-xl mt-4 active:scale-95 transition"
          >
            Skicka dryckessvar
          </button>
        </div>
      </div>
    </main>
  );
}