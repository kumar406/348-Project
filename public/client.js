// client-side js

//User List Form
const usersForm = document.forms[0];
const firstInput = usersForm.elements["first"];
const lastInput = usersForm.elements["last"];
const actInput = usersForm.elements["act"];
const usersList = document.getElementById("users");

//Search for playlist-by-genre Form
const playlistForm = document.forms[1];
const pnameInput = playlistForm.elements["playlistbyname"];
const tbPlaylistSearchItem = document.getElementById("playlist_name");

//Search for songs-by-artist Form
const artistForm = document.forms[2];
const songInput = artistForm.elements["songsbyartist"];
const tbArtistSearchItem = document.getElementById("song_artist");

//Search for songs-by-name Form
const songsForm = document.forms[3];
const snameInput = songsForm.elements["songsbyname"];
const tbSongSearchItem = document.getElementById("username_song");

//Update user account-type
const updateAccForm = document.forms[4];
const updateAccInput = updateAccForm.elements["updateacctype"];
const updateAccSORP = updateAccForm.elements["actupdate"];

//Update Website Stats
const websiteStatsForm = document.forms[5];
const tbWebsiteStats = document.getElementById("website_stats");

//updates the user table on the page
const appendNewUser = user => {
  const newTrItem = document.createElement("tr");
  const firstTdItem = document.createElement("td");
  firstTdItem.innerHTML = user.first;
  const lastTdItem = document.createElement("td");
  lastTdItem.innerHTML = user.last;
  const dateTdItem = document.createElement("td");
  dateTdItem.innerHTML = user.date;
  const idTdItem = document.createElement("td");
  idTdItem.innerHTML = user.id;

  newTrItem.appendChild(idTdItem);
  newTrItem.appendChild(firstTdItem);
  newTrItem.appendChild(lastTdItem);
  newTrItem.appendChild(dateTdItem);

  const tbItem = document.getElementById("user_table");
  tbItem.appendChild(newTrItem);
};

//create a new row for playlist search
const createPlaylistTable = playlist => {
  const newTrItem = document.createElement("tr");
  const createdByTdItem = document.createElement("td");
  createdByTdItem.innerHTML = playlist.firstname;
  const nameTdItem = document.createElement("td");
  nameTdItem.innerHTML = playlist.name;
  const dateTdItem = document.createElement("td");
  dateTdItem.innerHTML = playlist.datecreated;

  newTrItem.appendChild(createdByTdItem);
  newTrItem.appendChild(nameTdItem);
  newTrItem.appendChild(dateTdItem);

  tbPlaylistSearchItem.appendChild(newTrItem);
};

//create a new row for the artist search
const createSongArtistTable = artist => {
  const newTrItem = document.createElement("tr");
  const songTdItem = document.createElement("td");
  songTdItem.innerHTML = artist.title;
  const genreTdItem = document.createElement("td");
  genreTdItem.innerHTML = artist.genre;

  newTrItem.appendChild(songTdItem);
  newTrItem.appendChild(genreTdItem);

  tbArtistSearchItem.appendChild(newTrItem);
};

//create a new row for the songs listened to search
const createSongsTable = song => {
  const newTrItem = document.createElement("tr");
  const songnameTdItem = document.createElement("td");
  songnameTdItem.innerHTML = song.title;
  const genreTdItem = document.createElement("td");
  genreTdItem.innerHTML = song.genre;

  newTrItem.appendChild(songnameTdItem);
  newTrItem.appendChild(genreTdItem);

  tbSongSearchItem.appendChild(newTrItem);
};

//create a new row for the website stats
const createWebsiteStats = stats => {
  const newTrItem = document.createElement("tr");
  const usernumTdItem = document.createElement("td");
  usernumTdItem.innerHTML = stats.user;
  const artistnumTdItem = document.createElement("td");
  artistnumTdItem.innerHTML = stats.artist;
  const playlistnumTdItem = document.createElement("td");
  playlistnumTdItem.innerHTML = stats.playlist;
  const topsongTdItem = document.createElement("td");
  topsongTdItem.innerHTML = stats.top_song;

  newTrItem.appendChild(usernumTdItem);
  newTrItem.appendChild(artistnumTdItem);
  newTrItem.appendChild(playlistnumTdItem);
  newTrItem.appendChild(topsongTdItem);

  tbWebsiteStats.appendChild(newTrItem);
};

//add a new user to the list when submitted
usersForm.onsubmit = event => {
  //stop the form submission from refreshing the page
  event.preventDefault();
  const date = new Date().toLocaleDateString();
  const data = {
    first: firstInput.value,
    last: lastInput.value,
    date: date,
    act: actInput.value
  };

  fetch("/addUser", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });

  fetch("/getUsers", {})
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      appendNewUser({
        id: row.id,
        first: row.firstname,
        last: row.lastname,
        date: row.datejoined
      });
    });
  });

  //reset form
  firstInput.value = "";
  firstInput.focus();
  lastInput.value = "";
  actInput.value = 0;
};

//submission for search for playlists
playlistForm.onsubmit = event => {
  event.preventDefault();
  //remove previous entries
  while (tbPlaylistSearchItem.firstChild) {
    tbPlaylistSearchItem.removeChild(tbPlaylistSearchItem.firstChild);
  }
  console.log("Here is the name " + pnameInput.value);
  fetch("/getPlaylistByName", {
    method: "POST",
    body: JSON.stringify({ getPlaylistByName: pnameInput.value }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      response.forEach(row => {
        createPlaylistTable(row);
      });
    });
};

//submission for search for songs by artist
artistForm.onsubmit = event => {
  event.preventDefault();
  //remove previous entries
  while (tbArtistSearchItem.firstChild) {
    tbArtistSearchItem.removeChild(tbArtistSearchItem.firstChild);
  }
  console.log("Here is the genre " + songInput.value);

  fetch("/getSongsByArtist", {
    method: "POST",
    body: JSON.stringify({ getSongsByArtist: songInput.value }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      response.forEach(row => {
        createSongArtistTable(row);
      });
    });
};

//submission for listening to songs
songsForm.onsubmit = event => {
  event.preventDefault();
  //remove previous entries
  while (tbSongSearchItem.firstChild) {
    tbSongSearchItem.removeChild(tbSongSearchItem.firstChild);
  }
  fetch("/getSongsByUsername", {
    method: "POST",
    body: JSON.stringify({ getSongsByUsername: snameInput.value }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      response.forEach(row => {
        createSongsTable(row);
      });
    });
};

//update the user's account type on submit
updateAccForm.onsubmit = event => {
  event.preventDefault();
  console.log("Here is the id for acc update" + updateAccInput.value);
  console.log("Here is the value for the acc update" + updateAccSORP.value);
  const data = {
    id: updateAccInput.value,
    acc: updateAccSORP.value
  };

  fetch("/updateUserAcc", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      document.getElementById("accupdateresponse").innerHTML = JSON.stringify(response);
    });
};

//update the website stats
websiteStatsForm.onsubmit = event => {
  event.preventDefault();
  while (tbWebsiteStats.firstChild) {
    tbWebsiteStats.removeChild(tbWebsiteStats.firstChild);
  }
  fetch("/getWebsiteStats", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      response.forEach(row => {
        createWebsiteStats(row);
      });
    });
};
