const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

function handleError(res, error, statusCode = 500) {
  console.error(error);
  res
    .status(statusCode)
    .json({ error: error.message || "Something went wrong" });
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function getAllQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getRaces = async (req, res) => {
  try {
    const rows = await getAllQuery("SELECT * FROM races");
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
};

const getRunnersByRace = async (req, res) => {
  const { raceId } = req.params;
  try {
    const rows = await getAllQuery("SELECT * FROM runners WHERE race_id = ?", [
      raceId,
    ]);
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
};

const getStartTime = async (req, res) => {
  try {
    const rows = await getAllQuery(
      "SELECT raceCode, startTimeDate, ended FROM races"
    );
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
};

async function saveEntireRace(req, res) {
  const { raceCode, startTimeDate, runners, ended, raceName = "" } = req.body;
  try {
    let raceId = await getRaceId(raceCode);

    if (raceId) {
      await runQuery("DELETE FROM Races WHERE raceCode = ?", [raceCode]);
      await runQuery("DELETE FROM racePositions WHERE raceId = ?", [raceId]);
    }

    const result = await runQuery(
      "INSERT INTO Races (raceCode, startTimeDate, ended, raceName) VALUES (?, ?, ?, ?)",
      [raceCode, startTimeDate, ended, raceName]
    );
    raceId = result.lastID;

    const runnerIds = [];
    for (const runner of runners) {
      let runnerId = runner.runnerId;

      if (!runnerId && runner.fname && runner.lname) {
        const newRunner = await runQuery(
          "INSERT INTO Runners (fName, lName) VALUES (?, ?)",
          [runner.fname, runner.lname]
        );
        runnerId = newRunner.lastID;
      } else if (runnerId) {
        await runQuery(
          "UPDATE Runners SET fName = ?, lName = ? WHERE runnerId = ?",
          [runner.fname, runner.lname, runnerId]
        );
      }

      await runQuery(
        "INSERT INTO racePositions (runnerId, raceId, position, time) VALUES (?, ?, ?, ?)",
        [runnerId, raceId, runner.position, runner.time]
      );
      runnerIds.push(runnerId);
    }

    res.status(200).json({ message: "Race saved successfully", runnerIds });
  } catch (err) {
    handleError(res, err);
  }
}

async function getMarshallsByRace(req, res) {
  try {
    const raceCode = req.params.raceCode;

    const race = await getAllQuery("SELECT * FROM Races WHERE raceCode = ?", [
      raceCode,
    ]);
    console.log(race, raceCode);

    if (race.length === 0) {
      return res.status(404).json({ error: "Race not found" });
    }

    const raceId = race[0].raceId;
    const marshalls = await getAllQuery(
      "SELECT * FROM Marshalls WHERE raceId = ?",
      [raceId]
    );
    console.log(marshalls);

    return res.json(marshalls);
  } catch (error) {
    console.error("Error fetching marshalls:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function addMarshallInput(req, res) {
  const { time, marshallId } = req.body;
  console.log(time, marshallId);
  if (!marshallId || !time) {
    return res.status(400).json({ error: "marshalId and time are required" });
  }

  db.run(
    `INSERT INTO MarshallInputs (marshalId, time) VALUES (?, ?)`,
    [marshallId, time],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to insert input" });
      }
      res
        .status(201)
        .json({ message: "Input added successfully", inputId: this.lastID });
    }
  );
}

async function deleteMarshallAndInputs(req, res) {
  const { id } = req.params;
  try {
    await db.run("DELETE FROM MarshallInputs WHERE marshalId = ?", [id]);
    await db.run("DELETE FROM Marshalls WHERE marshalId = ?", [id]);

    res.status(200).json({ message: "Marshall and inputs deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete marshall and inputs." });
  }
}

async function confirmMarshall(req, res) {
  const { id } = req.params;
  try {
    await db.run("UPDATE Marshalls SET confirmed = 1 WHERE marshalId = ?", [
      id,
    ]);

    res.status(200).json({ message: "Marshall confirmed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to confirm marshall." });
  }
}

function getMarshallInputs(req, res) {
  const { marshalId } = req.params;
  console.log(marshalId);
  if (!marshalId) {
    return res.status(400).json({ error: "marshalId is required" });
  }

  db.all(
    `SELECT inputId, time FROM MarshallInputs WHERE marshalId = ? ORDER BY time ASC`,
    [marshalId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch inputs" });
      }
      console.log(rows);
      res.status(200).json(rows);
    }
  );
}

const addMarshall = (req, res) => {
  const { raceCode } = req.params;
  const { marshallName, checkpointName, checkpointDistance } = req.body;
  console.log(raceCode, marshallName, checkpointName, checkpointDistance);
  db.get(
    `SELECT raceId FROM Races WHERE raceCode = ?`,
    [raceCode],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error finding race" });
      }

      if (!row) {
        return res
          .status(404)
          .json({ error: "Race not found with provided code" });
      }

      const raceId = row.raceId;

      db.run(
        `INSERT INTO Marshalls (raceId, name, checkpointName, distance, confirmed) VALUES (?, ?, ?, ?, ?)`,
        [raceId, marshallName, checkpointName, checkpointDistance, 0],
        function (err) {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to add marshall" });
          } else {
            res.json({ message: "Marshall added", marshalId: this.lastID });
          }
        }
      );
    }
  );
};

