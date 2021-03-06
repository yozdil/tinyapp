const bcrypt = require("bcrypt");

// Random short url generator to be used by long url
const generateRandomString = () => {
  let rand = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rand;
};
// Turn a string to object(EJS rendering purposes)
const message = (str) => {
  return { message: str };
};

const validate = (email, password, data) => {
  let userArr = Object.values(data);
  const currentUser = userArr.find((user) => user.email === email);
  if (currentUser) {
    if (bcrypt.compareSync(password, currentUser.password)) {
      // successful login
      return { user: currentUser, error: null };
    } else {
      // failed at password
      return { user: null, error: "password" };
    }
  } else {
    // failed at email
    return { user: null, error: "email" };
  }
};

const createUser = (userInfo, data) => {
  const { email, password } = userInfo;
  const { user, error } = validate(email, password, data);
  if (error === "email") {
    // email doesn't exist on the database, so create.
    let userId = generateRandomString();
    userInfo.id = userId;
    data[userId] = userInfo;
    return userId;
  } else null;
};

// Validates the ID for any action that will be performed on the TinyApp
const isUser = (db, id) => {
  let newDB = {};
  for (const key in db) {
    if (db[key].userID === id) {
      newDB[key] = db[key];
    }
  }
  return newDB;
};
module.exports = {
  generateRandomString,
  message,
  validate,
  createUser,
  isUser,
};
