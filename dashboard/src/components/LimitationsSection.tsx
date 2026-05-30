const LIMITATIONS = [
  {
    title: "Cross-sectional design",
    text: "Stomach contents are snapshots, not continuous feeding records. A single survey haul captures the prey consumed in the last few hours, not daily ration. No gastric evacuation correction is applied — results represent a stomach-content index, not consumption rate.",
  },
  {
    title: "Body condition is a correlate, not a driver",
    text: "Fulton's K is partly a consequence of feeding history, not only its cause. The positive association between condition and sprat occurrence cannot exclude reverse causation. The direction of inference is stated as correlational throughout.",
  },
  {
    title: "Country and survey-design effects",
    text: "The large Latvia fixed effect (β = +3.08 logit units) may partly reflect spatial rather than methodological differences — LV historically sampled eastern subdivisions (SD 26–28) where sprat concentrations differ. It cannot be disentangled from a pure protocol effect with this dataset.",
  },
  {
    title: "SE 2022–2025 exclusion",
    text: "Sweden's BITS/BIAS data from 2022–2025 show near-zero sprat occurrence (0.8%) even in rectangles where DK recorded 18% in the same period. This is classified as a sampling design shift and excluded from spatial models. It precludes analysis of the most recent period.",
  },
  {
    title: "Temporal coverage gaps",
    text: "Years 2015, 2019, and 2020 are absent from the dataset. The analysis covers five discrete years within 2014–2021, not a continuous time series. Spatiotemporal random fields are not fitted.",
  },
  {
    title: "Prediction grid resolution",
    text: "Predictions are made at 28 ICES rectangle centroids (~55 × 55 km cells). Fine-scale spatial structure within rectangles is not resolved.",
  },
];

export default function LimitationsSection() {
  return (
    <section id="limits" className="py-24 px-6 border-t border-baltic-mid">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-baltic-sand">Limitations</h2>
        <p className="text-baltic-sand/70 mb-8 max-w-2xl">
          These constraints are inherent to the data and design. They do not invalidate
          the analysis but define the scope of inference.
        </p>
        <div className="space-y-4">
          {LIMITATIONS.map((lim, i) => (
            <details
              key={i}
              className="group rounded-xl border border-baltic-mid bg-baltic-navy/50 overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4
                                   cursor-pointer list-none hover:bg-baltic-navy/80
                                   transition-colors">
                <span className="font-medium text-baltic-sand">{lim.title}</span>
                <span className="text-baltic-sand/40 transition-transform duration-200
                                  group-open:rotate-180 text-lg leading-none">
                  ▾
                </span>
              </summary>
              <p className="px-5 pb-4 text-baltic-sand/70 text-sm leading-relaxed">
                {lim.text}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
