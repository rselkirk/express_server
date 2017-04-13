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

function getUserObject(x) {
  let user = users[x];
  return user;
}

const users = { 
  "user1": {
    id: "user1", 
    email: "user1@example.com", 
    password: "purple"
  },
 "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "dishwasher"
  }
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
}

app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  for (let user in users) {
    let existingUser = (users[user].email);
    let existingPassword = (users[user].password);

     if (existingUser === loginEmail) {
      if (existingPassword === loginPassword) {
        res.cookie('username', users[user].id);
        res.redirect('/');
      } else if (existingPassword !== loginPassword) {
        res.status(403).send('Wrong Password!');
      }  
    }
  }
  res.status(403).send('User not registered!');
  });

app.get('/login', (req, res) => {
  res.render('user_login');
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

app.get('/register', (req, res) => {
  res.render('user_reg');
});

app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please enter an email and password!');
  } else if (req.body.email) {
    for (let user in users) {
      let existing = (users[user].email);
      if (existing === newEmail) {
      res.status(400).send('User already registered!');
    }
  }  
  } else {
  const id = generateRandomString();
  const user = req.body.email;
  const password = req.body.password;
  const templateVars = { user: user };
  users[id] = {};
  users[id]['id'] = id;
  users[id]['email'] = user;
  users[id]['password'] = password;
  res.cookie('user_Id', id);
  res.redirect('urls/new');
  console.log(users);
};
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls/new', (req, res) => {
  let user = getUserObject(req.cookies['user_Id']);
  const templateVars = { user: user };
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
  const user = getUserObject(req.cookies['user_Id']);
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = getUserObject(req.cookies['user_Id']);
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: user };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});