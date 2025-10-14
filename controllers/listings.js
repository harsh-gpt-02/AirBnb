// const fetch = require("node-fetch");
const Listing = require("../models/listing");

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": process.env.USER_AGENT, // now loaded from .env
      },
    });

    const data = await response.json();
    console.log("Raw geocoding data:", data);

    if (data && data.length > 0) {
      const lon = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      console.log(`Coordinates found for ${address}: [${lon}, ${lat}]`);
      return [lon, lat];
    } else {
      console.log("No coordinates found for:", address);
      return null;
    }
  } catch (e) {
    console.error("Geocoding API Error:", e);
    return null;
  }
}



module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  const locationAddress = req.body.listing.location;
  const coordinates = await geocodeAddress(locationAddress);

if (coordinates) {
  newListing.geometry = {
    type: "Point",
    coordinates: coordinates, // [lon, lat]
  };
} else {
  // Default coordinates to avoid validation errors
  newListing.geometry = {
    type: "Point",
    coordinates: [77.2090, 28.6139], // Delhi fallback
  };
  console.log("Using default coordinates because geocoding failed.");
}


  let url = req.file.path;
  let filename = req.file.filename;

  newListing.image = { url, filename };
  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
