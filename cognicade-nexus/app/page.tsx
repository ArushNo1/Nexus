import Link from "next/link";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-20 items-center">
          <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              <Link href="/create">Get Started</Link>
            </button>
          </div>

          <Footer />
        </div>
      </main>
    </>
  );
}
