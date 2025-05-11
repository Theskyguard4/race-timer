const express = require("express");
const path = require("path");
const app = express();
const raceRoutes = require("./routes/raceRoutes");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", raceRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
