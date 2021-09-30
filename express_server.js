const express = require("express");
const app = express();
var cookieParser = require('cookie-parser')

const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

//middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// "DATABASES"
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "123": {
    id: "123", 
    email: "user@example.com", 
    password: "abc"
  },
 "456": {
    id: "456", 
    email: "user2@example.com", 
    password: "def"
  }
};

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

function findUserByEmail(email) {
  for(const userId in users) {
    //loop through the UserId objects, and check each email against input email argument
    if (users[userId]["email"] === email) {
      return users[userId];
      //return true;
    }
  }
  return null;
  //return false;
}

//the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//returns urlDatabase in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//hidden /hello page lol
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//gets page of URL index
app.get("/urls", (req, res) => {
  console.log("what is this:", users[req.cookies.user_id]);
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//gets page for "creating a new URL"
app.get("/urls/new", (req, res) => {
  //console.log("what is this:", req.cookies);
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

//gets page of that "info"/edit page for that shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//after entering a new URL, creating a random ShortURL for it and then saving it in urlDatabase
//finally redirects to "info"/edit page for that shortURL
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const newShortURL = generateRandomString(6);
  urlDatabase[newShortURL] = req.body["longURL"];
  console.log(urlDatabase);
  res.redirect("/urls/"+newShortURL);
});

//redirecting from "/u/:shortURL" to it's actual longURL
app.get("/u/:shortURL", (req, res) => {
  //const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//deleting a shortURL/longURL entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLKey = req.params.shortURL;
  delete urlDatabase[shortURLKey];
  res.redirect("/urls");
});

//updating a longURL
app.post("/urls/:id", (req, res) => {
  const shortURLKey = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[shortURLKey] = newLongURL;
  res.redirect("/urls");
});

//logout route
app.post("/logout", (req, res) => {
  //const usernameEntered = req.body.username;
  //console.log("usernameEntered",usernameEntered);
  //res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//register endpoint: renders the register page
app.get('/register', (req, res) => {
  res.render('register');
});

//register: checks email and password for errors, and then add to users database
//also sets user_id cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if(!email || !password) {
    return res.status(400).send("no user name or password provided");
  }
  
  //returns user object associated with that email address
  const user = findUserByEmail(email);
  if (user) {
    return res.status(400).send("user already exists with that email");
  }
  
  const id = generateRandomString(3);
  //I know in ES6 that we dont have to use blah:blah to explicitly define key:value pairs, but I
  //want to write it like this so I understand better
  users[id] = {
    id: id, 
    email: email,
    password: password
  }
  //console.log(users);
  res.cookie("user_id", users[id]["id"]);
  res.redirect('/urls');
})

//login endpoint: renders the login page
app.get('/login', (req, res) => {
  res.render('login');
});

//login: checks email and password for errors, also sets user_id cookie
app.post('/login', (req, res) => {
  //console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  // check if client sent down blank email or password
  if( !email || !password ) {
    return res.status(400).send("email or password cannot be blank");
  }

  //returns user object associated with that email address
  const user = findUserByEmail(email);

  // if that user exists with that email
  if (!user) {
    return res.status(403).send('no user with that email was found');
  }

  // does the password provided from the request
  // match the password of the user
  if (user.password !== password) {
    return res.status(403).send('password does not match')
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});