"use client";

import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    async function checkExistingSubmission() {
      const { data } = await supabase
        .from("drink_answers")
        .select("id")
        .eq("team", team)
        .limit(1);

      if (data && data.length > 0) {
        setAlreadySubmitted(true);
      }
    }

    checkExistingSubmission();
  }, [team]);

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
      alert("Det gick inte att spara svaren. Laget kan redan ha skickat in.");
      return;
    }

    setSubmitted(true);
    setAlreadySubmitted(true);

    setTimeout(() => {
      router.push(`/team/${team}`);
    }, 1500);
  }

  if (alreadySubmitted && !submitted) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-md mx-auto pt-6">
          <RivieraHeader />

          <div className="mt-10 bg-green-500 text-black p-8 rounded-3xl text-center">
            <p className="text-5xl mb-4">✅</p>

            <h1 className="text-3xl font-black mb-3">
              Dryckestest redan inskickat
            </h1>

            <p className="font-bold">
              Ni har redan skickat in era svar.
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
      <div className="max-w-md mx-auto pt-6">
        <RivieraHeader />

        <p className="text-yellow-400 font-black text-center uppercase tracking-wide mt-8">
          Moment 2
        </p>

        <h1 className="text-4xl font-black text-center mt-2">
          Dryckestest
        </h1>

        <p className="text-gray-400 text-center mt-3 mb-8">
          Identifiera de fyra hemliga dryckerna. Ni har bara ett försök.
        </p>

        <div className="grid gap-4">
          {[1, 2, 3, 4].map((number) => {
            const value =
              number === 1
                ? drink1
                : number === 2
                ? drink2
                : number === 3
                ? drink3
                : drink4;

            const setter =
              number === 1
                ? setDrink1
                : number === 2
                ? setDrink2
                : number === 3
                ? setDrink3
                : setDrink4;

            const icons = ["🥂", "🍺", "🍹", "🧃"];

            return (
              <div
                key={number}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{icons[number - 1]}</span>

                  <span className="text-yellow-400 font-black uppercase">
                    Dryck {number}
                  </span>
                </div>

                <select
                  disabled={submitted}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className={`w-full p-4 rounded-2xl text-lg font-bold transition-all ${
                    submitted
                      ? "bg-green-900 border border-green-500 text-green-100"
                      : "bg-zinc-800 border border-zinc-700 text-white"
                  }`}
                >
                  <option value="">Välj dryck</option>

                  {drinkOptions.map((drink) => (
                    <option key={drink} value={drink}>
                      {drink}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <button
          onClick={submitAnswers}
          disabled={submitted}
          className={`w-full mt-8 p-5 rounded-3xl font-black text-xl transition-all ${
            submitted
              ? "bg-green-600 text-white"
              : "bg-yellow-400 text-black hover:scale-105"
          }`}
        >
          {submitted ? "✅ Svar inskickade" : "🍹 Skicka drycksvar"}
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