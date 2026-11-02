"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Item = { src: string; width: number; height: number; alt: string; caption: string };

/**
 * The screenshot viewer. It takes over clicks on the `a[data-index]` links
 * inside it; without scripts those links simply open the image. A native
 * <dialog>, so focus is held inside it and Escape closes it. Opening pushes
 * a history entry, so the back button or gesture closes it too.
 */
export default function Lightbox({ items, children }: { items: Item[]; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState(0);

  const show = useCallback(
    (i: number) => {
      const n = (i + items.length) % items.length;
      setIndex(n);
      if (pushed.current) history.replaceState(history.state, "", `#shot-${n + 1}`);
      return n;
    },
    [items.length],
  );

  const open = (i: number, from: HTMLElement) => {
    opener.current = from;
    show(i);
    dialog.current?.showModal();
    history.pushState(history.state, "", `#shot-${i + 1}`);
    pushed.current = true;
  };

  /** Every way of closing goes back through history when we added to it, so
   * the entry is not left behind; popstate then closes the dialog. */
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

  const onClick = (e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-index]");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(Number(link.dataset.index), link);
  };

  const item = items[index];

  return (
    <div onClick={onClick}>
      {children}
      <dialog
        ref={dialog}
        aria-label="Screenshot viewer"
        className="m-auto max-h-none max-w-none bg-transparent p-0 text-parchment backdrop:bg-well/90 backdrop:backdrop-blur-sm"
        onCancel={(e) => {
          e.preventDefault();
          requestClose();
        }}
        onClose={() => opener.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") show(index + 1);
          else if (e.key === "ArrowLeft") show(index - 1);
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
        }}
      >
        <figure className="flex w-[min(94vw,1600px)] flex-col items-center">
          <Image
            key={item.src}
            src={item.src}
            width={item.width}
            height={item.height}
            alt={item.alt}
            sizes="94vw"
            className="h-auto max-h-[78svh] w-auto max-w-full rounded-xl border border-line bg-well"
          />
          <div className="mt-5 flex w-full max-w-3xl items-center justify-between gap-4 px-2">
            <button
              type="button"
              onClick={() => show(index - 1)}
              aria-label="Previous screenshot"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-stone text-xl hover:border-edge"
            >
              ‹
            </button>
            <figcaption className="text-center font-display text-lg" aria-live="polite">
              {item.caption}
              <span className="ml-3 font-sans text-sm text-muted">
                {index + 1} of {items.length}
              </span>
            </figcaption>
            <button
              type="button"
              onClick={() => show(index + 1)}
              aria-label="Next screenshot"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-stone text-xl hover:border-edge"
            >
              ›
            </button>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="mt-4 rounded-md px-4 py-2 text-sm text-muted hover:text-brass-bright"
          >
            Close
          </button>
        </figure>
      </dialog>
    </div>
  );
}
