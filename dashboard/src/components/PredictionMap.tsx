import { useEffect, useRef, useState } from "react";
import { geoMercator, geoPath, geoGraticule } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";

interface PredRow {
  ices_rect: string;
  lon: number;
  lat: number;
  p_sprat: number;
  exp_wgt_sprat: number;
  p_herring: number;
}

type MapMode = "p_sprat" | "exp_wgt_sprat" | "p_herring";

const MODES: { key: MapMode; label: string; unit: string; color: string }[] = [
  { key: "p_sprat",       label: "P(sprat in stomach)",    unit: "probability", color: "#4ecdc4" },
  { key: "exp_wgt_sprat", label: "Expected sprat weight",  unit: "grams",       color: "#f4a261" },
  { key: "p_herring",     label: "P(herring in stomach)",  unit: "probability", color: "#2ab4d0" },
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function interpolateRgb(colorA: string, colorB: string) {
  return (t: number) => {
    const a = hexToRgb(colorA), b = hexToRgb(colorB);
    const r  = Math.round(a.r + (b.r - a.r) * t);
    const g  = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bl})`;
  };
}

function makeColorScale(maxVal: number, accentColor: string, lowColor: string) {
  return scaleSequential()
    .domain([0, maxVal])
    .interpolator(interpolateRgb(lowColor, accentColor));
}

interface ThemeColors { sea: string; land: string; grat: string; }

function useThemeColors(): ThemeColors {
  const [tc, setTc] = useState<ThemeColors>({ sea: '#0f2232', land: '#1a3447', grat: '#1d3a52' });
  useEffect(() => {
    const read = () => {
      const isLight = document.documentElement.classList.contains('light');
      setTc(isLight
        ? { sea: '#98b4ba', land: '#c9c0a3', grat: '#7a8068' }
        : { sea: '#0a1622', land: '#3a5468', grat: '#4a6478' }
      );
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return tc;
}

const WIDTH = 700, HEIGHT = 560;

const projection = geoMercator()
  .center([16.5, 57.0])
  .scale(3000)
  .translate([WIDTH / 2, HEIGHT / 2]);
const pathGen = geoPath().projection(projection);

// NW corner → screen top-left; SE corner → screen bottom-right (Mercator y-flip)
function projectedRect(lon: number, lat: number) {
  const inset = 0.03;
  const tl = projection([lon - 0.5 + inset, lat + 0.25 - inset])!;
  const br = projection([lon + 0.5 - inset, lat - 0.25 + inset])!;
  return { x: tl[0], y: tl[1], width: br[0] - tl[0], height: br[1] - tl[1] };
}

export default function PredictionMap() {
  const [preds, setPreds]       = useState<PredRow[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [land, setLand]         = useState<any>(null);
  const [mode, setMode]         = useState<MapMode>("p_sprat");
  const [hovered, setHovered]   = useState<PredRow | null>(null);
  const svgRef                  = useRef<SVGSVGElement>(null);
  const themeColors             = useThemeColors();

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/predictions.json`).then(r => r.json()),
      fetch(`${base}data/baltic_land.json`).then(r => r.json()),
    ]).then(([pData, lData]) => {
      setPreds(pData);
      setLand(lData);
    });
  }, []);

  const activeMeta = MODES.find(m => m.key === mode)!;
  const values     = preds.map(p => p[mode] as number);
  const maxVal     = Math.max(...values, 0.001);
  const colorScale = makeColorScale(maxVal, activeMeta.color, themeColors.sea);

  return (
    <section id="map" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-baltic-sand">Spatial Predictions</h2>
        <p className="text-baltic-sand/70 mb-8 max-w-2xl">
          Predicted predation intensity across ICES rectangles of the southern Baltic.
          Conditioned on: DK survey, 2021, 35 cm cod, median Fulton's K (0.894).
        </p>

        {/* Mode toggle */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === m.key
                  ? "border-transparent text-baltic-deep"
                  : "border-baltic-mid text-baltic-sand/70 hover:text-baltic-sand hover:border-baltic-teal"
              }`}
              style={mode === m.key ? { background: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Map */}
          <div className="relative rounded-2xl border border-baltic-mid overflow-hidden">
            <svg
              ref={svgRef}
              width={WIDTH}
              height={HEIGHT}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              style={{ maxWidth: "100%", height: "auto" }}
            >
              <defs>
                <filter id="rect-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Sea background */}
              <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={themeColors.sea} />

              {/* Graticule */}
              <path
                d={pathGen(geoGraticule().step([5, 5])()) ?? ""}
                fill="none"
                stroke={themeColors.grat}
                strokeWidth={0.5}
              />

              {/* Land polygons */}
              {land && (
                <path
                  d={pathGen(land) ?? ""}
                  fill={themeColors.land}
                  stroke={themeColors.grat}
                  strokeWidth={1.8}
                />
              )}

              {/* Prediction rectangles */}
              <AnimatePresence mode="wait">
                {preds.map(row => {
                  const val    = row[mode] as number;
                  const color  = colorScale(val);
                  const r      = projectedRect(row.lon, row.lat);
                  const isHov  = hovered?.ices_rect === row.ices_rect;
                  return (
                    <motion.rect
                      key={`${row.ices_rect}-${mode}`}
                      x={r.x} y={r.y} width={r.width} height={r.height}
                      rx={3} ry={3}
                      fill={color}
                      stroke={isHov ? "#a8c8d6" : themeColors.grat}
                      strokeWidth={isHov ? 1.5 : 0.4}
                      style={{ cursor: "pointer", filter: isHov ? "url(#rect-glow)" : undefined }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: isHov ? 1 : 0.82, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      onMouseEnter={() => setHovered(row)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Tooltip */}
            {hovered && (
              <div className="absolute top-4 right-4 bg-baltic-deep/95 border border-baltic-mid
                              rounded-xl p-4 text-sm pointer-events-none min-w-[180px]">
                <p className="font-mono text-baltic-cyan text-xs mb-2">{hovered.ices_rect}</p>
                <p className="text-baltic-sand/60 text-xs mb-2">
                  {hovered.lat.toFixed(2)}°N · {hovered.lon.toFixed(2)}°E
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-baltic-sand/50">P(sprat)</span>
                    <span className="text-baltic-seafoam font-mono">
                      {(hovered.p_sprat * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-baltic-sand/50">Exp. weight</span>
                    <span className="text-baltic-amber font-mono">
                      {hovered.exp_wgt_sprat.toFixed(2)} g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-baltic-sand/50">P(herring)</span>
                    <span className="text-baltic-cyan font-mono">
                      {(hovered.p_herring * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 min-w-[160px]">
            <p className="text-xs text-baltic-sand/40 uppercase tracking-widest">
              {activeMeta.unit}
            </p>
            <div
              className="w-8 h-48 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${activeMeta.color}, ${themeColors.sea})`,
              }}
            />
            <p className="text-xs text-baltic-sand/60 font-mono">{maxVal.toFixed(2)} max</p>
            <p className="text-xs text-baltic-sand/60 font-mono">0.00 min</p>
            <p className="text-xs text-baltic-sand/40 mt-4 leading-relaxed">
              Each cell = one ICES rectangle (~55 × 55 km).
            </p>
          </div>
        </div>

        <p className="text-xs text-baltic-sand/40 mt-6 max-w-xl">
          Predictions conditioned on DK survey protocol and 2021 year effect.
          SE 2022–2025 data excluded (sampling design shift).
        </p>
      </div>
    </section>
  );
}
