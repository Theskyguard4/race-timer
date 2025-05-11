const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");

  db.run(`CREATE TABLE IF NOT EXISTS Races (
        raceId INTEGER PRIMARY KEY AUTOINCREMENT,
        raceName Text,
        raceCode TEXT NOT NULL UNIQUE,
        startTimeDate TEXT NOT NULL,
        ended INTEGER
    );`);

  db.run(`CREATE TABLE IF NOT EXISTS Runners (
        runnerId INTEGER PRIMARY KEY AUTOINCREMENT,
        fName TEXT NOT NULL,
        lName TEXT NOT NULL
    );`);

  db.run(`CREATE TABLE IF NOT EXISTS racePositions (
        racePositionId INTEGER PRIMARY KEY AUTOINCREMENT,
        runnerId INTEGER,
        raceId INTEGER NOT NULL,
        position INTEGER NOT NULL,
        time TEXT NOT NULL,
        FOREIGN KEY (runnerId) REFERENCES Runners(runnerId) ON DELETE CASCADE,
        FOREIGN KEY (raceId) REFERENCES Races(raceId) ON DELETE CASCADE
    );`);

  db.run(`CREATE TABLE IF NOT EXISTS Marshalls (
        marshalId INTEGER PRIMARY KEY AUTOINCREMENT,
        raceId INTEGER NOT NULL,
        name TEXT NOT NULL,
        checkpointName TEXT,
        distance REAL,
        confirmed INTEGER, -- 0 = requested, 1 = confirmed
        FOREIGN KEY (raceId) REFERENCES Races(raceId) ON DELETE CASCADE
    );`);

  db.run(`CREATE TABLE IF NOT EXISTS MarshallInputs (
        inputId INTEGER PRIMARY KEY AUTOINCREMENT,
        marshalId INTEGER NOT NULL,
        time TEXT NOT NULL,
        FOREIGN KEY (marshalId) REFERENCES Marshalls(marshalId) ON DELETE CASCADE
    );`);

  db.run(`INSERT OR IGNORE INTO Races (raceCode,startTimeDate, ended) VALUES
        ('1111111111', 2700, 1),
        ('2222222222', 6000, 1),
        ('3333333333', 7000, 1);`);

  db.run(`INSERT INTO Marshalls (raceId, name, checkpointName, distance, confirmed) VALUES
        (1, 'John Doe', 'Checkpoint A', 2.5, 1),
        (1, 'Jane Smith', 'Checkpoint B', 5.0, 0),
        (2, 'Michael Brown', 'Checkpoint C', 3.0,  1),
        (3, 'Emma Johnson', 'Checkpoint D', 1.5, 0);`);

  db.run(`INSERT INTO Runners (fName, lName) VALUES
        ('James', 'Smith'), ('Emma', 'Johnson'), ('Liam', 'Williams'),
        ('Olivia', 'Brown'), ('Noah', 'Jones'), ('Ava', 'Garcia'),
        ('William', 'Miller'), ('Sophia', 'Davis'), ('Benjamin', 'Rodriguez'),
        ('Mia', 'Martinez'), ('Lucas', 'Hernandez'), ('Charlotte', 'Lopez'),
        ('Henry', 'Gonzalez'), ('Amelia', 'Wilson'), ('Alexander', 'Anderson'),
        ('Harper', 'Thomas'), ('Elijah', 'Taylor'), ('Evelyn', 'Moore'),
        ('Daniel', 'Jackson'), ('Isabella', 'Martin'), ('Sebastian', 'Lee'),
        ('Scarlett', 'Perez'), ('David', 'Thompson'), ('Aria', 'White'),
        ('Matthew', 'Harris'), ('Luna', 'Clark'), ('Joseph', 'Lewis'),
        ('Grace', 'Young'), ('Samuel', 'Walker'), ('Chloe', 'Hall');`);

  db.run(`INSERT INTO racePositions (runnerId, raceId, position, time) VALUES
        (1, 1, 1, '00:15:30'), (2, 1, 2, '00:16:00'), (3, 1, 3, '00:16:30'),
        (4, 1, 4, '00:17:00'), (5, 1, 5, '00:17:30'), (6, 1, 6, '00:18:00'),
        (7, 1, 7, '00:18:30'), (8, 1, 8, '00:19:00'), (9, 1, 9, '00:19:30'),
        (10, 1, 10, '00:20:00'),

        (11, 2, 1, '00:30:30'), (12, 2, 2, '00:31:00'), (13, 2, 3, '00:31:30'),
        (14, 2, 4, '00:32:00'), (15, 2, 5, '00:32:30'), (16, 2, 6, '00:33:00'),
        (17, 2, 7, '00:33:30'), (18, 2, 8, '00:34:00'), (19, 2, 9, '00:34:30'),
        (20, 2, 10, '00:35:00'),

        (21, 3, 1, '00:45:30'), (22, 3, 2, '00:46:00'), (23, 3, 3, '00:46:30'),
        (24, 3, 4, '00:47:00'), (25, 3, 5, '00:47:30'), (26, 3, 6, '00:48:00'),
        (27, 3, 7, '00:48:30'), (28, 3, 8, '00:49:00'), (29, 3, 9, '00:49:30'),
        (30, 3, 10, '00:50:00');`);
  db.run(`INSERT INTO MarshallInputs (marshalId, time) VALUES
        (1, '2024-04-27T09:00:00Z'),
        (1, '2024-04-27T09:15:00Z'),
        (1, '2024-04-27T09:30:00Z'),
        (1, '2024-04-27T09:45:00Z'),
        (1, '2024-04-27T10:00:00Z'),
        (1, '2024-04-27T10:05:00Z'),
        (1, '2024-04-27T10:10:00Z'),
        (1, '2024-04-27T10:15:00Z'),
        (1, '2024-04-27T10:20:00Z'),
        (1, '2024-04-27T10:25:00Z'),
        (1, '2024-04-27T10:30:00Z'),
        (1, '2024-04-27T10:31:00Z'),
        (1, '2024-04-27T10:32:00Z'),
        (1, '2024-04-27T10:33:00Z'),
        (1, '2024-04-27T10:34:00Z'),
        (1, '2024-04-27T10:35:00Z'),
        (1, '2024-04-27T10:36:00Z'),
        (1, '2024-04-27T10:37:00Z'),
        (1, '2024-04-27T10:38:00Z'),
        (1, '2024-04-27T10:39:00Z'),
        (1, '2024-04-27T10:40:00Z'),
        (1, '2024-04-27T10:50:00Z'),
        (1, '2024-04-27T10:55:00Z'),
        (1, '2024-04-27T11:00:00Z'),
        (1, '2024-04-27T11:15:00Z'),
        (1, '2024-04-27T11:30:00Z'),
        (1, '2024-04-27T11:45:00Z'),
        (1, '2024-04-27T12:00:00Z'),
        (1, '2024-04-27T12:15:00Z'),
        (1, '2024-04-27T12:30:00Z'),
        (1, '2024-04-27T13:00:00Z'),
        (1, '2024-04-27T13:30:00Z'),
        (1, '2024-04-27T14:00:00Z'),
        (2, '2024-04-27T10:00:00Z'),
        (2, '2024-04-27T10:07:00Z'),
        (2, '2024-04-27T10:14:00Z'),
        (2, '2024-04-27T10:21:00Z'),
        (2, '2024-04-27T10:28:00Z'),
        (2, '2024-04-27T10:35:00Z'),
        (2, '2024-04-27T10:42:00Z'),
        (2, '2024-04-27T10:49:00Z'),
        (2, '2024-04-27T10:56:00Z'),
        (2, '2024-04-27T11:03:00Z'),
        (2, '2024-04-27T11:10:00Z'),
        (2, '2024-04-27T11:17:00Z'),
        (2, '2024-04-27T11:24:00Z'),
        (2, '2024-04-27T11:31:00Z'),
        (2, '2024-04-27T11:38:00Z'),
        (2, '2024-04-27T11:45:00Z'),
        (2, '2024-04-27T11:52:00Z'),
        (2, '2024-04-27T11:59:00Z'),
        (3, '2024-04-27T10:03:00Z'),
        (3, '2024-04-27T10:12:00Z'),
        (3, '2024-04-27T10:21:00Z'),
        (3, '2024-04-27T10:30:00Z'),
        (3, '2024-04-27T10:39:00Z')
      ;`);
});

db.close();
