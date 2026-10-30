import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-4 text-muted">
          <Link href="/" className="text-brass underline underline-offset-4">Back to the home page</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
