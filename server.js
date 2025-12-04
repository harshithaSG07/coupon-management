const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const couponRoutes = require("./src/routes/couponRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/coupon", couponRoutes);

app.get("/", (req, res) => {
  res.send("Coupon Management Service Running...");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // For testing
