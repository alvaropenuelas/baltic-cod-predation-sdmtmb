# 04_period_b.R
# Period B subset (2014-2025), SE sampling diagnostic, build analysis dataset.

library(tidyverse)
library(here)

raw_dir <- here("data", "raw", "stomach_csv")

# --- Prelude: rebuild clean cod_prey join (Country + unambiguous Year + per-stomach sprat/herring totals) ---
file_info <- read_csv(file.path(raw_dir, "File_information.csv"), show_col_types = FALSE)
haul      <- read_csv(file.path(raw_dir, "HaulInformation.csv"),   show_col_types = FALSE)
pred      <- read_csv(file.path(raw_dir, "PredatorInformation.csv"), show_col_types = FALSE)
# OtherItems (col 26) coerced to NA — debris metadata only, no impact on analysis
prey      <- read_csv(file.path(raw_dir, "PreyInformation.csv"),    show_col_types = FALSE)

SPRAT_ID   <- 126425L
HERRING_ID <- 126417L

cod <- pred |>
  filter(AphiaIDPredator == 126436,
         Regurgitated == 0 | is.na(Regurgitated))

# Per-stomach sprat / herring weight totals
sprat_per_stomach <- prey |>
  filter(AphiaIDPrey == SPRAT_ID, !is.na(Weight), Weight > 0) |>
  group_by(tblPredatorInformationID) |>
  summarise(sprat_wgt = sum(Weight), .groups = "drop")

herring_per_stomach <- prey |>
  filter(AphiaIDPrey == HERRING_ID, !is.na(Weight), Weight > 0) |>
  group_by(tblPredatorInformationID) |>
  summarise(herring_wgt = sum(Weight), .groups = "drop")

# Join haul (without Year/Month/Day to avoid collision with pred) + Country + prey rows
cod_haul <- cod |>
  left_join(haul |> select(tblHaulID, ShootLat, ShootLong,
                            ICESrectangle, Depth, Survey),
            by = "tblHaulID") |>
  left_join(file_info |> select(tblUploadID, Country),
            by = "tblUploadID") |>
  left_join(sprat_per_stomach,   by = "tblPredatorInformationID") |>
  left_join(herring_per_stomach, by = "tblPredatorInformationID") |>
  mutate(
    sprat_wgt   = replace_na(sprat_wgt, 0),
    herring_wgt = replace_na(herring_wgt, 0)
  )

# cod_prey: cod_haul x prey rows (long form for completeness — kept for downstream needs)
cod_prey <- cod_haul |>
  left_join(prey |> select(tblPredatorInformationID, AphiaIDPrey,
                            DigestionStage, Weight, Count, Notes),
            by = "tblPredatorInformationID")

# Overwrite cod_prey_joined.rds with clean version (Country + Year unambiguous + per-stomach totals)
saveRDS(cod_prey, here("data", "processed", "cod_prey_joined.rds"))
message("Rebuilt cod_prey_joined.rds with Country, unambiguous Year, sprat_wgt, herring_wgt.")

# ============================================================
# Task 1 — SE subdivision diagnostic
# ============================================================
haul_summary <- cod_prey |>
  filter(Year >= 2014) |>
  distinct(tblHaulID, Year, Country, ICESrectangle, ShootLat, ShootLong) |>
  mutate(period = if_else(Year <= 2021, "2014-2021", "2022-2025"))

dk_rects <- haul_summary |>
  filter(Country == "DK", period == "2014-2021") |>
  pull(ICESrectangle) |> unique()

se_rects <- haul_summary |>
  filter(Country == "SE", period == "2022-2025") |>
  pull(ICESrectangle) |> unique()

overlap <- intersect(dk_rects, se_rects)

message("\n=== SE subdivision diagnostic ===")
message("DK rectangles (2014-2021): ", length(dk_rects))
message("SE rectangles (2022-2025): ", length(se_rects))
message("Overlap (same rectangles): ", length(overlap))
message("Overlap rectangles: ", paste(sort(overlap), collapse = ", "))

if (length(overlap) > 0) {
  cod_prey |>
    filter(Year >= 2014, ICESrectangle %in% overlap) |>
    distinct(tblPredatorInformationID, Year, Country, sprat_wgt) |>
    mutate(period = if_else(Year <= 2021, "2014-2021", "2022-2025")) |>
    group_by(Country, period) |>
    summarise(n = n(),
              pct_sprat = round(100 * mean(sprat_wgt > 0, na.rm = TRUE), 1),
              .groups = "drop") |>
    print()
}

# ============================================================
# Task 2 — Subset to 2014-2021 and aggregate prey per stomach
# ============================================================
cod_2021 <- cod_prey |>
  filter(Year >= 2014, Year <= 2021)

message("\nStomachs 2014-2021: ", n_distinct(cod_2021$tblPredatorInformationID))
message("Hauls 2014-2021:    ", n_distinct(cod_2021$tblHaulID))
message("Years:              ", paste(sort(unique(cod_2021$Year)), collapse = ", "))

