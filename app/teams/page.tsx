import Link from "next/link";
import RivieraHeader from "@/app/components/RivieraHeader";

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-6 pt-12">
  <RivieraHeader />

  <h1 className="text-5xl font-bold mt-10 mb-10 text-center">
    Välj ditt lag
  </h1>

  <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
    <a
      href="/team/gul"
      className="bg-yellow-400 text-black text-4xl font-bold py-10 rounded-3xl text-center hover:scale-105 transition"
    >
      Lag Gul
    </a>

    <a
      href="/team/bla"
      className="bg-blue-500 text-white text-4xl font-bold py-10 rounded-3xl text-center hover:scale-105 transition"
    >
      Lag Blå
    </a>

    <a
      href="/team/gron"
      className="bg-green-500 text-white text-4xl font-bold py-10 rounded-3xl text-center hover:scale-105 transition"
    >
      Lag Grön
    </a>

    <a
      href="/team/rod"
      className="bg-red-500 text-white text-4xl font-bold py-10 rounded-3xl text-center hover:scale-105 transition"
    >
      Lag Röd
    </a>
  </div>
</main>
  );
}