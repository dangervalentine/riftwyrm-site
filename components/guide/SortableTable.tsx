"use client";

import { useState, type ReactNode } from "react";

export type SortColumn = {
  label: string;
  /** Smaller text under the label. */
  sub?: string;
  /** Numbers sort largest first on the first press; text A to Z. */
  numeric?: boolean;
  className?: string;
};
export type SortRow = { key: string; cells: ReactNode[]; sort: (number | string)[]; className?: string };

/**
 * A table whose column headings sort it: press one to order the rows by that
 * column, again to reverse. Drawn on the server in its first order, so it reads
 * the same without scripts; sorting only reorders the rows.
 */
export default function SortableTable({
  caption,
  columns,
  rows,
  initial = null,
}: {
  caption: string;
  columns: SortColumn[];
  rows: SortRow[];
  initial?: { col: number; dir: "asc" | "desc" } | null;
}) {
  const [sort, setSort] = useState(initial);
  const ordered = sort
    ? [...rows].sort((a, b) => {
        const x = a.sort[sort.col];
        const y = b.sort[sort.col];
        const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.dir === "asc" ? c : -c;
      })
    : rows;

  const press = (col: number) =>
    setSort((s) =>
      s && s.col === col
        ? { col, dir: s.dir === "asc" ? "desc" : "asc" }
        : { col, dir: columns[col].numeric ? "desc" : "asc" },
    );

  return (
    <div className="guide-frame">
      <table className="guide-table guide-table-keep">
        <caption>
          {caption} <span className="text-faint">Press a heading to sort by it.</span>
        </caption>
        <thead>
          <tr>
            {columns.map((c, i) => {
              const on = sort?.col === i;
              return (
                <th
                  key={c.label}
                  scope="col"
                  className={c.className}
                  aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button type="button" className="guide-sort" onClick={() => press(i)}>
                    <span>
                      {c.label}
                      {c.sub && <span className="block font-normal text-faint">{c.sub}</span>}
                    </span>
                    <span aria-hidden="true" className="w-3">
                      {on ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ordered.map((r) => (
            <tr key={r.key} className={r.className}>
              {r.cells.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="font-normal">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className={`tabular-nums ${columns[i].className ?? ""}`}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
