suppressPackageStartupMessages({
  library(here)
  library(sdmTMB)
  library(dplyr)
  library(jsonlite)
})

m4 <- readRDS(here("outputs", "models", "m4_condition.rds"))

# ── Spatial random params (hurdle-1 = presence component) ──
ran_pars <- tidy(m4, effects = "ran_pars", conf.int = TRUE, model = 1)
print(ran_pars)

get_par <- function(df, name) {
  row <- df[df$term == name, ][1, ]
  if (nrow(row) == 0 || is.na(row$estimate)) {
    return(list(estimate = NA, conf_low = NA, conf_high = NA))
  }
  list(
    estimate  = round(row$estimate, 3),
    conf_low  = round(row$conf.low, 3),
    conf_high = round(row$conf.high, 3)
  )
}

# ── Convergence / gradient ──
max_grad <- tryCatch(signif(max(abs(m4$gradients)), 3),
                     error = function(e) NA)
converged <- tryCatch(m4$model$convergence == 0,
                      error = function(e) NA)
n_obs   <- nrow(m4$data)
n_knots <- m4$spde$mesh$n

# ── DHARMa diagnostics ──
diagnostics <- list(
  range_km        = get_par(ran_pars, "range"),
  sigma_O         = get_par(ran_pars, "sigma_O"),
  max_grad        = max_grad,
  converged       = converged,
  n_obs           = n_obs,
  n_knots         = n_knots,
  zero_inf_ratio  = NA,
  zero_inf_p      = NA,
  dispersion_stat = NA,
  dispersion_p    = NA
)

dharma_ok <- requireNamespace("DHARMa", quietly = TRUE)
if (dharma_ok) {
  set.seed(42)
  sim4 <- simulate(m4, nsim = 200, type = "mle-mvn")
  preds <- predict(m4, type = "response")
  dr4 <- DHARMa::createDHARMa(
    simulatedResponse = sim4,
    observedResponse  = m4$data$sprat_wgt,
    fittedPredictedResponse = preds$est
  )
  zi <- DHARMa::testZeroInflation(dr4, plot = FALSE)
  ds <- DHARMa::testDispersion(dr4, plot = FALSE)
  diagnostics$zero_inf_ratio  <- round(as.numeric(zi$statistic), 3)
  diagnostics$zero_inf_p      <- signif(zi$p.value, 3)
  diagnostics$dispersion_stat <- round(as.numeric(ds$statistic), 3)
  diagnostics$dispersion_p    <- signif(ds$p.value, 3)
} else {
  message("DHARMa not installed — skipping residual tests")
}

out <- here("dashboard", "public", "data", "diagnostics.json")
write_json(diagnostics, out, auto_unbox = TRUE, pretty = TRUE)
message("diagnostics.json written to ", out)
str(diagnostics)
