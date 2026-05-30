# Baltic Cod Predation on Sprat and Herring

[![License: GPL-3](https://img.shields.io/badge/License-GPL3-blue.svg)](LICENSE)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](LICENSE-text)

Spatial analysis of Atlantic cod (*Gadus morhua*) predation intensity on sprat
(*Sprattus sprattus*) and herring (*Clupea harengus*) in the Baltic Sea (2014–2021),
using stomach content index data and delta-gamma spatial models fitted with sdmTMB.

## Authors

Álvaro Peñuelas Sánchez ([ORCID](https://orcid.org/0009-0007-0758-3543))

## Contents

    data-raw/   Ingestion scripts and data provenance notes (source data not committed)
    analysis/   Numbered pipeline scripts (02_clean → 03_coverage → 04_period_b → 05–08 models)
    outputs/    Figures (committed); model objects (distributed via GitHub Releases)
    docs/       GitHub Pages visualisation site (Quarto)

## Data sources

**Stomach content data**
ICES Stomach Content Database, extracted 2026-05-30.
ICES, Copenhagen, Denmark. https://stomachdata.ices.dk
Licence: CC-BY 4.0. EcoRegion 95 (Baltic Sea), 1963–2025.

**Survey framework**
ICES Database of Trawl Surveys (DATRAS), Baltic International Trawl Survey (BITS).
ICES, Copenhagen. https://datras.ices.dk

## How to reproduce

1. R ≥ 4.3 and a C++ toolchain required (TMB compiles C++).
   macOS: `xcode-select --install`. Windows: Rtools 4.4+.

2. Clone and restore packages:
   ```r
   install.packages("renv")
   renv::restore()
   ```

3. Download source data (~4 MB):
   ```r
   source("data-raw/01_download_ices_stomach.R")
   ```

4. Run analysis pipeline:
   ```r
   source("analysis/02_clean_join.R")
   source("analysis/03_coverage.R")
   source("analysis/04_period_b.R")
   source("analysis/07_model_suite.R")
   source("analysis/08_predictions_maps.R")
   ```

5. Alternatively, download pre-fitted model objects from the GitHub Release
   (skips fitting time):
   ```r
   install.packages("piggyback")
   piggyback::pb_download(repo = "alvaropenuelas/baltic-cod-predation-sdmtmb",
                          tag  = "v1.0-models",
                          dest = "outputs/models/")
   ```

## Citation

If you use this code, please cite:

> Peñuelas Sánchez, A. (2026). Baltic cod predation analysis code (v1.0).
> Zenodo. https://doi.org/[DOI]

sdmTMB citation:
> Anderson SC, Ward EJ, English PA, Barnett LA, Thorson JT (2025).
> sdmTMB: an R package for fast, flexible, and user-friendly GLMMs with
> spatial and spatiotemporal random fields.
> *Journal of Statistical Software* 115(2). https://doi.org/10.18637/jss.v115.i02

## License

Code: GPL-3.0. Figures and text: CC-BY 4.0.
Source data: CC-BY 4.0 (ICES). See LICENSE and LICENSE-text.
