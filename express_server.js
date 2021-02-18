const PORT = 8080;
// Helper Functions
const {
  generateRandomString,
  message,
  validate,
  createUser,
  isUser,
} = require("./helper-functions/helpers");
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
// To make buffer data readable
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// EJS
app.set("view engine", "ejs");

// DATABASE OF URLs and USERID
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "BBB456" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "AAA123" },
};

const users = {
  BBB456: {
    id: "BBB456",
    email: "yamac.ozdil@gmail.com",
    password: "$2b$10$Ojyazxj0Lg3uXTttzUXvqe6F72x9ikeJnXIjIGFbsS2cOZIL1ATpS", //qwe
  },
  AAA123: {
    id: "AAA123",
    email: "yamac.ozdil@yahoo.ca",
    password: "$2b$10$4C/EVYjW55QnVZhpZqSp5ux8afrrH2hvi25k3YxCJ.amOjsApY2/y", //123
  },
};

// REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.id], urls: urlDatabase };
  res.render("registration", templateVars);
});
app.post("/register", (req, res) => {
  let { email, password } = req.body;

  password = bcrypt.hashSync(password, 10); //password hash

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
  let { email, password } = req.body;
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
  const id = req.cookies.id;
  if (!id) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[id], urls: isUser(urlDatabase, id) };
    res.render("urls_index", templateVars);
  }
});

// GET /urls/new route
app.get("/urls/new", (req, res) => {
  const id = req.cookies.id;
  if (!id) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[id], urls: isUser(urlDatabase, id) };
    res.render("urls_new", templateVars);
  }
});

// Redirection to the webpage
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(404).render("404");
  }
  res.redirect(longURL);
});

// GET /urls/:id route
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.id;
  let { shortURL } = req.params;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).render("404");
  } else {
    if (urlDatabase[shortURL].userID !== id) {
      //If another user tries to visit the given shortURL
      res.status(403).render("403", message("You cannot edit this page!"));
    } else {
      const user = id ? users[id] : null;
      if (user && urlDatabase[shortURL].longURL) {
        const templateVars = {
          user,
          shortURL,
          longURL: urlDatabase[shortURL].longURL,
        };
        res.render("urls_show", templateVars);
      } else {
        res.status(404).render("404");
      }
    }
  }
});

// Creation of a new key for a given address.
app.post("/urls", (req, res) => {
  const userID = req.cookies.id;
  let sURL = generateRandomString();
  let { longURL } = req.body;

  urlDatabase[sURL] = { longURL, userID };

  res.redirect(`/urls/${sURL}`); // Redirect to the created short URL.
});

// Submit an Edit of long url for the same short url
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.id;
  const shortURL = req.params.shortURL;
  let userDB = isUser(urlDatabase, userID);

  if (userDB[shortURL]) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).render("403", message("You cannot edit this page!"));
  }
});

// Deletion for a given key address.
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.id;
  if (id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).render("403", message("You cannot edit this page!"));
  }
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
