# 06_model_m2.R
# M2: delta_gamma, linear length, spatial[on,off] — fix M1 over-parameterisation.
# M3: tweedie fallback if M2 Hessian still non-pos-def.

library(tidyverse)
library(sdmTMB)
library(here)

dat_fit <- readRDS(here("data", "processed", "analysis_dat_utm.rds")) |>
  filter(is.na(fulton_k) | (fulton_k > 0.3 & fulton_k < 3.0))

mesh <- readRDS(here("data", "processed", "mesh_cutoff25.rds"))

message("n rows: ", nrow(dat_fit),
        " | sprat positives: ", sum(dat_fit$sprat_pa),
        " (", round(100 * mean(dat_fit$sprat_pa), 1), "%)")

# ============================================================
# M2: delta_gamma — linear length, hurdle-2 spatial disabled
# ============================================================
message("\n=== Fitting M2 ===")
m2 <- sdmTMB(
  formula        = sprat_wgt ~ length_cm,
  data           = dat_fit,
  mesh           = mesh,
  family         = delta_gamma(),
  spatial        = list("on", "off"),   # hurdle-1 spatial on, hurdle-2 off
  spatiotemporal = "off",
  control        = sdmTMBcontrol(newton_loops = 1)
)

message("\n=== M2 convergence ===")
message("Convergence code: ", m2$model$convergence)
message("Max gradient:     ", round(max(abs(m2$gradients)), 8))

sanity_out <- capture.output(sanity(m2))
cat(paste(sanity_out, collapse = "\n"), "\n")

# Extra optimisation if gradient > 0.001
if (max(abs(m2$gradients)) > 0.001) {
  message("Gradient too high — running extra Newton loops...")
  m2 <- run_extra_optimization(m2, newton_loops = 3)
  message("After extra opt — Max gradient: ", round(max(abs(m2$gradients)), 8))
  cat(paste(capture.output(sanity(m2)), collapse = "\n"), "\n")
}

print(m2)

message("\n=== Fixed effects ===")
print(tidy(m2, effects = "fixed",   conf.int = TRUE), n = 20)
message("\n=== Random parameters ===")
print(tidy(m2, effects = "ran_pars", conf.int = TRUE), n = 20)

# ============================================================
# DHARMa — fixed predict pipeline for delta models
# ============================================================
run_dharma <- function(model, dat, label, outfile) {
  library(DHARMa)
  set.seed(42)
  sim_res <- simulate(model, nsim = 200, type = "mle-mvn")
  # predict(type="response") combines both hurdle parts onto response scale
  pred_vals <- predict(model, type = "response")$est
  dharma_res <- DHARMa::createDHARMa(
    simulatedResponse       = sim_res,
    observedResponse        = dat$sprat_wgt,
    fittedPredictedResponse = pred_vals
  )
  png(here("output", "figures", outfile), width = 900, height = 450)
  par(mfrow = c(1, 2))
  plotQQunif(dharma_res,   main = paste(label, "QQ"))
  plotResiduals(dharma_res, form = dat$length_cm,
                main = paste(label, "residuals vs length"))
  dev.off()
  message("Saved: output/figures/", outfile)
  message("\n=== DHARMa tests: ", label, " ===")
  print(testUniformity(dharma_res))
  print(testDispersion(dharma_res))
  print(testZeroInflation(dharma_res))
}

m2_ok <- m2$model$convergence == 0 && max(abs(m2$gradients)) < 0.01

if (m2_ok) {
  message("\n--- DHARMa: M2 ---")
  run_dharma(m2, dat_fit, "M2", "m2_dharma_residuals.png")
}

# ============================================================
# M3: Tweedie fallback (if M2 not clean)
# ============================================================
m3 <- NULL
if (!m2_ok) {
  message("\nM2 not clean — fitting M3 (tweedie)...")
  m3 <- sdmTMB(
    formula        = sprat_wgt ~ length_cm,
    data           = dat_fit,
    mesh           = mesh,
    family         = tweedie(link = "log"),
    spatial        = "on",
    spatiotemporal = "off",
    control        = sdmTMBcontrol(newton_loops = 1)
  )
  message("\n=== M3 convergence ===")
  message("Convergence code: ", m3$model$convergence)
  message("Max gradient:     ", round(max(abs(m3$gradients)), 8))
  cat(paste(capture.output(sanity(m3)), collapse = "\n"), "\n")

  if (max(abs(m3$gradients)) > 0.001) {
    m3 <- run_extra_optimization(m3, newton_loops = 3)
    message("After extra opt — Max gradient: ", round(max(abs(m3$gradients)), 8))
  }

  print(m3)
  message("\n=== M3 fixed effects ===")
  print(tidy(m3, effects = "fixed",   conf.int = TRUE), n = 20)
  message("\n=== M3 random parameters ===")
  print(tidy(m3, effects = "ran_pars", conf.int = TRUE), n = 20)

  message("\n--- DHARMa: M3 ---")
  run_dharma(m3, dat_fit, "M3", "m3_dharma_residuals.png")

} else {
  message("\nM2 converged cleanly — M3 not needed.")
}

# ============================================================
# Save
# ============================================================
saveRDS(m2, here("data", "processed", "m2_delta_linear.rds"))
if (!is.null(m3)) saveRDS(m3, here("data", "processed", "m3_tweedie.rds"))
message("\nSaved: m2", if (!is.null(m3)) " + m3" else "", " (RDS)")
