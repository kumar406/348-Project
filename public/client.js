// client-side js
// run by the browser each time your view template referencing it is loaded

const users = [];

// define variables that reference elements on our page
const usersForm = document.forms[0];
const userInput = usersForm.elements["user"];
const usersList = document.getElementById("users");
const clearButton = document.querySelector('#clear-users');

// request the dreams from our app's sqlite database
fetch("/getUsers", {})
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      appendNewUser(row.username);
    });
  });

// a helper function that creates a list item for a given dream
const appendNewUser = user => {
  const newListItem = document.createElement("li");
  newListItem.innerText = user;
  usersList.appendChild(newListItem);
};

// listen for the form to be submitted and add a new dream when it is
usersForm.onsubmit = event => {
  // stop our form submission from refreshing the page
  event.preventDefault();
  const data = { user: userInput.value };

  fetch("/addUser", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });
  // get user value and add it to the list
  users.push(userInput.value);
  appendNewUser(userInput.value);

  // reset form
  userInput.value = "";
  userInput.focus();
};

clearButton.addEventListener('click', event => {
  fetch("/clearUsers", {})
    .then(res => res.json())
    .then(response => {
      console.log("cleared users");
    });
  usersList.innerHTML = "";
});
