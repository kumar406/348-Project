// client-side js

const user = [];

// define variables that reference elements on the page
const usersForm = document.forms[0];
const firstInput = usersForm.elements["first"];
const lastInput = usersForm.elements["last"];
const actInput = usersForm.elements["act"];
const usersList = document.getElementById("users");
const clearButton = document.querySelector('#clear-users');

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

// listen for the form to be submitted and add a new user when it is
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