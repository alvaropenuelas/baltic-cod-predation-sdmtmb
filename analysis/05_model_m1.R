# 05_model_m1.R
# Mesh construction + first sdmTMB spatial model (M1) for cod -> sprat.

library(tidyverse)
library(sdmTMB)
library(here)

# ============================================================
# Task 1 — UTM conversion
# ============================================================
analysis_dat <- readRDS(here("data", "processed", "analysis_dat.rds"))

dat <- analysis_dat |>
  add_utm_columns(
    ll_names = c("lon", "lat"),
    utm_crs  = 32633,
    units    = "km"
  )

message("=== UTM coordinate ranges (km) ===")
message("X (easting):  ", round(min(dat$X), 0), " - ", round(max(dat$X), 0), " km")
message("Y (northing): ", round(min(dat$Y), 0), " - ", round(max(dat$Y), 0), " km")

saveRDS(dat, here("data", "processed", "analysis_dat_utm.rds"))

# ============================================================
# Task 2 — Mesh
# ============================================================
dat_fit <- dat |>
  filter(is.na(fulton_k) | (fulton_k > 0.3 & fulton_k < 3.0))

message("\nRows after K filter: ", nrow(dat_fit),
        " (lost ", nrow(dat) - nrow(dat_fit), " rows)")

MESH_CUTOFF <- 25
mesh <- make_mesh(dat_fit, xy_cols = c("X", "Y"), cutoff = MESH_CUTOFF)

message("\n=== Mesh diagnostics (cutoff = ", MESH_CUTOFF, " km) ===")
message("Number of mesh knots: ", mesh$mesh$n)

dir.create(here("output", "figures"), recursive = TRUE, showWarnings = FALSE)
png(here("output", "figures", paste0("mesh_cutoff", MESH_CUTOFF, ".png")),
    width = 800, height = 700)
plot(mesh)
title(paste0("sdmTMB mesh - Baltic cod (cutoff = ", MESH_CUTOFF, " km)"))
dev.off()
message("Saved: output/figures/mesh_cutoff", MESH_CUTOFF, ".png")

# ============================================================
# Task 3 — M1: sprat_wgt ~ s(length_cm), spatial only
# ============================================================
message("\n=== Fitting M1 ===")
m1 <- sdmTMB(
  formula  = sprat_wgt ~ s(length_cm, k = 5),
  data     = dat_fit,
  mesh     = mesh,
  family   = delta_gamma(),
  spatial  = "on",
  spatiotemporal = "off",
  control  = sdmTMBcontrol(newton_loops = 1)
)

message("\n=== M1 convergence ===")
message("Convergence code: ", m1$model$convergence)
message("Max gradient: ", round(max(abs(m1$gradients)), 6))

print(m1)

message("\n=== Fixed effects ===")
print(tidy(m1, effects = "fixed", conf.int = TRUE), n = 20)
message("\n=== Random parameters ===")
print(tidy(m1, effects = "ran_pars", conf.int = TRUE), n = 20)

# ============================================================
# Task 4 — DHARMa residuals
# ============================================================
if (m1$model$convergence == 0) {
  library(DHARMa)
  set.seed(42)
  sim_res <- simulate(m1, nsim = 200, type = "mle-mvn")
  dharma_res <- DHARMa::createDHARMa(
    simulatedResponse       = sim_res,
    observedResponse        = dat_fit$sprat_wgt,
    fittedPredictedResponse = predict(m1)$est
  )

  png(here("output", "figures", "m1_dharma_residuals.png"),
      width = 900, height = 450)
  par(mfrow = c(1, 2))
  plotQQunif(dharma_res, main = "M1 QQ - sprat weight")
  plotResiduals(dharma_res, form = dat_fit$length_cm,
                main = "M1 residuals vs length")
  dev.off()
  message("Saved: output/figures/m1_dharma_residuals.png")

  message("\n=== DHARMa formal tests ===")
  print(testUniformity(dharma_res))
  print(testDispersion(dharma_res))
  print(testZeroInflation(dharma_res))
} else {
  message("M1 did not converge — skipping DHARMa.")
}

# ============================================================
# Task 5 — Save
# ============================================================
saveRDS(m1,   here("data", "processed", "m1_spatial_length.rds"))
saveRDS(mesh, here("data", "processed", paste0("mesh_cutoff", MESH_CUTOFF, ".rds")))
writeLines(capture.output(sessionInfo()),
           here("data", "processed", "sessioninfo_prompt03.txt"))
message("\nSaved: m1, mesh, sessioninfo")
