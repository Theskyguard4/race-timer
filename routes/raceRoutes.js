const express = require("express");
const router = express.Router();
const {
  getRaces,
  getRunnersByRace,
  editRunner,
  getRacePositions,
  getStartTime,
  addRace,
  addRaceResults,
  addSingleRaceResult,
  removeSinglePositionViaReButt,
  endRace,
  saveEntireRace,
} = require("../controllers/raceController");

router.get("/races", getRaces);
router.get("/races/:raceId/runners", getRunnersByRace);
router.get("/races/positions", getRacePositions);
router.get("/races/start", getStartTime);
router.post("/races/add", addRace);
router.post("/races/addResults", addRaceResults);
router.post("/races/addSingleRaceResult", addSingleRaceResult);
router.post(
  "/races/removeSinglePositionViaReButt",
  removeSinglePositionViaReButt
);
router.post("/races/endRace", endRace);
router.post("/races/editRunner", editRunner);
router.post("/races/saveEntireRace", saveEntireRace);

module.exports = router;
