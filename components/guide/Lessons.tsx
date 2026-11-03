"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Evidence, Lesson } from "@/components/guide";

const TAG: Record<Evidence, { label: string; className: string }> = {
  tested: { label: "Tested", className: "text-jade" },
  observed: { label: "Observed", className: "text-brass" },
  "tested-dont": { label: "Tested: don’t", className: "text-danger" },
};

function Tag({ evidence }: { evidence: Evidence }) {
  return <span className={`guide-tag ${TAG[evidence].className}`}>{TAG[evidence].label}</span>;
}

function Body({ lesson }: { lesson: Lesson }) {
  return (
    <>
      <p className="mt-3">{lesson.body}</p>
      {lesson.effect && <p className="guide-tip mt-4 text-[0.9375rem]">{lesson.effect}</p>}
    </>
  );
}

/**
 * The lessons in one place. On a wide screen, a tab for each lesson down the
 * side and its text beside it; on a phone, each opens in place. Without
 * scripts every lesson is simply listed. A link to #lesson-<id> opens that one.
 */
export default function Lessons({ lessons }: { lessons: Lesson[] }) {
  const [mode, setMode] = useState<"list" | "tabs" | "accordion">("list");
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(-1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const fromHash = () => {
      const m = /^#lesson-(.+)$/.exec(window.location.hash);
      const i = m ? lessons.findIndex((l) => l.id === m[1]) : -1;
      if (i >= 0) {
        setSelected(i);
        setOpen(i);
      }
    };
    const update = () => setMode(wide.matches ? "tabs" : "accordion");
    update();
    fromHash();
    wide.addEventListener("change", update);
    window.addEventListener("hashchange", fromHash);
    return () => {
      wide.removeEventListener("change", update);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [lessons]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = lessons.length;
    const to = { ArrowDown: (i + 1) % n, ArrowUp: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setSelected(to);
    tabs.current[to]?.focus();
  };

  const intro = (
    <p>
      <span className="font-semibold text-jade">Tested</span> lessons were played head to head on the same deals, with
      and without the habit, so the difference is the habit&rsquo;s own.{" "}
      <span className="font-semibold text-brass">Observed</span> lessons come from watching how strong players play:
      strong hints, not proof.
    </p>
  );

  return (
    <section id="lessons" aria-labelledby="lessons-h">
      <div className="guide-col guide-body">
        <h2 id="lessons-h" className="guide-h2">Lessons for every dragon</h2>
        {intro}
      </div>

      {mode === "list" && (
        <ol className="guide-col guide-body mt-8 space-y-10">
          {lessons.map((l, i) => (
            <li key={l.id} id={`lesson-${l.id}`}>
              <Tag evidence={l.evidence} />
              <h3 className="guide-h3 mt-2">
                <span className="text-faint">{i + 1}. </span>
                {l.title}
              </h3>
              <Body lesson={l} />
            </li>
          ))}
        </ol>
      )}

      {mode === "tabs" && (
        <div className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-[17rem_1fr] gap-8 px-6">
          <div role="tablist" aria-orientation="vertical" aria-label="Lessons" className="flex flex-col gap-1">
            {lessons.map((l, i) => (
              <button
                key={l.id}
                id={`lesson-${l.id}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                type="button"
                aria-selected={selected === i}
                aria-controls="lesson-panel"
                tabIndex={selected === i ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`rounded-md border-l-2 px-3 py-2.5 text-left text-sm leading-snug transition-colors ${
                  selected === i
                    ? "border-brass bg-stone-raised text-parchment"
                    : "border-transparent text-muted hover:bg-stone hover:text-parchment"
                }`}
              >
                <span className="text-faint">{i + 1}. </span>
                {l.title}
              </button>
            ))}
          </div>
          <div
            id="lesson-panel"
            role="tabpanel"
            aria-labelledby={`lesson-${lessons[selected].id}`}
            tabIndex={0}
            className="guide-body min-h-[22rem] rounded-lg border border-line bg-stone p-6 sm:p-8"
          >
            <Tag evidence={lessons[selected].evidence} />
            <h3 className="guide-h3 mt-3 text-2xl">{lessons[selected].title}</h3>
            <Body lesson={lessons[selected]} />
          </div>
        </div>
      )}

      {mode === "accordion" && (
        <div className="guide-col guide-body mt-6 divide-y divide-line border-y border-line">
          {lessons.map((l, i) => (
            <details
              key={l.id}
              id={`lesson-${l.id}`}
              open={open === i}
              onToggle={(e) => {
                const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                if (isOpen) setOpen(i);
                else if (open === i) setOpen(-1);
              }}
              className="group py-1"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 py-3 [&::-webkit-details-marker]:hidden">
                <span className="text-faint">{i + 1}.</span>
                <span className="flex-1 font-display text-lg font-semibold leading-snug text-parchment">{l.title}</span>
                <span aria-hidden="true" className="mt-1 text-brass transition-transform group-open:rotate-90">›</span>
              </summary>
              <div className="pb-5 pl-6">
                <Tag evidence={l.evidence} />
                <Body lesson={l} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
