const express = require('express');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).split('').filter((value, index, self) => self.indexOf(value) === index).join('').substr(2, 6);
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const newlong = req.body.newURL;
  const tiny = req.params.id;
  urlDatabase[req.params.id] = newlong;
  res.redirect(`/urls/${tiny}`);
});

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const tiny = generateRandomString();
  urlDatabase[tiny] = req.body.longURL;
  res.redirect(`/urls/${tiny}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const key = req.params.shortURL;
  if (key in urlDatabase) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    const redirect = 'http://localhost:8080/urls/new';
    res.redirect(redirect);
  }
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username'] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
