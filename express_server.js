const PORT = 8080;
const express = require("express");
const app = express();
// To make buffer data readable
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// Random short url generator to be used by long url
const generateRandomString = () => {
  let rand = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 7; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rand;
};

// DATABASE
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// URLS
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("registration", templateVars);
});

// GET /urls/new route
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// Redirection to the webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.status(404).render("404");
  }
  res.redirect(longURL);
});

// GET /urls/:id route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// Creation of a new key for a given address.
app.post("/urls", (req, res) => {
  let sURL = generateRandomString();
  urlDatabase[sURL] = req.body.longURL; //Save body-parser value to urlDatabase
  res.redirect(`/urls/${sURL}`); // Redirect to the created short URL.
});

// Registration page
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  }

res.cookie("username", req.body.email);

res.redirect("/urls");
});

// Submit an Edit of long url for the same short url
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Deletion for a given key address.
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// LOGIN --> COOKIES
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// LOGOUT --> COOKIES
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  // console.log(req.body.username); //This is to display the username provided
  res.redirect("/urls");
});

// For invalid URLs render the error page (404.ejs)
app.get("*", (req, res) => {
  // display 404
  res.status(404).render("404");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// // JSON
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
