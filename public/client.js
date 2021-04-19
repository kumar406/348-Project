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

//Search for artist-by-genre Form
const artistForm = document.forms[2];
const genreInput = artistForm.elements["artistbygenre"];
const tbArtistSearchItem = document.getElementById("artist_genre");

// request the users from the app's sqlite database
fetch("/getUsers", {})
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      appendNewUser({first:row.firstname,last:row.lastname,date:row.datejoined,act:row.accounttype});
    });
  });

// a helper function that updates the table on the page
const appendNewUser = user => {
  const newTrItem = document.createElement("tr");
  const firstTdItem = document.createElement("td");
  firstTdItem.innerHTML = user.first;
  const lastTdItem = document.createElement("td");
  lastTdItem.innerHTML = user.last;
  const dateTdItem = document.createElement("td");
  dateTdItem.innerHTML = user.date;
  const actTdItem = document.createElement("td");
  actTdItem.innerHTML = user.act;
  
  newTrItem.appendChild(firstTdItem);
  newTrItem.appendChild(lastTdItem);
  newTrItem.appendChild(dateTdItem);
  newTrItem.appendChild(actTdItem);
  
  const tbItem = document.getElementById("user_table")
  tbItem.appendChild(newTrItem);
};

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

const createArtistTable = artist => {
  const newTrItem = document.createElement("tr");
  const nameTdItem = document.createElement("td");
  nameTdItem.innerHTML = artist.name;
  const genreTdItem = document.createElement("td");
  genreTdItem.innerHTML = artist.genre;
  
  newTrItem.appendChild(nameTdItem);
  newTrItem.appendChild(genreTdItem);
  
  tbArtistSearchItem.appendChild(newTrItem);
}

// listen for userForm to be submitted and add a new user when it is
usersForm.onsubmit = event => {
  // stop our form submission from refreshing the page
  event.preventDefault();
  const date = new Date().toLocaleDateString();
  const data = {first: firstInput.value,last: lastInput.value,date: date,act:actInput.value};

  fetch("/addUser", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });
  
  appendNewUser(data);

  // reset form
  firstInput.value = "";
  firstInput.focus();
  lastInput.value = "";
  actInput.value = 0;
};

//Submission for search for playlists
playlistForm.onsubmit = event => {
  event.preventDefault();
  //Remove previous entries
  while (tbPlaylistSearchItem.firstChild) {
        tbPlaylistSearchItem.removeChild(tbPlaylistSearchItem.firstChild);
  }
  console.log("Here is the name " + pnameInput.value);
  fetch("/getPlaylistByName", {
    method: "POST",
    body: JSON.stringify({getPlaylistByName:pnameInput.value}),
    headers: { "Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      createPlaylistTable(row);
    });
  });
};

//Submission for search for artists
artistForm.onsubmit = event => {
  event.preventDefault();
  //Remove previous entries
  while (tbArtistSearchItem.firstChild) {
    tbArtistSearchItem.removeChild(tbArtistSearchItem.firstChild);
  } 
  console.log("Here is the genre " + genreInput.value);
  fetch("/getArtistByGenre", {
    method: "POST",
    body: JSON.stringify({getArtistByGenre:genreInput.value}),
    headers: { "Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      createArtistTable(row);
    });
  });
};
