if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URl = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

// async function main(){
//    await mongoose.connect(MONGO_URl);
// }
async function main() {
  await mongoose.connect(dbUrl);
  console.log(" Connected to MongoDB Atlas");
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj, owner:'68e619779f801b953383d25a'}))
    await Listing.insertMany(initData.data);
    console.log("data was Initialized");
};
initDB();