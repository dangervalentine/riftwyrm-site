import Image from "next/image";
import { dragons } from "../media.generated";
import StoreButtons from "../StoreButtons";

/** The end of the road: the last dragon watching, and where to get the game. */
export default function FinalCta() {
  const head = dragons.shadow.head;
  return (
    <section aria-labelledby="cta-title" className="ground-lair overflow-hidden py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 id="cta-title" className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
            The dragons are waiting.
          </h2>
          <p className="mt-4 text-lg text-muted">Coming to iPhone, iPad and Android.</p>
          <StoreButtons className="mt-8" />
        </div>
        <Image
          src={head.src}
          width={head.width}
          height={head.height}
          alt=""
          sizes="(min-width: 768px) 320px, 60vw"
          className="w-[60vw] max-w-[320px] self-end -scale-x-100 opacity-90 drop-shadow-[0_20px_40px_var(--well)] md:self-auto"
        />
      </div>
    </section>
  );
}
