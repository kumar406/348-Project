// server.js

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Accounts(id INTEGER PRIMARY KEY, description TEXT)"
    );
    db.run(
      "INSERT INTO Accounts VALUES (0, 'Standard')"
    );
    db.run(
      "INSERT INTO Accounts VALUES (1, 'Premium')"
    );
    db.run(
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, datejoined TEXT, accounttype int(11))"
    );
    /*
    CREATE TABLE Artists(id INTEGER PRIMARY KEY, name TEXT, genre TEXT);
    INSERT INTO Artists VALUES (1, 'Frank Ocean', 'R&B');
    INSERT INTO Artists VALUES (2, 'Doja Cat', 'Pop');
    INSERT INTO Artists VALUES (3, 'Ariana Grande', 'Pop');
    INSERT INTO Artists VALUES (4, 'Rihanna', 'Pop');
    INSERT INTO Artists VALUES (5, 'Kanye West', 'Hip hop');
    INSERT INTO Artists VALUES (6, 'J. Cole', 'Hip Hop');
    INSERT INTO Artists VALUES (7, 'Frank Sinatra', 'Jazz');
    INSERT INTO Artists VALUES (8, 'Green Day', 'Rock');
    INSERT INTO Artists VALUES (9, 'Coldplay', 'Pop');
    
    CREATE TABLE Song(id INTEGER PRIMARY KEY, title TEXT, length TEXT, genre TEXT);
    INSERT INTO  Song VALUES(1, 'Ivy', '4:09', 'R&B');
    INSERT INTO  Song VALUES(2, 'Say So', '3:57', 'Pop');
    INSERT INTO  Song VALUES(3, 'Dangerous Woman','3:55','Pop');
    INSERT INTO  Song VALUES(4, 'You Da One', '3:20','Pop');
    INSERT INTO  Song VALUES(5, 'Stronger', '5:11','Hip hop');
    INSERT INTO  Song VALUES(6, 'Love Yourz', '3:31','Hip hop');
    INSERT INTO  Song VALUES(7, 'Fly Me To the Moon', '2:27','Jazz');
    INSERT INTO  Song VALUES(8, 'American Idiot', '2:56','Rock');
    INSERT INTO  Song VALUES(9, 'Yellow', '4:26','Pop');
    */
    console.log("New table Users created");
    console.log("New table Accounts created");

  } else {
    console.log('Database "Users" ready to go!');
    db.each("SELECT * from Users", (err, row) => {
      if (row) {
        console.log(`record: ${row.username}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all the user in the database
app.get("/getUsers", (request, response) => {
  db.all("SELECT * from Users", (err, rows) => {
    response.send(JSON.stringify(rows));
  });
});

// endpoint to add a user to the database
app.post("/addUser", (request, response) => {
  console.log(`add to users table ${request.body.user}`);
  if (!process.env.DISALLOW_WRITE) {
    const cleansedfirst = cleanseString(request.body.first);
    const cleansedlast = cleanseString(request.body.last);
    const cleanseddate = cleanseString(request.body.date)
    const cleansedact = cleanseString(request.body.act);
    db.run(`INSERT INTO Users (firstname, lastname, datejoined, accounttype) VALUES (?,?,?,?)`, cleansedfirst, cleansedlast, cleanseddate, cleansedact, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

//search playlists
app.post("/getPlaylistByName", (request, response) => {
  console.log("Here is the name " + request.body.getPlaylistByName);
  const cleansedname = cleanseString(request.body.getPlaylistByName)
  db.all(`SELECT * from Playlists WHERE name='${cleansedname}'`, (err, rows) => {
    response.send(JSON.stringify(rows));
    console.log(rows);
  });
});

//search artists
app.post("/getArtistByGenre", (request, response) => {
  console.log("Here is the name " + request.body.getArtistByGenre);
  const cleansedgenre = cleanseString(request.body.getArtistByGenre);
  db.all(`SELECT * from Artists WHERE genre='${cleansedgenre}'`, (err, rows) => {
    response.send(JSON.stringify(rows));
    console.log(rows);
  })
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});