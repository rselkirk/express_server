var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).split('').filter (function (value, index, self) {
    return self.indexOf(value) === index;
  }).join('').substr(2,6);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let tiny = generateRandomString();
  urlDatabase[tiny] = req.body.longURL;
  console.log(urlDatabase);
  let redirectURL = `http://localhost:8080/urls/${tiny}`;
  res.redirect(301, redirectURL);
});

app.get("/u/:shortURL", (req, res) => {
  let key = req.params.shortURL
  if (key in urlDatabase) {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    let redirect = 'http://localhost:8080/urls/new';
    res.redirect(redirect);
  }

});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});