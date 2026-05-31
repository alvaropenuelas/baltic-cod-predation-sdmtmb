import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./components/Hero";
import BackgroundSection from "./components/BackgroundSection";
import PredictionMap from "./components/PredictionMap";
import DiagnosticsSection from "./components/DiagnosticsSection";
import MarginalEffects from "./components/MarginalEffects";
import YearEffectsSection from "./components/YearEffectsSection";
import ModelComparison from "./components/ModelComparison";
import LimitationsSection from "./components/LimitationsSection";
import ReferencesSection from "./components/ReferencesSection";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { href: "#hero",       label: "Overview"    },
  { href: "#background", label: "Background"  },
  { href: "#map",         label: "Map"         },
  { href: "#diagnostics", label: "Diagnostics" },
  { href: "#marginal",    label: "Effects"     },
  { href: "#year",       label: "Year"        },
  { href: "#models",     label: "Models"      },
  { href: "#limits",     label: "Limitations" },
  { href: "#refs",       label: "References"  },
];

export default function App() {
  const [isLight, setIsLight] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  useEffect(() => {
    gsap.utils.toArray<Element>(".gsap-reveal").forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/80 backdrop-blur-md
                      border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-base font-semibold tracking-tight">
            Baltic Cod · sdmTMB
          </span>
          <div className="hidden md:flex items-center gap-5 text-sm text-text-secondary">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-accent-kelp transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://github.com/alvaropenuelas/baltic-cod-predation-sdmtmb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-kelp transition-colors"
            >
              GitHub ↗
            </a>
            <button
              onClick={() => setIsLight(v => !v)}
              className="ml-2 p-2 rounded-lg border border-border hover:border-accent-kelp
                         text-text-secondary hover:text-accent-kelp transition-all"
              aria-label="Toggle light/dark mode"
            >
              {isLight ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                     viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"
                     viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <Hero />
        <div className="gsap-reveal"><BackgroundSection /></div>
        <div className="gsap-reveal"><PredictionMap /></div>
        <div className="gsap-reveal"><DiagnosticsSection /></div>
        <div className="gsap-reveal"><MarginalEffects /></div>
        <div className="gsap-reveal"><YearEffectsSection /></div>
        <div className="gsap-reveal"><ModelComparison /></div>
        <div className="gsap-reveal"><LimitationsSection /></div>
        <div className="gsap-reveal"><ReferencesSection /></div>
      </main>

      <footer className="border-t border-border py-8 px-6 text-center
                         text-xs text-text-muted">
        Álvaro Peñuelas Sánchez ·
        ICES Stomach Content Database (CC-BY 4.0) ·
        sdmTMB Anderson et al. (2025)
      </footer>
    </div>
  );
}
