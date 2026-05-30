const REFS = [
  {
    label: "ICES Stomach Content Database",
    cite:  "ICES, Copenhagen, Denmark. Accessed 2026-05-30.",
    url:   "https://stomachdata.ices.dk",
    tag:   "Data source",
    color: "text-baltic-seafoam",
  },
  {
    label: "sdmTMB: Anderson et al. (2025)",
    cite:  "Journal of Statistical Software 115(2). doi:10.18637/jss.v115.i02",
    url:   "https://doi.org/10.18637/jss.v115.i02",
    tag:   "Method",
    color: "text-baltic-amber",
  },
  {
    label: "Lindmark et al. (2025) — Weak effects of local prey density",
    cite:  "bioRxiv 2025.03.27.645454",
    url:   "https://doi.org/10.1101/2025.03.27.645454",
    tag:   "Related work",
    color: "text-baltic-cyan",
  },
  {
    label: "ICES BITS Survey",
    cite:  "Baltic International Trawl Survey. DATRAS, ICES.",
    url:   "https://datras.ices.dk",
    tag:   "Survey",
    color: "text-baltic-seafoam",
  },
];

export default function ReferencesSection() {
  return (
    <section id="refs" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-baltic-sand">References</h2>
        <div className="space-y-3">
          {REFS.map((ref, i) => (
            <a
              key={i}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-xl border border-baltic-mid
                         bg-baltic-navy/50 hover:bg-baltic-navy/80 transition-colors group"
            >
              <span
                className={`text-xs font-mono px-2 py-1 rounded-full bg-baltic-navy
                             border border-baltic-mid mt-0.5 shrink-0 ${ref.color}`}
              >
                {ref.tag}
              </span>
              <div>
                <p className="font-medium text-baltic-sand group-hover:text-baltic-cyan transition-colors">
                  {ref.label}
                </p>
                <p className="text-sm text-baltic-sand/60 mt-0.5">{ref.cite}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-10 p-5 rounded-xl border border-baltic-mid bg-baltic-navy/50">
          <p className="text-xs text-baltic-sand/40 uppercase tracking-widest mb-3">
            Cite this analysis
          </p>
          <p className="font-mono text-sm text-baltic-sand/60 leading-relaxed">
            Peñuelas Sánchez, A. (2026). Baltic cod predation on sprat and herring —
            sdmTMB analysis (v1.0). GitHub.{" "}
            <a
              href="https://github.com/alvaropenuelas/baltic-cod-predation-sdmtmb"
              className="text-baltic-cyan hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/alvaropenuelas/baltic-cod-predation-sdmtmb
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