stomach_agg <- cod_2021 |>
  distinct(tblPredatorInformationID, tblHaulID,
           Year, Month, Country,
           ShootLat, ShootLong, ICESrectangle, Depth, Survey,
           Length, IndWgt, Age, Sex, MaturityStage,
           StomachFullness, FullStomWgt, EmptyStomWgt, StomachEmpty,
           sprat_wgt, herring_wgt) |>
  mutate(
    sprat_pa    = as.integer(sprat_wgt > 0),
    herring_pa  = as.integer(herring_wgt > 0)
  )

message("\n=== Aggregated stomach dataset ===")
message("Rows (one per cod stomach): ", nrow(stomach_agg))
message("Sprat positives:   ", sum(stomach_agg$sprat_pa), " (",
        round(100 * mean(stomach_agg$sprat_pa), 1), "%)")
message("Herring positives: ", sum(stomach_agg$herring_pa), " (",
        round(100 * mean(stomach_agg$herring_pa), 1), "%)")
message("Sprat weight range (positives): ",
        round(min(stomach_agg$sprat_wgt[stomach_agg$sprat_pa == 1]), 3),
        " - ",
        round(max(stomach_agg$sprat_wgt[stomach_agg$sprat_pa == 1]), 1), " g")

message("Missing ShootLat/Long: ",
        sum(is.na(stomach_agg$ShootLat) | is.na(stomach_agg$ShootLong)))

# ============================================================
# Task 3 — Fulton's K
# ============================================================
message("\n=== Length and weight summary (verify units) ===")
stomach_agg |>
  summarise(
    length_min = min(Length, na.rm = TRUE),
    length_max = max(Length, na.rm = TRUE),
    length_med = median(Length, na.rm = TRUE),
    wgt_min    = min(IndWgt, na.rm = TRUE),
    wgt_max    = max(IndWgt, na.rm = TRUE),
    wgt_med    = median(IndWgt, na.rm = TRUE),
    pct_length_na = round(100 * mean(is.na(Length)), 1),
    pct_wgt_na    = round(100 * mean(is.na(IndWgt)), 1)
  ) |> print()

# IndWgt unit varies by country: DK/SE in kg, LV/PL in grams.
# Normalise to grams then apply standard Fulton's K (W in g, L in cm).
stomach_agg <- stomach_agg |>
  mutate(
    weight_g_norm = case_when(
      Country %in% c("LV", "PL") ~ IndWgt,           # already grams
      Country %in% c("DK", "SE") ~ IndWgt * 1000,    # kg -> g
      TRUE                       ~ NA_real_
    ),
    fulton_k = if_else(
      !is.na(Length) & !is.na(weight_g_norm) & Length > 0,
      100 * weight_g_norm / (Length^3),
      NA_real_
    )
  )

message("\n=== Fulton's K summary ===")
stomach_agg |>
  filter(!is.na(fulton_k)) |>
  summarise(
    n       = n(),
    k_min   = round(min(fulton_k), 4),
    k_max   = round(max(fulton_k), 4),
    k_mean  = round(mean(fulton_k), 4),
    k_med   = round(median(fulton_k), 4),
    pct_extreme = round(100 * mean(fulton_k < 0.3 | fulton_k > 3.0), 2)
  ) |> print()

n_implausible <- sum(!is.na(stomach_agg$fulton_k) &
                     (stomach_agg$fulton_k < 0.2 | stomach_agg$fulton_k > 4.0))
message("Implausible K values (< 0.2 or > 4.0): ", n_implausible)
if (n_implausible > 0) {
  k_flag <- stomach_agg |>
    filter(!is.na(fulton_k), fulton_k < 0.2 | fulton_k > 4.0) |>
    select(Year, Length, IndWgt, fulton_k) |>
    arrange(fulton_k)
  n_show <- min(nrow(k_flag), 10)
  bottom <- head(k_flag, 5)
  top    <- tail(k_flag, 5)
  print(bind_rows(bottom, top))
}

# ============================================================
# Task 4 — Final analysis dataset save
# ============================================================
analysis_dat <- stomach_agg |>
  select(
    fish_id     = tblPredatorInformationID,
    haul_id     = tblHaulID,
    year        = Year,
    month       = Month,
    country     = Country,
    survey      = Survey,
    lat         = ShootLat,
    lon         = ShootLong,
    ices_rect   = ICESrectangle,
    depth_m     = Depth,
    length_cm   = Length,
    weight_g    = weight_g_norm,
    age         = Age,
    sex         = Sex,
    maturity    = MaturityStage,
    fulton_k,
    sprat_wgt,
    sprat_pa,
    herring_wgt,
    herring_pa
  )

message("\n=== Final analysis dataset ===")
message("Rows: ", nrow(analysis_dat))
message("Columns: ", ncol(analysis_dat))
message("Year x n_stomachs:")
analysis_dat |> count(year) |> print()
message("\nNA summary (key columns):")
analysis_dat |>
  summarise(across(c(lat, lon, length_cm, weight_g, fulton_k, depth_m),
                   ~ round(100 * mean(is.na(.)), 1),
                   .names = "pct_na_{.col}")) |>
  print()

dir.create(here("data", "processed"), recursive = TRUE, showWarnings = FALSE)
saveRDS(analysis_dat, here("data", "processed", "analysis_dat.rds"))
write_csv(analysis_dat, here("data", "processed", "analysis_dat.csv"))
message("\nSaved: data/processed/analysis_dat.rds + .csv")
