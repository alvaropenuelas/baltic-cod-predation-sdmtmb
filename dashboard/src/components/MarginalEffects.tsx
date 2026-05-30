import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { colors } from "../theme";

interface LenRow { length_cm: number; p_sprat: number; exp_wgt: number; }
interface KRow   { fulton_k:  number; p_sprat: number; exp_wgt: number; }

export default function MarginalEffects() {
  const [lenData, setLenData] = useState<LenRow[]>([]);
  const [kData,   setKData]   = useState<KRow[]>([]);
  const [length,  setLength]  = useState(35);
  const [kVal,    setKVal]    = useState(0.894);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    fetch(`${base}data/marginal_length.json`).then(r => r.json()).then(setLenData);
    fetch(`${base}data/marginal_k.json`).then(r => r.json()).then(setKData);
  }, []);

  const lenRow = lenData.find(d => d.length_cm === length)
               ?? lenData.find(d => d.length_cm === Math.round(length));
  const kRow   = kData.length > 0
    ? kData.reduce((best, cur) =>
        Math.abs(cur.fulton_k - kVal) < Math.abs(best.fulton_k - kVal) ? cur : best
      )
    : null;

  return (
    <section id="marginal" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-baltic-sand">Covariate Effects</h2>
        <p className="text-baltic-sand/70 mb-10 max-w-2xl">
          Marginal fixed-effect predictions from M4. Spatial random field excluded —
          these curves reflect population-level relationships only.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Length panel */}
          <div className="rounded-2xl border border-baltic-mid bg-baltic-navy/50 p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-baltic-sand">Predator length</h3>
                <p className="text-sm text-baltic-sand/60 mt-1">
                  Unimodal effect — peaks mid-size
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-baltic-seafoam">
                {length} cm
              </span>
            </div>

            <input
              type="range" min={5} max={80} step={1}
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: colors.seafoam }}
            />

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lenData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis
                  dataKey="length_cm"
                  stroke={colors.textMuted}
                  tick={{ fontSize: 11, fill: colors.textSecondary }}
                  label={{ value: "Length (cm)", position: "insideBottom", offset: -10,
                           fill: colors.textSecondary, fontSize: 11 }}
                />
                <YAxis
                  stroke={colors.textMuted}
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: colors.textSecondary }}
                  label={{ value: "P(sprat)", angle: -90, position: "insideLeft",
                           fill: colors.textSecondary, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8, fontSize: 12,
                  }}
                  labelStyle={{ color: colors.textPrimary }}
                  formatter={(val) => [Number(val).toFixed(3), "P(sprat)"]}
                />
                <Line
                  type="monotone" dataKey="p_sprat"
                  stroke={colors.sprat} dot={false} strokeWidth={2}
                />
                {lenRow && (
                  <ReferenceDot
                    x={lenRow.length_cm} y={lenRow.p_sprat}
                    r={6} fill={colors.sprat} stroke={colors.bg} strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            {lenRow && (
              <p className="text-sm text-center text-baltic-sand/60">
                At {length} cm: P(sprat) ={" "}
                <span className="text-baltic-seafoam font-mono font-semibold">
                  {(lenRow.p_sprat * 100).toFixed(1)}%
                </span>
                {" · "}E[weight] ={" "}
                <span className="text-baltic-seafoam font-mono font-semibold">
                  {lenRow.exp_wgt.toFixed(2)} g
                </span>
              </p>
            )}
          </div>

          {/* Fulton K panel */}
          <div className="rounded-2xl border border-baltic-mid bg-baltic-navy/50 p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-baltic-sand">Body condition (K)</h3>
                <p className="text-sm text-baltic-sand/60 mt-1">
                  Positive — better-condition cod eat more sprat
                </p>
              </div>
              <span className="font-mono text-2xl font-bold text-baltic-amber">
                {kVal.toFixed(2)}
              </span>
            </div>

            <input
              type="range" min={0.3} max={2.0} step={0.05}
              value={kVal}
              onChange={e => setKVal(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: colors.amber }}
            />

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={kData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis
                  dataKey="fulton_k"
                  stroke={colors.textMuted}
                  tick={{ fontSize: 11, fill: colors.textSecondary }}
                  label={{ value: "Fulton's K", position: "insideBottom", offset: -10,
                           fill: colors.textSecondary, fontSize: 11 }}
                />
                <YAxis
                  stroke={colors.textMuted}
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: colors.textSecondary }}
                  label={{ value: "P(sprat)", angle: -90, position: "insideLeft",
                           fill: colors.textSecondary, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8, fontSize: 12,
                  }}
                  formatter={(val) => [Number(val).toFixed(3), "P(sprat)"]}
                />
                <Line
                  type="monotone" dataKey="p_sprat"
                  stroke={colors.herring} dot={false} strokeWidth={2}
                />
                {kRow && (
                  <ReferenceDot
                    x={kRow.fulton_k} y={kRow.p_sprat}
                    r={6} fill={colors.herring} stroke={colors.bg} strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            {kRow && (
              <p className="text-sm text-center text-baltic-sand/60">
                At K = {kVal.toFixed(2)}: P(sprat) ={" "}
                <span className="text-baltic-amber font-mono font-semibold">
                  {(kRow.p_sprat * 100).toFixed(1)}%
                </span>
                {" · "}Note: condition is a correlate, not a causal driver.
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-baltic-sand/40 mt-8 max-w-xl">
          Predictions at: DK survey, 2021, opposing slider at median value.
          95% CIs not shown — curves reflect fixed-effect point estimates only.
        </p>
      </div>
    </section>
  );
}
