import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { colors } from "../theme";

interface YearRow {
  year: number;
  estimate: number;
  conf_low: number;
  conf_high: number;
}

interface ChartRow extends YearRow {
  errorBar: [number, number];
}

export default function YearEffectsSection() {
  const [data, setData] = useState<YearRow[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/year_effects.json`)
      .then(r => r.json())
      .then(setData);
  }, []);

  const chartData: ChartRow[] = data.map(d => ({
    ...d,
    errorBar: [d.estimate - d.conf_low, d.conf_high - d.estimate],
  }));

  return (
    <section id="year" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-baltic-sand">Temporal Variation</h2>
        <p className="text-baltic-sand/70 mb-8">
          Year fixed effects on P(sprat in stomach) — logit scale, relative to 2014
          (reference). All sampled years significantly elevated above baseline.
        </p>
        <div className="rounded-2xl border border-baltic-mid bg-baltic-navy/50 p-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border}
                vertical={false}
              />
              <XAxis
                dataKey="year"
                stroke={colors.textMuted}
                tick={{ fontSize: 12, fill: colors.textSecondary }}
              />
              <YAxis
                stroke={colors.textMuted}
                tick={{ fontSize: 12, fill: colors.textSecondary }}
                label={{
                  value: "Log-odds vs 2014",
                  angle: -90,
                  position: "insideLeft",
                  fill: colors.textSecondary,
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                y={0}
                stroke={colors.textMuted}
                strokeDasharray="4 4"
              />
              <Tooltip
                cursor={{ fill: 'rgba(168, 200, 214, 0.06)', strokeWidth: 0 }}
                contentStyle={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val, _name, props) => {
                  const p = props.payload as ChartRow;
                  return [
                    `${Number(val).toFixed(2)} [${p.conf_low.toFixed(2)}, ${p.conf_high.toFixed(2)}]`,
                    "Log-odds (95% CI)",
                  ];
                }}
              />
              <Bar dataKey="estimate" radius={[6, 6, 0, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.year}
                    fill={entry.estimate > 0 ? colors.sprat : colors.rust}
                  />
                ))}
                <ErrorBar
                  dataKey="errorBar"
                  width={4}
                  strokeWidth={2}
                  stroke={colors.textSecondary}
                  direction="y"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-baltic-sand/40 mt-4">
          2022–2025 excluded (SE sampling design shift). Missing years: 2015, 2019, 2020.
        </p>
      </div>
    </section>
  );
}
