import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface HeroStats {
  n_stomachs: number;
  n_hauls: number;
  pct_sprat: number;
  spatial_range_km: number;
  year_min: number;
  year_max: number;
}

interface CounterProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

function Counter({ label, value, suffix = "", decimals = 0 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.8,
      ease: "power2.out",
      delay: 0.3,
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = obj.val.toFixed(decimals) + suffix;
        }
      },
    });
  }, [value, suffix, decimals]);
  return (
    <div className="flex flex-col gap-1">
      <span
        ref={ref}
        className="font-mono text-4xl md:text-5xl font-bold text-baltic-cyan tabular-nums"
      >
        0{suffix}
      </span>
      <span className="text-sm text-baltic-sand/60 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export default function Hero() {
  const [stats, setStats] = useState<HeroStats | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/hero_stats.json`)
      .then(r => r.json())
      .then(setStats);
  }, []);

  useGSAP(
    () => {
      gsap.from(".hero-text > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    },
    { scope: container }
  );

  return (
    <section
      id="hero"
      ref={container}
      className="min-h-screen flex flex-col justify-center items-center text-center
                 px-6 py-32 relative overflow-hidden"
    >
      {/* Radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(42,180,208,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="hero-text relative z-10 max-w-3xl">
        <p className="text-baltic-cyan text-sm uppercase tracking-widest mb-4 font-mono">
          Baltic Sea · 2014–2021 · sdmTMB
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-baltic-sand">
          Cod Predation on{" "}
          <span className="text-baltic-cyan">Sprat</span>{" "}
          &amp;{" "}
          <span className="text-baltic-amber">Herring</span>
        </h1>
        <p className="text-baltic-sand/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          A delta-gamma spatial model of predation intensity using{" "}
          {stats ? stats.n_stomachs.toLocaleString() : "4,040"} Atlantic cod stomach
          samples from ICES BITS/BIAS surveys across the Baltic Sea.
        </p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12
                          p-8 rounded-2xl border border-baltic-mid bg-baltic-navy/60 backdrop-blur-sm">
            <Counter label="Cod stomachs" value={stats.n_stomachs} />
            <Counter
              label="Contained sprat"
              value={stats.pct_sprat}
              suffix="%"
              decimals={1}
            />
            <Counter label="Spatial range" value={stats.spatial_range_km} suffix=" km" />
            <Counter
              label={`${stats.year_min}–${stats.year_max} hauls`}
              value={stats.n_hauls}
            />
          </div>
        )}

        <div className="mt-12 text-baltic-sand/40 text-xs">
          Data: ICES Stomach Content Database (CC-BY 4.0) ·
          Method: sdmTMB Anderson et al. (2025)
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce
                      text-baltic-sand/40 text-xs flex flex-col items-center gap-2">
        <span>scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 10.5 L2 4.5 L3.4 3.1 L8 7.7 L12.6 3.1 L14 4.5Z" />
        </svg>
      </div>
    </section>
  );
}
