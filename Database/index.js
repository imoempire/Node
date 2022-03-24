const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/authApp")
  .then(() => {
    console.log("Our Data is connected");
  })
  .catch((error) => console.log(error));
