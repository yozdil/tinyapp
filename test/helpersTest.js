const { assert, expect } = require("chai");
const bcrypt = require("bcrypt");



const {
  generateRandomString,
  message,
  validate,
  createUser,
  isUser,
} = require("../helper-functions/helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

describe("generateRandomString", function () {
  it("should return a random string with 6 characters", function () {
    const randStr = generateRandomString();
    assert.equal(randStr.length, 6)
  });
});
describe("message", function () {
  it("should return an object with message as key and the string as value", function () {
    const msg = message('hello')
    assert.equal(msg.message, 'hello')
  });
});
describe("validate", function () {
  it("should return a { user: user object, error: null } object for a succeful login", function () {
    let result =validate("user2@example.com", "dishwasher-funk", testUsers);
    expect(result).to.include({ "user": testUsers.user2RandomID, "error": null })
  });
  it("should return a { user: null, error: password } for a failed password", function () {
    let result =validate("user2@example.com", "wrong password", testUsers);
    expect(result).to.include({ "user": null, "error": "password" });
  });
  it("should return a { user: null, error: email } for a failed email", function () {
    let result =validate("some wrong email!!!", "dishwasher-funk", testUsers);
    expect(result).to.include({ "user": null, "error": "email" });
  });
});
describe("createUser", function () {
  it("should return a { user: user object, error: null } object for a succeful login", function () {
    let result =validate("user2@example.com", "dishwasher-funk", testUsers);
    expect(result).to.include({ "user": testUsers.user2RandomID, "error": null })
  });
  it("should return a { user: null, error: password } for a failed password", function () {
    let result =validate("user2@example.com", "wrong password", testUsers);
    expect(result).to.include({ "user": null, "error": "password" });
  });
  it("should return a { user: null, error: email } for a failed email", function () {
    let result =validate("some wrong email!!!", "dishwasher-funk", testUsers);
    expect(result).to.include({ "user": null, "error": "email" });
  });
});
