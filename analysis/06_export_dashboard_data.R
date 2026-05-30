library(here)
library(dplyr)
library(jsonlite)
library(sdmTMB)

dir.create(here("dashboard", "public", "data"), recursive = TRUE, showWarnings = FALSE)

# ── 1. Prediction grid ─────────────────────────────────────────────────────
pred <- readRDS(here("data", "processed", "pred_grid_m4.rds"))

predictions <- pred |>
  select(ices_rect, lon, lat, p_presence, wgt_given, exp_wgt) |>
  mutate(across(where(is.numeric), \(x) round(x, 4)))

write_json(predictions, here("dashboard", "public", "data", "predictions.json"),
           auto_unbox = TRUE, digits = 4)
cat("predictions.json:", nrow(predictions), "rows\n")

# ── 2. M4 fixed-effect coefficients (hurdle-1 and hurdle-2) ────────────────
m4 <- readRDS(here("outputs", "models", "m4_condition.rds"))

coef1 <- tidy(m4, effects = "fixed", conf.int = TRUE, model = 1) |>
  mutate(component = "hurdle1")
coef2 <- tidy(m4, effects = "fixed", conf.int = TRUE, model = 2) |>
  mutate(component = "hurdle2")

m4_coef <- bind_rows(coef1, coef2) |>
  select(component, term, estimate, std.error, conf.low, conf.high) |>
  mutate(across(where(is.numeric), \(x) round(x, 4)))

write_json(m4_coef, here("dashboard", "public", "data", "m4_coef.json"),
           auto_unbox = TRUE, digits = 4)
cat("m4_coef.json:", nrow(m4_coef), "rows\n")

# ── 3. Year effects (hurdle-1 only) ────────────────────────────────────────
year_fe <- tidy(m4, effects = "fixed", conf.int = TRUE, model = 1) |>
  filter(grepl("year_f", term)) |>
  mutate(
    year = as.integer(gsub("year_f", "", term)),
    across(where(is.numeric), \(x) round(x, 4))
  ) |>
  select(year, estimate, conf.low, conf.high)

write_json(year_fe, here("dashboard", "public", "data", "year_effects.json"),
           auto_unbox = TRUE, digits = 4)
cat("year_effects.json:", nrow(year_fe), "rows\n")

# ── 4. AIC comparison table ─────────────────────────────────────────────────
aic_table <- tibble(
  model       = c("M2", "M3", "M4"),
  formula     = c(
    "sprat_wgt ~ length_cm",
    "sprat_wgt ~ poly(length_cm,2) + country_f + year_f",
    "sprat_wgt ~ poly(length_cm,2) + country_f + year_f + fulton_k"
  ),
  n           = c(4088L, 4040L, 3451L),
  aic         = c(9683, 9141, 7422),
  delta_aic   = c(542, 0, 0),
  note        = c(
    "baseline spatial+length",
    "add country + year (baseline for M3 vs M4)",
    "selected model — adds body condition"
  )
)

write_json(aic_table, here("dashboard", "public", "data", "aic_table.json"),
           auto_unbox = TRUE, digits = 4)
cat("aic_table.json:", nrow(aic_table), "rows\n")

# ── 5. Spatial range / variance parameters ─────────────────────────────────
range_par <- tidy(m4, effects = "ran_pars", conf.int = TRUE, model = 1) |>
  mutate(across(where(is.numeric), \(x) round(x, 4))) |>
  select(term, estimate, conf.low, conf.high)

write_json(range_par, here("dashboard", "public", "data", "spatial_params.json"),
           auto_unbox = TRUE, digits = 4)
cat("spatial_params.json:", nrow(range_par), "rows\n")

cat("\nAll JSON files written to dashboard/public/data/\n")
