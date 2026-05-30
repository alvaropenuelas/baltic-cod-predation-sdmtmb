import { useEffect, useState } from "react";

interface AICRow {
  model: string;
  formula: string;
  n: number;
  aic: number;
  delta_aic: number;
  note: string;
}

export default function ModelComparison() {
  const [data, setData] = useState<AICRow[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/aic_table.json`)
      .then(r => r.json())
      .then(setData);
  }, []);

  return (
    <section id="models" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-baltic-sand">Model Selection</h2>
        <p className="text-baltic-sand/70 mb-8">
          Delta-gamma sdmTMB models compared by AIC. M4 (spatial random field +
          predator size + country/year + body condition) is the selected model.
        </p>
        <div className="rounded-2xl border border-baltic-mid overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-baltic-mid bg-baltic-navy/80">
                {["Model", "n", "AIC", "ΔAIC"].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-baltic-sand/40
                               uppercase tracking-widest font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-baltic-mid last:border-0 ${
                    row.delta_aic === 0 ? "bg-baltic-navy/50" : ""
                  }`}
                >
                  <td
                    className={`px-4 py-3 ${
                      row.delta_aic === 0
                        ? "text-baltic-seafoam font-medium"
                        : "text-baltic-sand/60"
                    }`}
                  >
                    {row.model}
                    {row.delta_aic === 0 && (
                      <span className="ml-2 text-xs bg-baltic-seafoam/20 text-baltic-seafoam
                                       px-2 py-0.5 rounded-full">
                        selected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-baltic-sand/60">
                    {row.n.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-baltic-sand/60">
                    {row.aic.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span
                      className={
                        row.delta_aic === 0
                          ? "text-baltic-seafoam font-semibold"
                          : "text-baltic-coral"
                      }
                    >
                      {row.delta_aic === 0 ? "—" : `+${row.delta_aic}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-baltic-sand/40 mt-3">
          M2 vs M3 comparable (same n=4,040). M3k vs M4 comparable (same n=3,451).
          Cross-n comparisons invalid.
        </p>
      </div>
    </section>
  );
}
