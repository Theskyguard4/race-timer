const express = require("express");
const router = express.Router();
const {
  getRaces,
  getRunnersByRace,
  editRunner,
  getRacePositions,
  getStartTime,
  addRace,
  addSingleRaceResult,
  removeSinglePositionViaReButt,
  endRace,
  saveEntireRace,
  getMarshallsByRace,
  addMarshall,
  addMarshallInput,
  getMarshallInputs,
  deleteMarshallAndInputs,
  confirmMarshall,
} = require("../controllers/raceController");

router.get("/races", getRaces);
router.get("/races/:raceId/runners", getRunnersByRace);
router.get("/races/positions", getRacePositions);
router.get("/races/start", getStartTime);
router.post("/races/add", addRace);
router.post("/races/addSingleRaceResult", addSingleRaceResult);
router.post(
  "/races/removeSinglePositionViaReButt",
  removeSinglePositionViaReButt
);
router.post("/races/endRace", endRace);
router.post("/races/editRunner", editRunner);
router.post("/races/saveEntireRace", saveEntireRace);
router.get("/races/:raceCode/marshalls", getMarshallsByRace);
router.post("/races/:raceCode/addMarshall", addMarshall);
router.post("/marshall-input", addMarshallInput);
router.get("/marshall-inputs/:marshalId", getMarshallInputs);
router.post("/marshall/:id", deleteMarshallAndInputs);
router.post("/marshall/:id/confirm", confirmMarshall);
module.exports = router;
