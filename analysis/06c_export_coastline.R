install.packages(c("rnaturalearth", "rnaturalearthdata"), type = "binary",
                 repos = "https://cloud.r-project.org", quiet = TRUE)

suppressPackageStartupMessages({
  library(sf)
  library(rnaturalearth)
  library(here)
})

coast <- ne_coastline(scale = 50, returnclass = "sf")

bbox_baltic <- st_bbox(c(xmin = 9, xmax = 25, ymin = 52, ymax = 66),
                       crs = st_crs(4326))
baltic_coast <- st_crop(coast, bbox_baltic)

out <- here("dashboard", "public", "data", "baltic_coastline.json")
st_write(baltic_coast, out, driver = "GeoJSON", delete_dsn = TRUE, quiet = TRUE)
sz <- file.size(out) / 1000
cat("baltic_coastline.json:", round(sz, 1), "KB\n")
