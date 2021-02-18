const PORT = 8080;
// HELPER FUNCS
const {
  generateRandomString,
  message,
  validate,
  createUser,
  isUser,
} = require("./helper-functions/helpers");

const express = require("express");
const app = express();
// MIDDLEWARES
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["tiny"],
  })
);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// DATABASE OF URLS and USERID
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
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("registration", templateVars);
});
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  password = bcrypt.hashSync(password, 10); //password hash
  if (email) {
    //If email is provided, we have to verify if it exists on the database.
    const userId = createUser({ email, password }, users);
    if (userId) {
      req.session.user_id = userId;
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

// LOGIN & LOGOUT
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  const { user, error } = validate(email, password, users);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).render("403", message(error));
  }
});
app.post("/logout", (req, res) => {
  req.session = null; // To destroy the current session
  res.redirect("/urls");
});

// URLS
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[id], urls: isUser(urlDatabase, id) };
    res.render("urls_index", templateVars);
  }
});
// CREATE A NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[id], urls: isUser(urlDatabase, id) };
    res.render("urls_new", templateVars);
  }
});
// VISIT THE WEBPAGE VIA SHORTURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(404).render("404");
  }
  res.redirect(longURL);
});
// INFO PAGE OF THE SHORTURL (LONGURL EDIT PAGE)
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
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
// GENERATING A NEW SHORTURL FOR A NEW WEBSITE
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  let sURL = generateRandomString();
  let { longURL } = req.body;
  urlDatabase[sURL] = { longURL, userID };
  res.redirect(`/urls/${sURL}`); // Redirect to the created short URL.
});
// SUBMITTING AN EDIT OF LONGURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  let userDB = isUser(urlDatabase, userID);

  if (userDB[shortURL]) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).render("403", message("You cannot edit this page!"));
  }
});

// SHORT URL DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).render("403", message("You cannot edit this page!"));
  }
  res.redirect("/urls");
});

// INVALID PATH
app.get("*", (req, res) => {
  res.status(404).render("404");
});

// ON SERVER CREATION
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
