// server.js

// init project
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");
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
const sequelize = new Sequelize("sqlite::memory:");

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

class Account extends Model {}
Account.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    description: DataTypes.TEXT
  },
  { sequelize, modelName: "account" }
);

(async () => {
  await sequelize.sync();
  try {
    const standard = await Account.build({
      id: 0,
      description: "Standard"
    });
    console.log(standard.toJSON());
    await standard.save();
    console.log("Standard was saved to the database!");
  } catch (err) {
    console.log(err);
  }

  try {
    const premium = await Account.build({
      id: 1,
      description: "Premium"
    });
    console.log(premium.toJSON());
    await premium.save();
    console.log("Premium was saved to the database!");
  } catch (err) {
    console.log(err);
  }
})();

class Playlist extends Model {}
Playlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: DataTypes.TEXT,
    datecreated: DataTypes.DATE
  },
  { sequelize, modelName: "playlist" }
);

(async () => {
  await sequelize.sync();
  try {
    const playlist1 = await Playlist.build({
      id: 0,
      name: "My Pop Songs",
      datecreated: new Date(2021, 4, 23)
    });
    console.log(playlist1.toJSON());
    await playlist1.save();
    console.log("playlist1 was saved to the database!");
  } catch (err) {
    console.log(err);
  }

  try {
    const playlist2 = await Playlist.build({
      id: 1,
      name: "My Emo Phase",
      datecreated: new Date(2021, 4, 23)
    });
    console.log(playlist2.toJSON());
    await playlist2.save();
    console.log("playlist2 was saved to the database!");
  } catch (err) {
    console.log(err);
  }
})();

sequelize.sync();

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, datejoined TEXT, accounttype int(11))"
    );
    console.log("New table Users created");
  } else {
    console.log('Database "Music-Streaming-Service" ready to go!');
    //
    db.run(`PRAGMA read_uncommitted = 0`);
    // start indexes
    db.run(`CREATE INDEX IF NOT EXISTS ind_one ON Playlists(name)`);
    db.run(`CREATE INDEX IF NOT EXISTS ind_two ON Artists(name)`);
    db.run(`CREATE INDEX IF NOT EXISTS ind_three ON Users(id)`);
    db.run(`CREATE INDEX IF NOT EXISTS ind_four ON Songs(id)`);
    // end indexes
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
    db.run(`BEGIN TRANSACTION EXCLUSIVE;`);
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
    db.run(`COMMIT;`);
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
  const cleansedId = cleanseString(request.body.getSongsByUsername);
  db.all(
    `select s.title, s.genre from Songs s join listened_to lt on s.id=lt.song_id join Users u on lt.user_id=u.id where u.id='${cleansedId}'`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
      console.log(rows);
    }
  );
});

//update user's account type
app.post("/updateUserAcc", (request, response) => {
  const cleansedId = cleanseString(request.body.id);
  const cleansedacc = cleanseString(request.body.acc);
  db.run(`BEGIN EXCLUSIVE;`);
  db.all(
    `UPDATE Users SET accounttype=${cleansedacc} where id='${cleansedId}'`,
    (err, rows) => {
      if (err) {
        response.send(JSON.stringify("Whoops! An error occurred."));
      } else {
        response.send(JSON.stringify("Success! Account updated successfully."));
      }
    }
  );
  db.run(`COMMIT;`);
});

app.post("/getWebsiteStats", (request, response) => {
  db.run(`PRAGMA read_uncommitted = 1`);
  db.all(
    `select (select count(u.id) from Users u) as user, (select count(a.id) from Artists a) as artist, (select count(p.id) from Playlists p) as playlist, (select s.title from Songs s where s.id=(select song_id from (select song_id, count(*) as cnt from listened_to group by song_id order by count(*) desc limit 1) x)) as top_song`,
    (err, rows) => {
      response.send(JSON.stringify(rows));
      console.log(rows);
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
