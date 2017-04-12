const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).split('').filter((value, index, self) => self.indexOf(value) === index).join('').substr(2, 6);
}

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

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
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  const tiny = generateRandomString();
  urlDatabase[tiny] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${tiny}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls')
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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
