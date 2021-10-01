const { assert } = require('chai');

//const { findUserByEmail } = require('../helpers.js');
const { findUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
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
};

const testUrlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  },
  a12345: {
    longURL: "https://www.google.com",
    userID: "456"
  },
  b23456: {
    longURL: "https://www.apple.com",
    userID: "aJ48lW"
}
};

describe('findUserByEmail', function() {
  //findUserByEmail
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined', function() {
    const user = findUserByEmail("nobody@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  
  //generateRandomString > hard to test lol

  //urlsForUser
  it('should return urls associated with that user_id', function() {
    const urls = urlsForUser("456", testUrlDatabase)
    const expectedOutput = {
      a12345: {
        longURL: "https://www.google.com",
        userID: "456"
      }
    };
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return empty object associated with a user_id that does not exist', function() {
    const urls = urlsForUser("123", testUrlDatabase)
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });

});