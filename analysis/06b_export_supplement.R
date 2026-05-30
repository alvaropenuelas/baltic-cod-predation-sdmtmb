suppressPackageStartupMessages({
  library(tidyverse)
  library(jsonlite)
  library(sdmTMB)
  library(here)
})

dash_data <- here("dashboard", "public", "data")

m4     <- readRDS(here("outputs", "models", "m4_condition.rds"))
m_herr <- readRDS(here("outputs", "models", "m_herring_binomial.rds"))

# SE excluded from model fitting — exclude here too
dat_fit <- readRDS(here("data", "processed", "analysis_dat_utm.rds")) |>
  filter(is.na(fulton_k) | (fulton_k > 0.3 & fulton_k < 3.0)) |>
  filter(country != "SE") |>
  mutate(year_f    = factor(year),
         country_f = factor(country, levels = c("DK","LV","PL")))
dat_k   <- dat_fit |> filter(!is.na(fulton_k))
median_k <- median(dat_k$fulton_k, na.rm = TRUE)
cat("dat_fit:", nrow(dat_fit), "dat_k:", nrow(dat_k), "median_k:", round(median_k, 4), "\n")

# ── hero_stats.json ────────────────────────────────────────────────────────
write_json(list(
  n_stomachs       = nrow(dat_fit),
  n_hauls          = n_distinct(dat_fit$haul_id),
  pct_sprat        = round(100 * mean(dat_fit$sprat_pa), 1),
  pct_herring      = round(100 * mean(dat_fit$herring_pa), 1),
  spatial_range_km = 32,
  n_years          = n_distinct(dat_fit$year),
  year_min         = min(dat_fit$year),
  year_max         = max(dat_fit$year)
), file.path(dash_data, "hero_stats.json"), auto_unbox = TRUE, pretty = TRUE)
cat("hero_stats.json done\n")

# ── year_n_stomachs.json ───────────────────────────────────────────────────
write_json(
  dat_fit |> count(year) |> rename(n_stomachs = n),
  file.path(dash_data, "year_n_stomachs.json"), pretty = TRUE
)
cat("year_n_stomachs.json done\n")

# ── predictions.json — rename cols + add p_herring ────────────────────────
pred_raw <- readRDS(here("data", "processed", "pred_grid_m4.rds"))

herr_p <- predict(m_herr, newdata = pred_raw, type = "response")
cat("herr predict est range:", round(range(herr_p$est), 4), "\n")

predictions <- pred_raw |>
  mutate(
    p_sprat       = round(p_presence, 4),
    exp_wgt_sprat = round(exp_wgt, 4),
    p_herring     = round(herr_p$est, 4)
  ) |>
  select(ices_rect, lon, lat, p_sprat, exp_wgt_sprat, p_herring)

write_json(predictions, file.path(dash_data, "predictions.json"),
           auto_unbox = TRUE, digits = 4)
cat("predictions.json done (", nrow(predictions), "rows)\n")

# ── marginal_length.json ───────────────────────────────────────────────────
len_grid <- tibble(
  length_cm = seq(5, 80, by = 1),
  fulton_k  = median_k,
  year_f    = factor("2021", levels = levels(dat_k$year_f)),
  country_f = factor("DK",   levels = levels(dat_k$country_f)),
  X = mean(dat_k$X), Y = mean(dat_k$Y)
)
lp <- predict(m4, newdata = len_grid, type = "response", re_form = NA)
write_json(
  tibble(length_cm = len_grid$length_cm,
         p_sprat   = round(lp$est1, 4),
         exp_wgt   = round(lp$est,  4)),
  file.path(dash_data, "marginal_length.json"), pretty = TRUE
)
cat("marginal_length.json done\n")

# ── marginal_k.json ────────────────────────────────────────────────────────
k_grid <- tibble(
  fulton_k  = seq(0.3, 2.0, by = 0.05),
  length_cm = 35,
  year_f    = factor("2021", levels = levels(dat_k$year_f)),
  country_f = factor("DK",   levels = levels(dat_k$country_f)),
  X = mean(dat_k$X), Y = mean(dat_k$Y)
)
kp <- predict(m4, newdata = k_grid, type = "response", re_form = NA)
write_json(
  tibble(fulton_k = k_grid$fulton_k,
         p_sprat  = round(kp$est1, 4),
         exp_wgt  = round(kp$est,  4)),
  file.path(dash_data, "marginal_k.json"), pretty = TRUE
)
cat("marginal_k.json done\n")

# ── year_effects.json — underscore column names ────────────────────────────
year_fe <- tidy(m4, effects = "fixed", conf.int = TRUE, model = 1) |>
  filter(grepl("year_f", term)) |>
  mutate(
    year      = as.integer(gsub("year_f", "", term)),
    estimate  = round(estimate, 4),
    conf_low  = round(conf.low, 4),
    conf_high = round(conf.high, 4)
  ) |>
  select(year, estimate, conf_low, conf_high)

write_json(year_fe, file.path(dash_data, "year_effects.json"),
           auto_unbox = TRUE, digits = 4)
cat("year_effects.json done\n")

cat("\nAll files in dash_data:\n")
cat(paste(list.files(dash_data), collapse = "\n"), "\n")
