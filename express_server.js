const express = require('express');
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();

const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(cookieSession({
   name: 'session',
   keys: ['lighthouse'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const auth = (req, res, next) => {
  if(req.session.user_id) {
    res.locals["user_Id"] = req.session.user_id;
    res.locals.urls = urlDatabase;
    next();
  } else {
    const templateVars = { user: undefined };
    res.status(401).render('user_error', templateVars);
  }
}

function generateRandomString() {
  return Math.random().toString(36).split('').filter((value, index, self) => self.indexOf(value) === index).join('').substr(2, 6);
}

function urlsForUser(id) {
  userList = [];
  for (let eachURL in urlDatabase) {
    if (urlDatabase[eachURL].userID === id) {
      userList.push(urlDatabase[eachURL]);
    }
  }
  return userList;
}

const users = { 
  "user1": {
    id: "user1", 
    email: "user1@example.com", 
    password: "$2a$10$ppUFtC8saYVqCbYlQ2STg..xv0.5Uy.XQYLUZoGg.eitUVn7pNAI6" //purple
  },
 "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "$2a$10$nYgj0etavqZs42nJ/QYB7eW4ltnklq5fKgaw2JRbCfyUBm/VP/BZO" //dishwasher
  }
}

const urlDatabase = {
  'b2xVn2': { tiny: 'b2xVn2', url: "http://www.lighthouselabs.ca", userID: "user1" },
  '9sm5xK': { tiny: '9sm5xK', url: 'http://www.google.com', userID: "user2" },
  '9sm5xK2': { tiny: '9sm5xK2', url: 'http://www.cbc.ca', userID: "user2" }
}

app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  for (let user in users) {
    let existingUser = (users[user].email);
    let existingPassword = (users[user].password);
    if (existingUser === loginEmail) {
      if (bcrypt.compareSync(loginPassword, existingPassword)) {
        req.session.user_id = users[user].id;
        res.redirect('/urls');
        return;       
      } else if (existingPassword !== loginPassword) {
        res.status(401).send('Wrong Password!');
        return;
      }  
    }
  }
  res.status(403).send('User not registered!');
});

app.get('/login', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user: user };
  if (req.session.user_id) {
    res.redirect ('/urls'); 
  } else {
  res.render('user_login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.post('/urls/:id', (req, res) => {
  const newlong = req.body.newURL;
  const tiny = req.params.id;
  urlDatabase[req.params.id].url = newlong;
  res.redirect(`/urls/${tiny}`);
});

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user: user };
  if (req.session.user_id) {
    res.redirect ('/urls');
  } else {
  res.render('user_reg', templateVars);
  }
});

app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  if (!req.body.email && !req.body.password) {
    res.status(400).send('Please enter an email and password!');
  } else if (req.body.email && !req.body.password) {
    res.status(400).send('Please enter a password!');
  } else if (req.body.email && req.body.password) {
    for (let user in users) {
      let existing = (users[user].email);
      if (existing === newEmail) {
        res.status(400).send('User already registered!');
        return;
      }
    }
    const id = generateRandomString();
    const user = req.body.email;
    const password = req.body.password;
    const templateVars = { user: user };
    const hashed_password = bcrypt.hashSync(password, 10);
    users[id] = {};
    users[id]['id'] = id;
    users[id]['email'] = user;
    users[id]['password'] = hashed_password;
    req.session.user_id = id;
    res.redirect('/');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', auth, (req, res) => {
  let user = req.session.user_id;
  const templateVars = { user: user };
  res.render('urls_new', templateVars);
});

app.post('/urls', auth, (req, res) => {
  const tiny = generateRandomString();
  urlDatabase[tiny] = {};
  urlDatabase[tiny].tiny = tiny;
  urlDatabase[tiny].url = req.body.longURL;
  urlDatabase[tiny].userID = req.session.user_id.id; 
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
    const longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  } else {
    res.status(404).send("TinyURL does not exist");
  }
});

app.get('/urls', auth, (req, res) => {
  const user = req.session.user_id;
  const userEmail = users[user].email;
  const userList = urlsForUser(user);
  const templateVars = { urls: userList, user: userEmail };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', auth, (req, res) => {
  const user = req.session.user_id;
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].url, user: user };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

