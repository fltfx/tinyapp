const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//function to generate a randome String (6 char) for shortURL
function generateRandomString() {
  let randomStr = Math.random().toString(36).slice(7);
  if (randomStr.length < 6) {
    //add another "0" to the end if randomStr is only 5 chars
    randomStr += "0";
  }
  return randomStr;
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//gets page for "creating a new URL"
app.get("/urls/new", (req, res) => {
  //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_new");
});

//gets page of that "info"/edit page for that shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//after entering a new URL, creating a random ShortURL for it and then saving it in urlDatabase
//finally redirects to "info"/edit page for that shortURL
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const newShortURL = generateRandomString();
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});