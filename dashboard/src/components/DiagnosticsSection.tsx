import { useEffect, useState } from "react";

interface Par { estimate: number; conf_low: number; conf_high: number; }
interface Diag {
  range_km: Par;
  sigma_O: Par;
  max_grad: number;
  converged: boolean;
  n_obs: number;
  n_knots: number;
  zero_inf_ratio: number;
  zero_inf_p: number;
  dispersion_stat: number;
  dispersion_p: number;
}

function StatCard({ label, value, ci, unit, status }: {
  label: string;
  value: string;
  ci?: string;
  unit?: string;
  status?: "ok" | "warn" | "info";
}) {
  const statusColor = status === "ok"   ? "text-accent-kelp"
                    : status === "warn" ? "text-accent-rust"
                    :                     "text-accent-heading";
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs text-text-muted uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`font-display text-3xl font-semibold tabular-nums ${statusColor}`}>
        {value}
        {unit && <span className="text-base text-text-secondary ml-1">{unit}</span>}
      </p>
      {ci && <p className="text-xs text-text-muted mt-1 font-mono">{ci}</p>}
    </div>
  );
}

export default function DiagnosticsSection() {
  const [d, setD] = useState<Diag | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/diagnostics.json`)
      .then(r => r.json())
      .then(setD);
  }, []);

  const base = import.meta.env.BASE_URL;

  return (
    <section id="diagnostics" className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-accent-heading mb-2">
          Model Diagnostics
        </h2>
        <p className="text-text-secondary mb-10 max-w-2xl">
          M4 convergence, spatial parameter estimates, and residual diagnostics.
          A model worth interpreting passes these checks first.
        </p>

        {d && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Convergence"
              value={d.converged ? "OK" : "FAIL"}
              status={d.converged ? "ok" : "warn"}
            />
            <StatCard
              label="Max gradient"
              value={d.max_grad.toExponential(1)}
              status={d.max_grad < 1e-3 ? "ok" : "warn"}
            />
            <StatCard
              label="Spatial range"
              value={d.range_km.estimate.toFixed(1)}
              ci={`95% CI: ${d.range_km.conf_low.toFixed(1)}–${d.range_km.conf_high.toFixed(1)}`}
              unit="km"
              status="info"
            />
            <StatCard
              label="Spatial σ"
              value={d.sigma_O.estimate.toFixed(2)}
              ci={`95% CI: ${d.sigma_O.conf_low.toFixed(2)}–${d.sigma_O.conf_high.toFixed(2)}`}
              status="info"
            />
            <StatCard
              label="Dispersion"
              value={d.dispersion_stat.toFixed(2)}
              ci={`p = ${d.dispersion_p}`}
              status={d.dispersion_p > 0.01 ? "ok" : "warn"}
            />
            <StatCard
              label="Zero-inflation ratio"
              value={d.zero_inf_ratio.toFixed(2)}
              ci={`p = ${d.zero_inf_p}`}
              status={d.zero_inf_ratio < 1.3 ? "ok" : "warn"}
            />
            <StatCard
              label="Observations"
              value={d.n_obs.toLocaleString()}
              status="info"
            />
            <StatCard
              label="Mesh knots"
              value={d.n_knots.toString()}
              status="info"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <figure className="rounded-2xl border border-border bg-surface p-4">
            <img
              src={`${base}figures/mesh.png`}
              alt="sdmTMB mesh structure"
              className="w-full rounded-lg"
            />
            <figcaption className="text-xs text-text-muted mt-3">
              Triangulated mesh used for the spatial random field (cutoff = 25 km).
              Knots concentrate where sampling is dense.
            </figcaption>
          </figure>
          <figure className="rounded-2xl border border-border bg-surface p-4">
            <img
              src={`${base}figures/dharma.png`}
              alt="DHARMa residual diagnostics"
              className="w-full rounded-lg"
            />
            <figcaption className="text-xs text-text-muted mt-3">
              Simulation-based residuals (DHARMa). Left: QQ uniformity check.
              Right: residuals vs. predator length.
            </figcaption>
          </figure>
        </div>

        <p className="text-xs text-text-muted max-w-prose">
          Notes on interpretation: convergence code 0 and max gradient &lt; 1e-3
          indicate the optimiser found a stable solution. The spatial range estimate
          gives the distance at which spatial correlation in P(sprat) decays to
          ~10%. Zero-inflation ratio &gt; 1 means the model under-predicts zeros —
          the residual excess after country/year fixed effects reflects unmodelled
          haul-level clustering.
        </p>
      </div>
    </section>
  );
}
