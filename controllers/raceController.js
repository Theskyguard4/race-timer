const { json } = require('express');

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
const getStartTime = (res) => {
    db.all("SELECT start FROM races", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

async function saveEntireRace(req, res) {
    const { raceCode, racePassword, distance, participants, startTime, runners, ended } = req.body;
    let runnerIds = [];
    console.log("raceCode: ", raceCode)
    let raceId
    try {
        raceId = await getRaceId(raceCode.toString(), res);
    } catch {
        console.log("not saved Yet")
        raceId = "";
    }
    try {
        // Fetch raceId
        
        
        
        // Delete the race if it already exists
        if (raceId !== "") {
           
            await db.run("DELETE FROM Races WHERE raceCode = ?", [raceCode]);
            await db.run("DELETE FROM racePositions WHERE raceId = ?", [raceId]);
        }


        // Insert the new race
        raceId = await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO Races (raceCode, raceHashPass, distance, participants, start, ended) VALUES (?, ?, ?, ?, ?, ?)",
                [raceCode, racePassword, distance, participants, startTime, ended],
                function (err) {
                    if (err) {
                        console.error("Error inserting race:", err);
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });

        // Insert runners and their positions
        
        for (const runner of runners) {
            let runnerId = runner.runnerId;
            // Insert new runner if runnerId is empty and name is provided
            if (runnerId === "" && runner.fname !== "" || runner.lname !== "") {
                runnerId = await new Promise((resolve, reject) => {
                    db.run(
                        "INSERT INTO Runners (fName, lName) VALUES (?, ?)",
                        [runner.fname, runner.lname],
                        function (err) {
                            if (err) {
                                console.error("Error inserting runner:", err);
                                reject(err);
                            } else {
                                resolve(this.lastID);
                            }
                        }
                    );
                });
            } else if (runnerId !== "") {
                // Update existing runner's name
                await new Promise((resolve, reject) => {
                    db.run(
                        "UPDATE Runners SET fName = ?, lName = ? WHERE runnerId = ?",
                        [runner.fname, runner.lname, runnerId],
                        function (err) {
                            if (err) {
                                console.error("Error updating runner:", err);
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            }

            // Insert runner's position
            await db.run(
                "INSERT INTO racePositions (runnerId, raceId, position, time) VALUES (?, ?, ?, ?)",
                [runnerId, raceId, runner.position, runner.time]
            );
            runnerIds.push(runnerId);
        }
        
        // Send success response
        res.status(200).json({ message: "Race saved successfully", runnerIds });
    } catch (error) {
        console.error("Error saving race:", error);
        res.status(500).json({ error: error.message || "Failed to save race" });
    }
}


async function getRaceId(raceCode, res) {
    
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT raceId FROM Races WHERE Races.raceCode = (?)
        `, raceCode, (err, rows) => {
            if (err) {
                console.error("Error fetching raceId:", err);
                return reject(err);  // Reject the promise in case of an error
            }
            if (rows.length === 0) {
                return reject("Race not found");  // Reject if no race is found
            }
            resolve(rows[0].raceId);  // Resolves with the raceId if found
        });
    });
}

async function endRace(req, res) {
    const { raceCode } = req.body;
    try {
        const query = "UPDATE Races SET ended = 1 WHERE raceCode = ?";  // Use the raceId directly without converting to string
        
        // Use a promise to handle the query asynchronously
        await new Promise((resolve, reject) => {
            db.run(query, [raceCode], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Send a success response
        res.json({ success: true, message: `Race with code ${raceCode} marked as ended.` });
    } catch (error) {
        console.error("Error marking race as ended:", error);
        res.status(500).json({ error: "Failed to mark race as ended." });
    }
}


async function addSingleRaceResult(req, res) {
    const { runnerId, raceCode, position, time } = req.body;
    let raceId = null;

    try {
        // Await the getRaceId function and handle its result
        raceId = await getRaceId(raceCode.toString(), res);
    } catch (error) {
        console.error("Error fetching raceId:", error);
        return res.status(404).json({ error: error.message || "Race not found" }); // Handle rejection (like "Race not found")
    }

    // If raceId, position, or time is missing, return an error
    if (!raceId || !position || !time) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    try {
        // Insert the race result into the database
        await new Promise((resolve, reject) => {
            db.run("INSERT INTO racePositions (runnerId, raceId, position, time) VALUES (?, ?, ?, ?)", 
            [runnerId, raceId, position, time], 
            function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

        // Send success response after the database operation is complete
        return res.json({ success: true, message: "Race result added successfully!" });
    } catch (error) {
        console.error("Error adding race result:", error);
        return res.status(500).json({ error: "Failed to add race result" });
    }
};


async function removeSinglePositionViaReButt(req, res) {
    const {raceCode, position, time } = req.body; 
    const raceId = await getRaceId(raceCode, res);
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM racePositions 
            WHERE raceId = ? AND position = ? AND time = ?
        `, [raceId, position, time], function (err) {
            if (err) {
                console.error("Error removing race result:", err);
                return reject({ message: "Failed to remove race result", error: err });
            }
            if (this.changes === 0) {  // If no rows were affected
                return reject("Race result not found");
            }
            console.log("Removed race result:", this.changes);
            resolve({ success: true, message: "Race result removed successfully" });
        });
    });

};
async function addRaceResults(req, res) {
    const { runnerId, raceId, position, time } = req.body; // Expecting an array of results

    if (!raceId || !Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
    }

    const insertQuery = `
        INSERT INTO racePositions (runnerId, raceId, position, time) 
        VALUES (?, ?, ?, ?), [runnerId, raceId, psoition, time])
    `;

    try {
        const dbTransaction = await db.transaction(async (tx) => {
            for (const result of results) {
                const { runnerId, position, time } = result;

                if (!runnerId || !position || !time) {
                    throw new Error("Missing required fields");
                }

                await tx.run(insertQuery, [runnerId, raceId, position, time]);
            }
        });

        res.json({ success: true, message: "Race results added successfully!" });
    } catch (error) {
        console.error("Error adding race results:", error);
        res.status(500).json({ error: "Failed to add race results" });
    }
}


async function addRace(req, res) {
    const { raceCode, racePassword, distance, participants, startTime } = req.body;
    

    if (raceCode == "" || racePassword == "" || startTime == "") {
        return res.status(400).json({ error: "All fields (raceCode, racePassword, distance, participants, startTime) are required." });
    }

    try {
        await db.run("INSERT INTO races (raceCode, raceHashPass, distance, participants, start) VALUES (?, ?, ?, ?, ?)", 
            [raceCode, racePassword, distance, participants, startTime]);
        
        res.status(201).json({ message: "Race added successfully!" });
    } catch (error) {
        console.error("Error adding race:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
// Get race positions for a specific race
const getRacePositions = (req, res) => {
    db.all(`
        SELECT Runners.runnerID, Runners.fName, Runners.lName, 
               racePositions.position, racePositions.raceId, racePositions.time
        FROM racePositions
        LEFT JOIN Runners ON Runners.runnerId = racePositions.runnerId
        ORDER BY racePositions.position ASC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        console.log(rows);  // To debug the rows returned
        res.json(rows);
    });
};



// Corrected editRunner function
async function getPositionRunnerId(raceId, position) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT runnerId FROM racePositions WHERE position = ? AND raceId = ?", 
            [position, raceId], 
            (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            }
        );
    });
}

async function editRunner(req, res) {
    const { fname, lname, position, raceCode } = req.body;

    let raceId, runnerId;

    try {
        raceId = await getRaceId(raceCode.toString(), res);
    } catch (error) {
        console.error("Error fetching raceId:", error);
        return res.status(404).json({ error: error.message || "Race not found" });
    }

    try {
        const runnerData = await getPositionRunnerId(raceId, position);
        runnerId = runnerData.length > 0 ? runnerData[0].runnerId : null;
    } catch (error) {
        console.error("Error fetching runner ID:", error);
        return res.status(500).json({ error: error.message });
    }

    if (runnerId === "undefined" || runnerId === undefined || runnerId === "") {
        try {
            // Insert new runner
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO Runners (fName, lName) VALUES (?, ?)`, 
                    [fname, lname], 
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });

            // Fetch the newest runner ID
            const rows = await getNewestRunner();
            
            if (rows.length === 0) {
                return res.status(500).json({ error: "Failed to retrieve new runner ID" });
            }
            runnerId = rows[0].runnerId;
        } catch (error) {
            console.error("Error adding runner:", error);
            return res.status(500).json({ error: "Failed to add runner" });
        }
    } else {
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE Runners SET fName = ?, lName = ? WHERE runnerID = ?`, 
                [fname, lname, runnerId], 
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    }

    try {

        if (!runnerId) {
            return res.status(500).json({ error: "Runner ID not found" });
        }

        if (raceId && position) {
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE racePositions SET runnerId = ? WHERE raceId = ? AND position = ?`, 
                    [runnerId, raceId, position], 
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });

            return res.json({ success: true, message: "Runner updated successfully" });
        } else {
            return res.status(400).json({ error: "RaceId or position is missing" });
        }
    } catch (err) {
        console.error("Error updating race position:", err);
        return res.status(500).json({ error: "Error updating race position" });
    }
}

function getNewestRunner() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT runnerID FROM Runners ORDER BY runnerID DESC LIMIT 1`,
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}
module.exports = { getRaces, editRunner, getRunnersByRace, getRacePositions, addRace, getStartTime, addRaceResults, addSingleRaceResult, removeSinglePositionViaReButt, endRace, saveEntireRace};