async function getRaceId(raceCode) {
  const rows = await getAllQuery(
    "SELECT raceId FROM Races WHERE raceCode = ?",
    [raceCode]
  );
  if (rows.length === 0) throw new Error("Race not found");
  return rows[0].raceId;
}

async function endRace(req, res) {
  const { raceCode } = req.body;
  try {
    await runQuery("UPDATE Races SET ended = 1 WHERE raceCode = ?", [raceCode]);
    res.json({
      success: true,
      message: `Race with code ${raceCode} marked as ended.`,
    });
  } catch (err) {
    handleError(res, err);
  }
}

async function addSingleRaceResult(req, res) {
  const { runnerId, raceCode, position, time } = req.body;
  try {
    const raceId = await getRaceId(raceCode);
    if (!raceId || !position || !time) {
      return handleError(res, { message: "Missing required parameters" }, 400);
    }

    await runQuery(
      "INSERT INTO racePositions (runnerId, raceId, position, time) VALUES (?, ?, ?, ?)",
      [runnerId, raceId, position, time]
    );

    res.json({
      success: true,
      message: "Race result added successfully!",
    });
  } catch (err) {
    handleError(res, err);
  }
}

async function removeSinglePositionViaReButt(req, res) {
  const { raceCode, position, time } = req.body;
  try {
    const raceId = await getRaceId(raceCode);
    const result = await runQuery(
      "DELETE FROM racePositions WHERE raceId = ? AND position = ? AND time = ?",
      [raceId, position, time]
    );

    if (result.changes === 0) {
      return handleError(
        res,
        { message: "No matching race position found" },
        404
      );
    }

    res.json({
      success: true,
      message: "Race result removed successfully",
    });
  } catch (err) {
    handleError(res, err);
  }
}

async function addRace(req, res) {
  const { raceCode, startTimeDate, ended } = req.body;
  if (!raceCode || !startTimeDate) {
    return handleError(res, { message: "Missing required fields" }, 400);
  }

  try {
    await runQuery(
      "INSERT INTO races (raceCode, startTimeDate, ended) VALUES (?, ?, ?)",
      [raceCode, startTimeDate, ended]
    );
    res.status(201).json({ message: "Race added successfully!" });
  } catch (err) {
    handleError(res, err);
  }
}

const getRacePositions = async (req, res) => {
  try {
    const rows = await getAllQuery(
      `
      SELECT Runners.runnerID, Runners.fName, Runners.lName, 
             racePositions.position, racePositions.raceId, racePositions.time
      FROM racePositions
      LEFT JOIN Runners ON Runners.runnerId = racePositions.runnerId
      ORDER BY racePositions.position ASC
    `
    );
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
};
function getNewestRunner() {
  return new Promise((resolve) => {
    db.all(
      "SELECT runnerID FROM Runners ORDER BY runnerID DESC LIMIT 1",
      (err, rows) => {
        if (err) {
          return handleError(resolve, err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}
async function getPositionRunnerId(raceId, position) {
  return new Promise((resolve) => {
    db.all(
      "SELECT runnerId FROM racePositions WHERE position = ? AND raceId = ?",
      [position, raceId],
      (err, rows) => {
        if (err) {
          return handleError(resolve, err);
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
  } catch (err) {
    return handleError(res, err);
  }

  try {
    const runnerData = await getPositionRunnerId(raceId, position);
    runnerId = runnerData.length > 0 ? runnerData[0].runnerId : null;
  } catch (err) {
    return handleError(res, err);
  }

  if (!runnerId) {
    try {
      await new Promise((resolve) => {
        db.run(
          `INSERT INTO Runners (fName, lName) VALUES (?, ?)`,
          [fname, lname],
          function (err) {
            if (err) {
              return handleError(res, err);
            } else {
              resolve();
            }
          }
        );
      });

      const rows = await getNewestRunner();

      if (rows.length === 0) {
        return handleError(res, {
          status: 400,
          message: "Missing runners",
        });
      }
      runnerId = rows[0].runnerId;
    } catch (err) {
      return handleError(res, err);
    }
  } else {
    await new Promise((resolve) => {
      db.run(
        `UPDATE Runners SET fName = ?, lName = ? WHERE runnerID = ?`,
        [fname, lname, runnerId],
        function (err) {
          if (err) {
            return handleError(res, err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  try {
    if (!runnerId) {
      return handleError(res, {
        status: 400,
        message: "Missing required fields: RunnerId",
      });
    }

    if (raceId && position) {
      await new Promise((resolve) => {
        db.run(
          `UPDATE racePositions SET runnerId = ? WHERE raceId = ? AND position = ?`,
          [runnerId, raceId, position],
          function (err) {
            if (err) {
              return handleError(res, err);
            } else {
              resolve();
            }
          }
        );
      });

      return res.json({
        success: true,
        message: "Runner updated successfully",
      });
    } else {
      return handleError(res, {
        status: 400,
        message: "Missing required fields: RaceID or Position",
      });
    }
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  getRaces,
  editRunner,
  getRunnersByRace,
  getRacePositions,
  addRace,
  getStartTime,
  addSingleRaceResult,
  removeSinglePositionViaReButt,
  endRace,
  saveEntireRace,
  getMarshallsByRace,
  addMarshall,
  getMarshallInputs,
  addMarshallInput,
  deleteMarshallAndInputs,
  confirmMarshall,
};
