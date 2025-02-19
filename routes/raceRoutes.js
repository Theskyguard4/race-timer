const express = require('express');
const router = express.Router();
const { getRaces, getRunnersByRace, getRacePositions } = require('../controllers/raceController');

router.get('/races', getRaces);
router.get('/races/:raceId/runners', getRunnersByRace);
router.get('/races/:raceId/positions', getRacePositions);

module.exports = router;
