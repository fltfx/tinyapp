function findUserByEmail(email, users) {
  for(const userId in users) {
    //loop through the UserId objects, and check each email against input email argument
    if (users[userId]["email"] === email) {
      //return user object
      return users[userId];
    }
  }
  return null;
}

//function to generate a random String (6 char) for shortURL
function generateRandomString(lengthOfStr) {
  let sliceIndex;
  if (lengthOfStr === 6) {
    sliceIndex = 7;
  } else if (lengthOfStr === 3) {
    sliceIndex = 10;
  }

  let randomStr = Math.random().toString(36).slice(sliceIndex);
  if (randomStr.length < lengthOfStr) {
    //add another "0" to the end if randomStr is only lengthOfStr-1 in length
    randomStr += "0";
  }
  return randomStr;
}

function urlsForUser(id, urlDatabase) {
  let filteredDatabase = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      filteredDatabase[url] = urlDatabase[url];
    }
  }
  return filteredDatabase;
}

module.exports = { findUserByEmail, generateRandomString, urlsForUser};