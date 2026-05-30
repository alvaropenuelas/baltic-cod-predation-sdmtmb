# 02_clean_join.R
# Load 4 ICES stomach tables, validate schema, filter cod, join to one flat table.

library(tidyverse)
library(here)

raw_dir <- here("data", "raw", "stomach_csv")

# --- Load ---
file_info <- read_csv(file.path(raw_dir, "File_information.csv"), show_col_types = FALSE)
haul      <- read_csv(file.path(raw_dir, "HaulInformation.csv"),   show_col_types = FALSE)
pred      <- read_csv(file.path(raw_dir, "PredatorInformation.csv"), show_col_types = FALSE)
# OtherItems (col 26) coerced to NA — debris metadata only, no impact on analysis
prey      <- read_csv(file.path(raw_dir, "PreyInformation.csv"),    show_col_types = FALSE)

# --- Validate: report row counts and key column presence ---
message("=== Table dimensions ===")
message("File_info: ", nrow(file_info), " rows")
message("Haul:      ", nrow(haul), " rows")
message("Pred:      ", nrow(pred), " rows")
message("Prey:      ", nrow(prey), " rows")

message("\n=== Haul coordinate completeness ===")
message("Rows with ShootLat/ShootLong: ",
        sum(!is.na(haul$ShootLat) & !is.na(haul$ShootLong)))
message("Rows missing coordinates:     ",
        sum(is.na(haul$ShootLat) | is.na(haul$ShootLong)))

# --- Filter cod predators (AphiaID 126436 = Gadus morhua) ---
cod <- pred |>
  filter(AphiaIDPredator == 126436,
         Regurgitated == 0 | is.na(Regurgitated))

message("\n=== Cod predator records ===")
message("Total cod stomachs (non-regurgitated): ", nrow(cod))
message("Year range: ", min(cod$Year, na.rm = TRUE), " - ", max(cod$Year, na.rm = TRUE))
message("Length range (cm): ", min(cod$Length, na.rm = TRUE),
        " - ", max(cod$Length, na.rm = TRUE))
message("IndWgt range (g): ", min(cod$IndWgt, na.rm = TRUE),
        " - ", max(cod$IndWgt, na.rm = TRUE))

# --- Join haul coords onto cod ---
cod_haul <- cod |>
  left_join(haul |> select(tblHaulID, Year, Month, Day,
                            ShootLat, ShootLong, ICESrectangle, Depth, Survey),
            by = "tblHaulID")

# --- Join prey onto cod (left join — preserves zero-catch stomachs) ---
cod_prey <- cod_haul |>
  left_join(prey |> select(tblPredatorInformationID, AphiaIDPrey,
                            DigestionStage, Weight, Count, Notes),
            by = "tblPredatorInformationID")

message("\n=== Joined table: cod + prey ===")
message("Rows (one per prey item per cod stomach): ", nrow(cod_prey))
message("Rows with prey Weight > 0: ", sum(!is.na(cod_prey$Weight) & cod_prey$Weight > 0))
message("Rows with empty stomach (no prey match): ",
        sum(is.na(cod_prey$AphiaIDPrey)))

# --- Save joined table ---
saveRDS(cod_prey, here("data", "processed", "cod_prey_joined.rds"))
message("\nSaved: data/processed/cod_prey_joined.rds")

# --- Prey AphiaID inventory: top 40 prey codes in cod stomachs ---
prey_inventory <- cod_prey |>
  filter(!is.na(AphiaIDPrey)) |>
  count(AphiaIDPrey, sort = TRUE) |>
  slice_head(n = 40)

message("\n=== Top 40 prey AphiaIDs in cod stomachs ===")
print(prey_inventory, n = 40)

# Cross-check: how many prey records have Weight populated?
message("\n=== Weight availability by prey type (top 20) ===")
cod_prey |>
  filter(!is.na(AphiaIDPrey)) |>
  group_by(AphiaIDPrey) |>
  summarise(n = n(),
            pct_with_weight = round(100 * mean(!is.na(Weight) & Weight > 0), 1)) |>
  arrange(desc(n)) |>
  slice_head(n = 20) |>
  print(n = 20)
