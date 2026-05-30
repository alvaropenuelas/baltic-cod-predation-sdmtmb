import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./components/Hero";
import BackgroundSection from "./components/BackgroundSection";
import PredictionMap from "./components/PredictionMap";
import MarginalEffects from "./components/MarginalEffects";
import YearEffectsSection from "./components/YearEffectsSection";
import ModelComparison from "./components/ModelComparison";
import LimitationsSection from "./components/LimitationsSection";
import ReferencesSection from "./components/ReferencesSection";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { href: "#hero",       label: "Overview"    },
  { href: "#background", label: "Background"  },
  { href: "#map",        label: "Map"         },
  { href: "#marginal",   label: "Effects"     },
  { href: "#year",       label: "Year"        },
  { href: "#models",     label: "Models"      },
  { href: "#limits",     label: "Limitations" },
  { href: "#refs",       label: "References"  },
];

export default function App() {
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
    <div className="min-h-screen bg-baltic-deep text-baltic-sand">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-baltic-deep/80 backdrop-blur-md
                      border-b border-baltic-mid">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-base font-semibold text-baltic-sand tracking-tight">
            Baltic Cod · sdmTMB
          </span>
          <div className="hidden md:flex gap-5 text-sm text-baltic-sand/60">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-baltic-cyan transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://github.com/alvaropenuelas/baltic-cod-predation-sdmtmb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-baltic-cyan transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        <Hero />
        <div className="gsap-reveal"><BackgroundSection /></div>
        <div className="gsap-reveal"><PredictionMap /></div>
        <div className="gsap-reveal"><MarginalEffects /></div>
        <div className="gsap-reveal"><YearEffectsSection /></div>
        <div className="gsap-reveal"><ModelComparison /></div>
        <div className="gsap-reveal"><LimitationsSection /></div>
        <div className="gsap-reveal"><ReferencesSection /></div>
      </main>

      <footer className="border-t border-baltic-mid py-8 px-6 text-center
                         text-xs text-baltic-sand/40">
        Álvaro Peñuelas Sánchez ·
        ICES Stomach Content Database (CC-BY 4.0) ·
        sdmTMB Anderson et al. (2025)
      </footer>
    </div>
  );
}
