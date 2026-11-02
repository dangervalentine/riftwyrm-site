import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { dragons } from "@/components/media.generated";

export default function NotFound() {
  const head = dragons.water.head;
  return (
    <>
      <Header />
      <main className="ground-1 flex flex-1 items-center">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 px-6 py-24 sm:flex-row sm:items-center">
          <Image src={head.src} width={head.width} height={head.height} alt="" className="w-40 opacity-90" />
          <div>
            <h1 className="font-display text-4xl font-bold">This road goes nowhere</h1>
            <p className="mt-3 text-lg text-muted">There is no page at this address.</p>
            <p className="mt-6">
              <Link href="/" className="text-brass underline underline-offset-4 hover:text-brass-bright">
                Back to Riftwyrm
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
