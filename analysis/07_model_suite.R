# 07_model_suite.R
# M3: + country + year | M4: + fulton_k | Herring binomial | AIC table.
# NOTE: uses mesh_cutoff25.rds (94 knots) and m2_delta_linear.rds (working M2).

library(sdmTMB)
library(tidyverse)
library(DHARMa)
library(here)

dat_fit <- readRDS(here("data", "processed", "analysis_dat_utm.rds")) |>
  filter(is.na(fulton_k) | (fulton_k > 0.3 & fulton_k < 3.0)) |>
  # SE 2021 has 0 sprat positives — zero column in gamma sub-model → singular Hessian
  filter(country != "SE") |>
  mutate(year_f    = factor(year),
         country_f = factor(country, levels = c("DK","LV","PL")))

# Rebuild mesh on filtered dat_fit (SE dropped — mesh must match nrow(data))
mesh <- make_mesh(dat_fit, xy_cols = c("X", "Y"), cutoff = 25)
message("Mesh knots (rebuilt): ", mesh$mesh$n)
m2   <- readRDS(here("data", "processed", "m2_delta_linear.rds"))

message("dat_fit n: ", nrow(dat_fit),
        " | sprat positives: ", sum(dat_fit$sprat_pa), " (",
        round(100 * mean(dat_fit$sprat_pa), 1), "%)")

# ============================================================
# Task 1 — M3: poly(length,2) + country_f + year_f
# ============================================================
message("\n=== Fitting M3 ===")
m3 <- sdmTMB(
  formula        = sprat_wgt ~ poly(length_cm, 2) + country_f + year_f,
  data           = dat_fit,
  mesh           = mesh,
  family         = delta_gamma(),
  spatial        = list("on", "off"),
  spatiotemporal = "off",
  control        = sdmTMBcontrol(newton_loops = 1)
)

message("\n=== M3 sanity ===")
sanity(m3)
message("M3 max gradient: ", round(max(abs(m3$gradients)), 7))
print(m3)

message("\n=== M3 fixed effects ===")
print(tidy(m3, effects = "fixed",    conf.int = TRUE), n = 25)
message("\n=== M3 random parameters ===")
print(tidy(m3, effects = "ran_pars", conf.int = TRUE))

# DHARMa zero-inflation check
set.seed(42)
sim3 <- simulate(m3, nsim = 200, type = "mle-mvn")
dr3  <- DHARMa::createDHARMa(
  sim3, dat_fit$sprat_wgt,
  predict(m3, type = "response")$est
)
zi3 <- testZeroInflation(dr3)
message("M3 zero-inflation: ratio=", round(zi3$statistic, 3),
        "  p=", round(zi3$p.value, 4))
disp3 <- testDispersion(dr3)
message("M3 dispersion: stat=", round(disp3$statistic, 3),
        "  p=", round(disp3$p.value, 4))

# ============================================================
# Task 2 — M4: + fulton_k; refit M3 on dat_k for AIC parity
# ============================================================
dat_k <- dat_fit |> filter(!is.na(fulton_k))
message("\ndat_k n: ", nrow(dat_k),
        " (dropped ", nrow(dat_fit) - nrow(dat_k), " NA-K rows)")

# Rebuild mesh for dat_k (different nrow from dat_fit)
mesh_k <- make_mesh(dat_k, xy_cols = c("X", "Y"), cutoff = 25)
message("Mesh knots (dat_k): ", mesh_k$mesh$n)

message("\n=== Fitting M3k (on dat_k) ===")
m3_k <- sdmTMB(
  formula        = sprat_wgt ~ poly(length_cm, 2) + country_f + year_f,
  data           = dat_k,
  mesh           = mesh_k,
  family         = delta_gamma(),
  spatial        = list("on", "off"),
  spatiotemporal = "off",
  control        = sdmTMBcontrol(newton_loops = 1)
)
sanity(m3_k)
message("M3k max gradient: ", round(max(abs(m3_k$gradients)), 7))

message("\n=== Fitting M4 (+ fulton_k) ===")
m4 <- sdmTMB(
  formula        = sprat_wgt ~ poly(length_cm, 2) + country_f + year_f + fulton_k,
  data           = dat_k,
  mesh           = mesh_k,
  family         = delta_gamma(),
  spatial        = list("on", "off"),
  spatiotemporal = "off",
  control        = sdmTMBcontrol(newton_loops = 1)
)
sanity(m4)
message("M4 max gradient: ", round(max(abs(m4$gradients)), 7))
print(m4)

message("\n=== M4 fixed effects ===")
print(tidy(m4, effects = "fixed",    conf.int = TRUE), n = 25)
message("\n=== M4 random parameters ===")
print(tidy(m4, effects = "ran_pars", conf.int = TRUE))

# ============================================================
# Task 3 — AIC comparison
# ============================================================
aic_tbl <- tibble(
  model = c("M2: spatial + length (full n)",
            "M3: + country + year (full n)",
            "M3k: + country + year (dat_k)",
            "M4: + fulton_k (dat_k)"),
  n     = c(nrow(dat_fit), nrow(dat_fit), nrow(dat_k), nrow(dat_k)),
  AIC   = c(AIC(m2), AIC(m3), AIC(m3_k), AIC(m4))
) |>
  mutate(dAIC = case_when(
    model %in% c("M2: spatial + length (full n)",
                 "M3: + country + year (full n)") ~
      AIC - min(AIC[1:2]),
    model %in% c("M3k: + country + year (dat_k)",
                 "M4: + fulton_k (dat_k)") ~
      AIC - min(AIC[3:4]),
    TRUE ~ NA_real_
  ))

message("\n=== AIC comparison ===")
print(aic_tbl)

# ============================================================
# Task 4 — Herring binomial
# ============================================================
message("\n=== Fitting herring binomial ===")
m_herr <- sdmTMB(
  formula        = herring_pa ~ length_cm + country_f + year_f,
  data           = dat_fit,
  mesh           = mesh,
  family         = binomial(link = "logit"),
  spatial        = "on",
  spatiotemporal = "off",
  control        = sdmTMBcontrol(newton_loops = 1)
)
sanity(m_herr)
message("Herring max gradient: ", round(max(abs(m_herr$gradients)), 7))
print(m_herr)

message("\n=== Herring fixed effects ===")
print(tidy(m_herr, effects = "fixed",    conf.int = TRUE), n = 20)
message("\n=== Herring random parameters ===")
print(tidy(m_herr, effects = "ran_pars", conf.int = TRUE))

# ============================================================
# Task 5 — Save
# ============================================================
saveRDS(m3,     here("data", "processed", "m3_country_year.rds"))
saveRDS(m3_k,   here("data", "processed", "m3k_country_year_datk.rds"))
saveRDS(m4,     here("data", "processed", "m4_condition.rds"))
saveRDS(m_herr, here("data", "processed", "m_herring_binomial.rds"))
message("\nAll models saved.")
