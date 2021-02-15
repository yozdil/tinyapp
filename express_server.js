const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
// To make buffer data readable
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
  "9sm5xK": "http://www.google.com"
};

// URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// POST
app.post("/urls", (req, res) => {
  let sURL = generateRandomString();
  urlDatabase[sURL] = req.body.longURL; //Save body-parser value to urlDatabase
  res.redirect(`/urls/${sURL}`); // Redirect to the created short URL.
});

// GET /urls/new route
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Redirect /u:shortURL to the corresponding webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// GET /urls/:id route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// // JSON
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
