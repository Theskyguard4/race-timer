const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Get all races
const getRaces = (req, res) => {
    db.all("SELECT * FROM races", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

// Get all runners in a specific race
const getRunnersByRace = (req, res) => {
    const { raceId } = req.params;
    db.all("SELECT * FROM runners WHERE race_id = ?", [raceId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

// Get race positions for a specific race
const getRacePositions = (req, res) => {

    db.all(`
        SELECT runners.runnerID, runners.fName, runners.lName, racePositions.position, racePositions.raceId
        FROM racePositions
        JOIN runners ON racePositions.runnerId = runners.runnerId
        ORDER BY racePositions.position ASC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

module.exports = { getRaces, getRunnersByRace, getRacePositions };
