# 08_predictions_maps.R
# M4 prediction grid, spatial maps, marginal effects, year effects.

library(sdmTMB)
library(tidyverse)
library(sf)
library(here)

# NOTE: SE excluded to match m4 factor levels (SE has 0 sprat positives)
dat_fit <- readRDS(here("data", "processed", "analysis_dat_utm.rds")) |>
  filter(is.na(fulton_k) | (fulton_k > 0.3 & fulton_k < 3.0)) |>
  filter(country != "SE") |>
  mutate(year_f    = factor(year),
         country_f = factor(country, levels = c("DK", "LV", "PL")))

dat_k <- dat_fit |> filter(!is.na(fulton_k))
m4    <- readRDS(here("data", "processed", "m4_condition.rds"))

median_k  <- median(dat_k$fulton_k, na.rm = TRUE)
modal_len <- 35

dir.create(here("output", "figures"), recursive = TRUE, showWarnings = FALSE)

message("Length distribution (5-cm bins):")
print(sort(table(cut(dat_fit$length_cm, breaks = seq(0, 160, 5))), decreasing = TRUE)[1:8])
message("Median K used for prediction: ", round(median_k, 3))

# ============================================================
# Task 1 — Prediction grid from ICES rectangle centroids
# ============================================================
pred_grid_ll <- dat_fit |>
  group_by(ices_rect) |>
  summarise(lon     = mean(lon, na.rm = TRUE),
            lat     = mean(lat, na.rm = TRUE),
            depth_m = mean(depth_m, na.rm = TRUE),
            .groups = "drop")

message("\nPrediction grid: ", nrow(pred_grid_ll), " ICES rectangles")

pred_grid <- pred_grid_ll |>
  add_utm_columns(ll_names = c("lon", "lat"), utm_crs = 32633, units = "km") |>
  mutate(
    length_cm = modal_len,
    fulton_k  = median_k,
    year_f    = factor("2021", levels = levels(dat_k$year_f)),
    country_f = factor("DK",   levels = levels(dat_k$country_f))
  )

message("Prediction grid columns: ", paste(names(pred_grid), collapse = ", "))

# ============================================================
# Task 2 — M4 predictions
# ============================================================
preds <- predict(m4, newdata = pred_grid, type = "response")

message("\nPrediction columns: ", paste(names(preds), collapse = ", "))

pred_grid <- pred_grid |>
  mutate(
    p_presence = preds$est1,
    wgt_given  = preds$est2,
    exp_wgt    = preds$est
  )

message("Predicted P(presence) range: ",
        round(min(pred_grid$p_presence), 3), " - ",
        round(max(pred_grid$p_presence), 3))
message("Expected weight range (g): ",
        round(min(pred_grid$exp_wgt), 3), " - ",
        round(max(pred_grid$exp_wgt), 2))

# ============================================================
# Task 3 — Spatial maps
# ============================================================

# Map 1: P(sprat presence)
p1 <- ggplot(pred_grid, aes(x = lon, y = lat, fill = p_presence)) +
  geom_tile(width = 1, height = 0.5) +
  scale_fill_viridis_c(option = "plasma", name = "P(sprat\npresence)",
                       limits = c(0, 1)) +
  coord_quickmap(xlim = c(12, 21), ylim = c(54, 60)) +
  labs(title = "Predicted probability of sprat in cod stomach",
       subtitle = "M4: DK, 2021, 35 cm cod, median condition",
       x = "Longitude", y = "Latitude") +
  theme_minimal(base_size = 13)

ggsave(here("output", "figures", "map_sprat_presence.png"),
       p1, width = 7, height = 6, dpi = 150)

# Map 2: Expected sprat weight (combined)
p2 <- ggplot(pred_grid, aes(x = lon, y = lat, fill = exp_wgt)) +
  geom_tile(width = 1, height = 0.5) +
  scale_fill_viridis_c(option = "magma", name = "Expected\nweight (g)",
                       trans = "sqrt") +
  coord_quickmap(xlim = c(12, 21), ylim = c(54, 60)) +
  labs(title = "Predicted sprat weight in cod stomach",
       subtitle = "M4: DK, 2021, 35 cm cod, median condition",
       x = "Longitude", y = "Latitude") +
  theme_minimal(base_size = 13)

ggsave(here("output", "figures", "map_sprat_weight.png"),
       p2, width = 7, height = 6, dpi = 150)

message("Maps saved.")

