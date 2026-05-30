# Data sources

## ICES Stomach Content Database

- **Source:** https://stomachdata.ices.dk
- **API endpoint:** https://stomachdata.ices.dk/api/download?EcoRegion=95
- **EcoRegion:** 95 (Baltic Sea)
- **Date accessed:** 2026-05-30
- **Licence:** CC-BY 4.0
- **Records used:** Non-regurgitated cod stomachs (AphiaID 126436), 2014–2021
  (DK/PL/SE BITS/BIAS surveys). n = 4,092 stomachs, 280 hauls.
- **Citation:**
  ICES Stomach Content, 2026-05-30. ICES, Copenhagen, Denmark.
  https://stomachdata.ices.dk

## Prey species AphiaIDs (WoRMS)

- *Sprattus sprattus* (sprat): 126425
- *Clupea harengus* (herring): 126417
- *Gadus morhua* (cod, predator): 126436

## Notes

Raw CSV files (File_information.csv, HaulInformation.csv,
PredatorInformation.csv, PreyInformation.csv) are NOT committed.
Re-download using data-raw/01_download_ices_stomach.R.

Parse warning (OtherItems column, col 26): read_csv guesses logical from first
1000 rows; rows 7351+ have text. Non-critical — OtherItems is debris metadata
only. Fix with col_types = cols(OtherItems = col_character()) if needed.
