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
    db.run("CREATE TABLE Accounts(id INTEGER PRIMARY KEY, description TEXT)");
    db.run("INSERT INTO Accounts VALUES (0, 'Standard')");
    db.run("INSERT INTO Accounts VALUES (1, 'Premium')");
    db.run(
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, datejoined TEXT, accounttype int(11))"
    );
    /*
    CREATE TABLE Artist(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, genre TEXT);
    INSERT INTO Artist VALUES (1, 'Frank Ocean', 'R&B');
    INSERT INTO Artist VALUES (2, 'Doja Cat', 'Pop');
    INSERT INTO Artist VALUES (3, 'Ariana Grande', 'Pop');
    INSERT INTO Artist VALUES (4, 'Rihanna', 'Pop');
    INSERT INTO Artist VALUES (5, 'Kanye West', 'Hip hop');
    INSERT INTO Artist VALUES (6, 'J. Cole', 'Hip Hop');
    INSERT INTO Artist VALUES (7, 'Frank Sinatra', 'Jazz');
    INSERT INTO Artist VALUES (8, 'Green Day', 'Rock');
    INSERT INTO Artist VALUES (9, 'Coldplay', 'Pop');
    
    CREATE TABLE Songs(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, length TEXT, genre TEXT);
    INSERT INTO  Songs VALUES(1, 'Ivy', '4:09', 'R&B');
    INSERT INTO  Songs VALUES(2, 'Say So', '3:57', 'Pop');
    INSERT INTO  Songs VALUES(3, 'Dangerous Woman','3:55','Pop');
    INSERT INTO  Songs VALUES(4, 'You Da One', '3:20','Pop');
    INSERT INTO  Songs VALUES(5, 'Stronger', '5:11','Hip hop');
    INSERT INTO  Songs VALUES(6, 'Love Yourz', '3:31','Hip hop');
    INSERT INTO  Songs VALUES(7, 'Fly Me To the Moon', '2:27','Jazz');
    INSERT INTO  Songs VALUES(8, 'American Idiot', '2:56','Rock');
    INSERT INTO  Songs VALUES(9, 'Yellow', '4:26','Pop');
    
    CREATE TABLE Album(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, num_songs TEXT, genre TEXT);
    INSERT INTO Albums VALUES(1, 'Blonde', '17', 'Pop');
    INSERT INTO Albums VALUES(2, 'Hot Pink', '12', 'R&B');
    INSERT INTO Albums VALUES(3, 'Dangerous Woman', '9', 'Pop');
    INSERT INTO Albums VALUES(4, 'Talk that Talk', '13', 'Pop');
    INSERT INTO Albums VALUES(5, 'Graduation', '15', 'Hip Hop');
    INSERT INTO Albums VALUES(6, '2014 Forest Hills Drive', '13', 'Hip Hop');
    INSERT INTO Albums VALUES(7, 'It Might as Well be Swing', '12', 'Jazz');
    INSERT INTO Albums VALUES(8, 'American Idiot', '9', 'Rock');
    INSERT INTO Albums VALUES(9, 'Parachutes', '11', 'Pop');  
        
    CREATE TABLE Playlists(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, datecreated TEXT);
    INSERT INTO Playlists VALUES(1, 'My Pop Songs', '04/18/2019');
    INSERT INTO Playlists VALUES(2, 'Joey\'s Favorite', '02/27/2016');
    INSERT INTO Playlists VALUES(3, 'Workout Playlist', '4/20/2020');
    INSERT INTO Playlists VALUES(4, 'My Emo Phase', '6/29/2010');  
    
    CREATE TABLE playlist_song_rel(song_id INTEGER, playlist_id INTEGER);
    INSERT INTO playlist_song_rel VALUES(2, 1);
    INSERT INTO playlist_song_rel VALUES(3, 1);
    INSERT INTO playlist_song_rel VALUES(4, 1);
    
    CREATE TABLE playlist_user_rel(user_id INTEGER, playlist_id INTEGER);
    INSERT INTO playlist_user_rel VALUES(1, 1);
    INSERT INTO playlist_user_rel VALUES(2, 3);
    
    CREATE TABLE listened_to(user_id INTEGER, song_id INTEGER);
    INSERT INTO listened_to VALUES(1, 5);
    INSERT INTO listened_to VALUES(2, 6);
    INSERT INTO listened_to VALUES(3, 4);
    
    CREATE TABLE album_song_rel(album_id INTEGER, song_id INTEGER);
    INSERT INTO album_song_rel VALUES(1, 1);
    INSERT INTO album_song_rel VALUES(2, 2);
    INSERT INTO album_song_rel VALUES(3, 3);
    INSERT INTO album_song_rel VALUES(4, 4);
    INSERT INTO album_song_rel VALUES(5, 5);
    INSERT INTO album_song_rel VALUES(6, 6);
    INSERT INTO album_song_rel VALUES(7, 7);
    INSERT INTO album_song_rel VALUES(8, 8);
    INSERT INTO album_song_rel VALUES(9, 9);
    
    CREATE TABLE album_artist_rel(album_id INTEGER, artist_id INTEGER);
    INSERT INTO album_artist_rel VALUES(1, 1);
    INSERT INTO album_artist_rel VALUES(2, 2);
    INSERT INTO album_artist_rel VALUES(3, 3);
    INSERT INTO album_artist_rel VALUES(4, 4);
    INSERT INTO album_artist_rel VALUES(5, 5);
    INSERT INTO album_artist_rel VALUES(6, 6);
    INSERT INTO album_artist_rel VALUES(7, 7);
    INSERT INTO album_artist_rel VALUES(8, 8);
    INSERT INTO album_artist_rel VALUES(9, 9); 
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
    const cleanseddate = cleanseString(request.body.date);
    const cleansedact = cleanseString(request.body.act);
    db.run(
      `INSERT INTO Users (firstname, lastname, datejoined, accounttype) VALUES (?,?,?,?)`,
      cleansedfirst,
      cleansedlast,
      cleanseddate,
      cleansedact,
      error => {
        if (error) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

//search playlists
app.post("/getPlaylistByName", (request, response) => {
  console.log("Here is the name " + request.body.getPlaylistByName);
  const cleansedname = cleanseString(request.body.getPlaylistByName);
  db.all(
    `select u.firstname, p.name, p.datecreated from Playlists p join playlist_user_rel purel on p.id=purel.playlist_id join Users u on purel.user_id=u.id where name='${cleansedname}'`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
      console.log(rows);
    }
  );
});

//search artists
app.post("/getSongsByArtist", (request, response) => {
  console.log("Here is the name in server " + request.body.getSongsByArtist);
  const cleansedartist = cleanseString(request.body.getSongsByArtist);
  db.all(
    `select s.title, s.genre from Songs s join album_song_rel asrel on s.id=asrel.song_id join Albums al on asrel.album_id=al.id join album_artist_rel aarel on al.id=aarel.album_id join Artists ar on ar.id=aarel.artist_id where ar.name='${cleansedartist}'`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
      console.log(rows);
    }
  );
});

//search songs listened to by user
app.post("/getSongsByUsername", (request, response) => {
  console.log("Here is the name in server" + request.body.getSongsByUsername);
  const cleansedname = cleanseString(request.body.getSongsByUsername);
  db.all(
    `select s.title, s.genre from Songs s join listened_to lt on s.id=lt.song_id join Users u on lt.user_id=u.id where u.firstname='${cleansedname}'`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
      console.log(rows);
    }
  );
});

//update user's account type
app.post("/updateUserAcc", (request, response) => {
  const cleansedfirst = cleanseString(request.body.first);
  const cleansedlast = cleanseString(request.body.last);
  const cleansedacc = cleanseString(request.body.acc);
  db.all(
    `UPDATE Users SET accounttype=${cleansedacc} where firstname='${cleansedfirst}' and lastname='${cleansedlast}'`,
    (err, rows) => {
      if (err) {
        response.send(JSON.stringify("error"));
      } else {
        response.send(JSON.stringify("success"));
      }
    }
  );
});

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
