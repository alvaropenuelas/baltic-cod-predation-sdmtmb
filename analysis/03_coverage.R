# 03_coverage.R
# Per-stomach coverage of sprat/herring presence by year, country, and decade.

library(tidyverse)
library(here)

raw_dir <- here("data", "raw", "stomach_csv")

file_info <- read_csv(file.path(raw_dir, "File_information.csv"), show_col_types = FALSE)
haul <- read_csv(file.path(raw_dir, "HaulInformation.csv"),   show_col_types = FALSE)
pred <- read_csv(file.path(raw_dir, "PredatorInformation.csv"), show_col_types = FALSE)
prey <- read_csv(file.path(raw_dir, "PreyInformation.csv"),    show_col_types = FALSE)

cod <- pred |>
  filter(AphiaIDPredator == 126436,
         Regurgitated == 0 | is.na(Regurgitated))

# Note: Year/Month/Day live on pred; haul has matching values. Drop from haul-side
# select to avoid .x/.y suffix collision. Country lives in File_information.
cod_haul <- cod |>
  left_join(haul |> select(tblHaulID, ShootLat, ShootLong,
                            ICESrectangle, Depth, Survey),
            by = "tblHaulID") |>
  left_join(file_info |> select(tblUploadID, Country),
            by = "tblUploadID")

# Confirmed AphiaIDs from Task 5
SPRAT_ID   <- 126425   # Sprattus sprattus
HERRING_ID <- 126417   # Clupea harengus

stomachs <- cod_haul |>
  left_join(
    prey |>
      filter(AphiaIDPrey %in% c(SPRAT_ID, HERRING_ID)) |>
      group_by(tblPredatorInformationID, AphiaIDPrey) |>
      summarise(prey_wgt = sum(Weight, na.rm = TRUE), .groups = "drop") |>
      pivot_wider(names_from = AphiaIDPrey,
                  values_from = prey_wgt,
                  names_prefix = "prey_",
                  values_fill = 0),
    by = "tblPredatorInformationID"
  ) |>
  mutate(
    sprat_wgt   = coalesce(.data[[paste0("prey_", SPRAT_ID)]], 0),
    herring_wgt = coalesce(.data[[paste0("prey_", HERRING_ID)]], 0)
  )

# Coverage by year
cov_year <- stomachs |>
  group_by(Year) |>
  summarise(
    n_stomachs    = n(),
    pct_sprat     = round(100 * mean(sprat_wgt > 0), 1),
    pct_herring   = round(100 * mean(herring_wgt > 0), 1),
    mean_sprat_g  = round(mean(sprat_wgt), 3),
    n_hauls       = n_distinct(tblHaulID),
    .groups = "drop"
  ) |>
  arrange(Year)

message("\n=== Coverage by Year ===")
print(cov_year, n = 100)

# Coverage by year x country
cov_country <- stomachs |>
  group_by(Year, Country) |>
  summarise(n_stomachs = n(), pct_sprat = round(100 * mean(sprat_wgt > 0), 1),
            .groups = "drop") |>
  arrange(Year, Country)

message("\n=== Coverage by Year x Country ===")
print(cov_country, n = 200)

# Spatial coverage: unique ICES rectangles per decade
cov_spatial <- stomachs |>
  filter(!is.na(ICESrectangle)) |>
  mutate(decade = paste0(floor(Year / 10) * 10, "s")) |>
  group_by(decade) |>
  summarise(n_stomachs = n(),
            n_rectangles = n_distinct(ICESrectangle),
            lat_range = paste0(round(min(ShootLat, na.rm=TRUE), 1),
                               "-", round(max(ShootLat, na.rm=TRUE), 1)),
            .groups = "drop")

message("\n=== Spatial coverage by decade ===")
print(cov_spatial)

write.csv(cov_year, here("data", "processed", "coverage_by_year.csv"), row.names = FALSE)
write.csv(cov_country, here("data", "processed", "coverage_by_country_year.csv"), row.names = FALSE)
message("\nSaved coverage tables to data/processed/")

# --- Period B (2014-2025) herring vs sprat occurrence ---
message("\n=== Period B (2014-2025) overall ===")
stomachs |>
  filter(Year >= 2014) |>
  summarise(
    n_stomachs      = n(),
    pct_herring     = round(100 * mean(herring_wgt > 0), 1),
    pct_sprat       = round(100 * mean(sprat_wgt > 0), 1),
    mean_herring_g  = round(mean(herring_wgt), 3),
    mean_sprat_g    = round(mean(sprat_wgt), 3)
  ) |> print()

message("\n=== Period B by year ===")
stomachs |>
  filter(Year >= 2014) |>
  group_by(Year) |>
  summarise(n = n(),
            pct_herring = round(100 * mean(herring_wgt > 0), 1),
            pct_sprat   = round(100 * mean(sprat_wgt   > 0), 1),
            .groups = "drop") |>
  print(n = 20)
