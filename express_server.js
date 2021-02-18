const PORT = 8080;
// Helper Functions
const {
  generateRandomString,
  message,
  validate,
  createUser,
} = require("./helper-functions/helpers");
const express = require("express");
const app = express();
// To make buffer data readable
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// EJS
app.set("view engine", "ejs");

// DATABASE OF URLs and USERS
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  AAA123: {
    id: "AAA123",
    email: "yamac.ozdil@gmail.com",
    password: "123",
  },
};

// REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.id], urls: urlDatabase };
  res.render("registration", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email) {
    //If email is provided, we have to verify if it exists on the database.
    const userId = createUser({ email, password }, users);
    if (userId) {
      res.cookie("id", userId);
      res.redirect("/urls");
    } else {
      res
        .status(400)
        .render("400", message("This email already exists in our system!"));
    }
  } else {
    res
      .status(400)
      .render("400", message("Please provide and email and a password!"));
  }
});

// LOGIN
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.id], urls: urlDatabase };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { user, error } = validate(email, password, users);
  if (user) {
    res.cookie("id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).render("403", message(error));
  }
});
// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/urls");
});

// URLS
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies.id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET /urls/new route
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.id], urls: urlDatabase };
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
    user: users[req.cookies.id],
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

// For invalid URLs render the error page (404.ejs)
app.get("*", (req, res) => {
  // display 404
  res.status(404).render("404");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});