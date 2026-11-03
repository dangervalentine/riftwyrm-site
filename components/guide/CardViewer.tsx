"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ViewerItem, ViewerLevel } from "./cardViewerItems";

const ACTION = { attack: "Attack", move: "Move", flex: "Attack or Move" } as Record<string, string>;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One Level's figures, spelled out as the game's card detail does. */
function Figures({ item, l }: { item: ViewerItem; l: ViewerLevel }) {
  const rows: [string, string, string?][] = [
    ["Strength", `${l.strength}`, "its best Spell figure plus its Boost"],
    ["Speed", `${l.speed}`],
    ["Basic action", `${l.basic.value} ${ACTION[l.basic.type] ?? cap(l.basic.type)}`],
    ["Attuned action", `${l.attuned.value} ${ACTION[l.attuned.type] ?? cap(l.attuned.type)}, with a ${cap(l.attuned.essence)} Element`],
    ["Boost", `+${l.boost}`],
    ["Armor", l.armor.essence ? `${l.armor.value}, ${l.armor.value * 2} against ${cap(l.armor.essence)}` : `${l.armor.value}`],
    ["Empower", l.empower == null ? "Highest Level" : `${l.empower} XP to Level ${l.level + 1}`],
  ];
  return (
    <div>
      <p className="text-sm text-muted">
        {cap(item.essence)} Essence · Level {l.level} of {item.levels.length}
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[0.9375rem]">
        {rows.map(([k, v, note]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="text-parchment">
              <span className="font-semibold">{v}</span>
              {note && <span className="text-faint">: {note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The card viewer: press any small card inside it (an `a[data-card]`) to see
 * that card at all four Levels, side by side, and every figure of the Level
 * chosen, as the game shows a card when you press it. A native <dialog>, so
 * focus stays inside and Escape closes it; opening adds a history entry, so
 * Back closes it too. Without scripts the small cards open their pictures.
 */
export default function CardViewer({ items, children }: { items: ViewerItem[]; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState(1);

  const requestClose = useCallback(() => {
    if (pushed.current) history.back();
    else dialog.current?.close();
  }, []);

  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      if (dialog.current?.open) dialog.current.close();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const showCard = (i: number) => {
    const n = (i + items.length) % items.length;
    setIndex(n);
    if (pushed.current) history.replaceState(history.state, "", `#card-${items[n].id}`);
  };

  const onClick = (e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-card]");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const i = items.findIndex((it) => it.id === link.dataset.card);
    if (i < 0) return;
    e.preventDefault();
    opener.current = link;
    setIndex(i);
    setLevel(Number(link.dataset.level) || 1);
    dialog.current?.showModal();
    history.pushState(history.state, "", `#card-${items[i].id}`);
    pushed.current = true;
  };

  const item = items[index];
  const chosen = item.levels[level - 1];

  return (
    <div onClick={onClick}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="card-viewer-title"
        className="m-auto max-h-[94svh] w-[min(94vw,60rem)] max-w-none overflow-y-auto rounded-xl border border-line bg-stone p-0 text-parchment backdrop:bg-well/90 backdrop:backdrop-blur-sm"
        onCancel={(e) => {
          e.preventDefault();
          requestClose();
        }}
        onClose={() => opener.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setLevel((l) => Math.min(item.levels.length, l + 1));
          else if (e.key === "ArrowLeft") setLevel((l) => Math.max(1, l - 1));
        }}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="card-viewer-title" className="font-display text-2xl font-semibold" aria-live="polite">
                {item.label}
              </h2>
              <p className="mt-1 text-sm text-muted">Every Level of the card. Press one to read its figures.</p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close"
              className="grid size-10 flex-none place-items-center rounded-full border border-line text-xl text-muted hover:border-edge hover:text-parchment"
            >
              ×
            </button>
          </div>

          <ol className="mt-5 grid grid-cols-4 gap-2 sm:gap-4">
            {item.levels.map((l) => (
              <li key={l.level}>
                <button
                  type="button"
                  onClick={() => setLevel(l.level)}
                  aria-pressed={level === l.level}
                  aria-label={`Level ${l.level}, strength ${l.strength}`}
                  className={`block w-full rounded-lg p-1 transition-colors sm:p-1.5 ${
                    level === l.level ? "bg-stone-raised ring-2 ring-brass" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={l.src} width={l.width} height={l.height} alt="" sizes="(min-width: 640px) 210px, 22vw" className="h-auto w-full" />
                  <span className="mt-1.5 block text-center text-xs text-muted sm:text-sm">
                    Level {l.level} · <span className="font-semibold text-parchment">{l.strength}</span>
                    {l.level > 1 && (
                      <span className="hidden text-jade sm:inline"> (+{l.strength - item.levels[l.level - 2].strength})</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-lg border border-line bg-ground/40 p-4 sm:p-5" aria-live="polite">
            <Figures item={item} l={chosen} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => showCard(index - 1)}
              className="rounded-md border border-line px-3 py-2 text-sm text-muted hover:border-edge hover:text-parchment"
            >
              ‹ {items[(index - 1 + items.length) % items.length].label}
            </button>
            <span className="hidden text-xs text-faint sm:inline">
              {index + 1} of {items.length}
            </span>
            <button
              type="button"
              onClick={() => showCard(index + 1)}
              className="rounded-md border border-line px-3 py-2 text-right text-sm text-muted hover:border-edge hover:text-parchment"
            >
              {items[(index + 1) % items.length].label} ›
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
