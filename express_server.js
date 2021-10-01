const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const PORT = 8080;
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

//middleware
const app = express();
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['my secret key', 'yet another secret key']
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// "DATABASES"
const urlDatabase = {
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

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("abc", 10)
  },
  "456": {
    id: "456",
    email: "user2@example.com",
    password: bcrypt.hashSync("def", 10)
  }
};

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
  let templateVars;
  // if they are not logged in (in other words, they don't have a user_id cookie)
  if (!req.session.user_id) {
    templateVars = {user: undefined};
  } else {
    let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
    templateVars = { urls: filteredDatabase, user: users[req.session.user_id] };
  }
  res.render("urls_index", templateVars);
});

//gets page for "creating a new URL"
app.get("/urls/new", (req, res) => {

  // if they are not logged in (in other words, they don't have a user_id cookie)
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

//gets page of that "info"/edit page for that shortURL
app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars;
  if (!req.session.user_id) {
    //if user is not logged in
    templateVars = {shortURL: true, longURL: undefined, user: undefined};
  } else {
    //check that the shortURL belongs to that user
    let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
    if (filteredDatabase[req.params.shortURL]) {
      //shortURL found and belongs to use
      templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.session.user_id] };
    } else if (urlDatabase[req.params.shortURL]) {
      //shortURL exists in master database, but does not belong to user
      templateVars = {shortURL: "exists", longURL: undefined, user: users[req.session.user_id]};
    } else {
      //shortURL does not exist in master database
      templateVars = {shortURL: "does not exist", longURL: undefined, user: users[req.session.user_id]};
    }
  }
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

//after entering a new URL, creating a random ShortURL for it and then saving it in urlDatabase
//finally redirects to "info"/edit page for that shortURL
app.post("/urls", (req, res) => {
  // if they are not logged in (in other words, they don't have a user_id cookie), stop them from POST
  console.log("line157", req.session.user_id);
  if (!req.session.user_id) {
    return res.status(401).send('you are not logged in');
  }
  
  console.log(req.body);  // Log the POST request body to the console
  const newShortURL = generateRandomString(6);
  console.log("urldatabase", urlDatabase);
  urlDatabase[newShortURL] = {
    longURL: req.body["longURL"],
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect("/urls/" + newShortURL);
});

//redirecting from "/u/:shortURL" to it's actual longURL
app.get("/u/:shortURL", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('that shortURL does not exist');
  }

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//deleting a shortURL/longURL entry
app.post("/urls/:shortURL/delete", (req, res) => {
  // if they are not logged in (in other words, they don't have a user_id cookie), stop them from POST
  if (!req.session.user_id) {
    return res.status(401).send('you are not logged in');
  }

  //check if the given shortURL id exists
  console.log(req.params);
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(401).send('??Sorry, that short URL does not exist.');
  }

  //check if user is owner of that URL
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (!filteredDatabase[req.params.shortURL]) {
    return res.status(401).send('Sorry, that URL does not belong to you.');
  }
  
  const shortURLKey = req.params.shortURL;
  delete urlDatabase[shortURLKey];
  res.redirect("/urls");
});

//updating a longURL
app.post("/urls/:id", (req, res) => {
  // if they are not logged in (in other words, they don't have a user_id cookie), stop them from POST
  if (!req.session.user_id) {
    console.log("cookies:",req.session.user_id);
    return res.status(401).send('RIGHT HERE: you are not logged in');
  }

  //check if the given shortURL id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(401).send('Sorry, that short URL does not exist.');
  }

  //check if user is owner of that URL
  let filteredDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (!filteredDatabase[req.params.id]) {
    return res.status(401).send('Sorry, that URL does not belong to you.');
  }

  const shortURLKey = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[shortURLKey]["longURL"] = newLongURL;
  res.redirect("/urls");
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//register endpoint: renders the register page
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

//register: checks email and password for errors, and then add to users database
//also sets user_id cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("no user name or password provided");
  }
  
  //returns user object associated with that email address
  const user = findUserByEmail(email, users);
  if (user) {
    return res.status(400).send("user already exists with that email");
  }
  
  //hash the password before storing in database
  const hashedPassword = bcrypt.hashSync(password, 10);

  const id = generateRandomString(3);
  //I know in ES6 that we dont have to use blah:blah to explicitly define key:value pairs, but I
  //want to write it like this so I understand better
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  console.log(users);
  req.session.user_id = users[id]["id"];
  res.redirect('/urls');
});

//login endpoint: renders the login page
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

//login: checks email and password for errors, also sets user_id cookie
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if client sent down blank email or password
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  //returns user object associated with that email address
  const user = findUserByEmail(email, users);

  // if that user exists with that email
  if (!user) {
    return res.status(403).send('No user with that email was found');
  }

  //Use bcrypt When Checking Passwords if they match
  //check if the password the user entered to login (after hashing) matches the stored+hashed password
  let passwordMatch = bcrypt.compareSync(password, user.password); //bool

  if (!passwordMatch) {
    return res.status(403).send('password does not match');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});