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

const validate = (email, password, data) => {
  console.log(Object.values(data));
  let userArr = Object.values(data);
  const currentUser = userArr.find((user) => user.email === email);
  if (currentUser) {
    if (currentUser.password === password) {
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
    // email doesn't exist on the database
    let userId = generateRandomString();

    userInfo.id = userId;
    data[userId] = userInfo;

    return email;
  } else null;
};

module.exports = { generateRandomString, validate, createUser };
