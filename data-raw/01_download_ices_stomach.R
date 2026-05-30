# 01_download.R
# Downloads full ICES Stomach Content Database — Baltic Sea (EcoRegion = 95)
# Source: https://stomachdata.ices.dk
# License: CC BY 4.0
# Do not modify files in data/raw/

library(here)

dir.create(here("data", "raw"), recursive = TRUE, showWarnings = FALSE)

url <- "https://stomachdata.ices.dk/api/download?EcoRegion=95"
dest <- here("data", "raw", "baltic_stomach_full.zip")

message("Downloading Baltic stomach data (EcoRegion=95)...")
download.file(url, dest, mode = "wb")
message("Download complete. File size: ", round(file.size(dest) / 1e6, 1), " MB")

unzip(dest, exdir = here("data", "raw", "stomach_csv"))
message("Unzipped files:")
print(list.files(here("data", "raw", "stomach_csv"), recursive = TRUE))
