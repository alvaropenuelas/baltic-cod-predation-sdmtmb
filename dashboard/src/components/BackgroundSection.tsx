import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function BackgroundSection() {
  return (
    <section
      id="background"
      className="py-24 px-6 border-t border-baltic-mid"
    >
      <div className="max-w-3xl mx-auto space-y-10">
        <FadeIn>
          <h2 className="text-4xl font-bold mb-4 text-baltic-sand">Background</h2>
          <p className="text-baltic-sand/70 text-lg leading-relaxed">
            The Baltic Sea cod–clupeid system is one of the most studied trophic
            interactions in fisheries science. Atlantic cod (<em>Gadus morhua</em>) is
            the apex predator of the Baltic, feeding primarily on sprat{" "}
            (<em>Sprattus sprattus</em>) and herring (<em>Clupea harengus</em>).
            Following the cod stock collapse of the early 1990s, sprat biomass expanded
            dramatically, creating a feedback loop that has shaped Baltic ecology ever since.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-baltic-sand/70 text-lg leading-relaxed">
            Understanding where, when, and by which cod this predation occurs is essential
            for multispecies management. This analysis uses a stomach-content index
            approach — prey wet weight in the cod stomach — as a direct record of
            individual predation events across the southern Baltic (ICES Subdivisions 22–28).
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Focal predator", value: "Atlantic cod",  sub: "Gadus morhua" },
              { label: "Primary prey",   value: "Sprat",         sub: "Sprattus sprattus" },
              { label: "Secondary prey", value: "Herring",       sub: "Clupea harengus" },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl border border-baltic-mid bg-baltic-navy/50 p-5"
              >
                <p className="text-xs text-baltic-sand/40 uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <p className="text-xl font-semibold text-baltic-sand">{item.value}</p>
                <p className="text-sm text-baltic-sand/60 italic">{item.sub}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