# ============================================================
# Task 4 — Marginal effect plots
# ============================================================

# Length effect
len_grid <- tibble(
  length_cm = seq(5, 80, by = 1),
  fulton_k  = median_k,
  year_f    = factor("2021", levels = levels(dat_k$year_f)),
  country_f = factor("DK",   levels = levels(dat_k$country_f)),
  X = mean(dat_k$X),
  Y = mean(dat_k$Y)
)
len_preds <- predict(m4, newdata = len_grid, type = "response", re_form = NA)
len_grid <- len_grid |>
  mutate(p_presence = len_preds$est1,
         exp_wgt    = len_preds$est)

p3 <- ggplot(len_grid, aes(x = length_cm)) +
  geom_line(aes(y = p_presence), colour = "#E76F51", linewidth = 1.2) +
  labs(title = "Marginal effect of predator length on P(sprat)",
       subtitle = "Fixed: DK, 2021, median K; spatial random field excluded",
       x = "Cod length (cm)", y = "P(sprat in stomach)") +
  theme_minimal(base_size = 13)

ggsave(here("output", "figures", "marginal_length_psprat.png"),
       p3, width = 7, height = 5, dpi = 150)

# Fulton's K effect
k_grid <- tibble(
  fulton_k  = seq(0.3, 2.0, by = 0.05),
  length_cm = 35,
  year_f    = factor("2021", levels = levels(dat_k$year_f)),
  country_f = factor("DK",   levels = levels(dat_k$country_f)),
  X = mean(dat_k$X),
  Y = mean(dat_k$Y)
)
k_preds <- predict(m4, newdata = k_grid, type = "response", re_form = NA)
k_grid <- k_grid |>
  mutate(p_presence = k_preds$est1,
         exp_wgt    = k_preds$est)

p4 <- ggplot(k_grid, aes(x = fulton_k)) +
  geom_line(aes(y = p_presence), colour = "#2A9D8F", linewidth = 1.2) +
  labs(title = "Marginal effect of body condition (Fulton's K) on P(sprat)",
       subtitle = "Fixed: DK, 2021, 35 cm; spatial random field excluded",
       x = "Fulton's K", y = "P(sprat in stomach)") +
  theme_minimal(base_size = 13)

ggsave(here("output", "figures", "marginal_k_psprat.png"),
       p4, width = 7, height = 5, dpi = 150)

message("Marginal effect plots saved.")

# ============================================================
# Task 5 — Year fixed-effect summary plot
# ============================================================

# Inspect tidy output structure to find component/model column
tidy_all <- tidy(m4, effects = "fixed", conf.int = TRUE)
message("\ntidy(m4) columns: ", paste(names(tidy_all), collapse = ", "))
message("Unique 'model' values: ", paste(unique(tidy_all$model), collapse = ", "))

# Hurdle-1 year effects (model == 1)
year_fe <- tidy_all |>
  filter(model == 1, grepl("year_f", term)) |>
  mutate(year = as.integer(gsub("year_f", "", term))) |>
  bind_rows(tibble(
    term = "year_f2014", year = 2014L,
    estimate = 0, conf.low = 0, conf.high = 0,
    std.error = NA_real_, model = 1L
  )) |>
  arrange(year)

print(year_fe)

p5 <- ggplot(year_fe, aes(x = year, y = estimate,
                           ymin = conf.low, ymax = conf.high)) +
  geom_pointrange(colour = "#264653", size = 0.8) +
  geom_hline(yintercept = 0, linetype = "dashed", alpha = 0.5) +
  scale_x_continuous(breaks = c(2014, 2016, 2017, 2018, 2021)) +
  labs(title = "Year effects on P(sprat in cod stomach)",
       subtitle = "Hurdle-1 fixed effects relative to 2014 (DK reference)",
       x = "Year", y = "Log-odds relative to 2014") +
  theme_minimal(base_size = 13)

ggsave(here("output", "figures", "year_effects_hurdle1.png"),
       p5, width = 7, height = 5, dpi = 150)
message("Year effects plot saved.")

# ============================================================
# Task 6 — Save prediction grid
# ============================================================
saveRDS(pred_grid, here("data", "processed", "pred_grid_m4.rds"))
write_csv(pred_grid, here("data", "processed", "pred_grid_m4.csv"))
message("Prediction grid saved.")

message("\nOutput figures:")
print(list.files(here("output", "figures"), pattern = "\\.png$"))
