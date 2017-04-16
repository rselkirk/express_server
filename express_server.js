const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse'],

// cookie options
  maxAge: 24 * 60 * 60 * 1000,
}));

// variable to check for a logged-in user on required pages
const auth = (req, res, next) => {
  if (req.session.user_id) {
    res.locals.user_Id = req.session.user_id;
    res.locals.urls = urlDatabase;
    next();
  } else {
    const templateVars = { user: undefined };
    res.status(401).render('user_error', templateVars);
  }
};

// generates string of six alphanumeric characters
function generateRandomString() {
  return Math.random().toString(36).split('').filter((value, index, self) => self.indexOf(value) === index).join('').substr(2, 6);
}

// generates a list of urls from database belonging to a specific user
function urlsForUser(id) {
  const userList = [];
  for (const eachURL in urlDatabase) {
    if (urlDatabase[eachURL].userID === id) {
      userList.push(urlDatabase[eachURL]);
    }
  }
  return userList;
}

// database of tiny URLs
const urlDatabase = {
  'b2xVn2': { tiny: 'b2xVn2', url: 'http://www.lighthouselabs.ca', userID: 'user1' },
  '9sm5xK': { tiny: '9sm5xK', url: 'http://www.google.com', userID: 'user2' },
  'g3ft9m': { tiny: '9sm5xK2', url: 'http://www.cbc.ca', userID: 'user2' },
};

// database of site users
const users = {
  user1: {
    id: 'user1',
    email: 'user1@example.com',
    password: '$2a$10$ppUFtC8saYVqCbYlQ2STg..xv0.5Uy.XQYLUZoGg.eitUVn7pNAI6', // purple (for testing)
  },
  user2: {
    id: 'user2',
    email: 'user2@example.com',
    password: '$2a$10$nYgj0etavqZs42nJ/QYB7eW4ltnklq5fKgaw2JRbCfyUBm/VP/BZO', // dishwasher (for testing)
  },
};

/* checks login info for existing user, then if checks if password is correct
Once logged in, redirects to url list */
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  for (const user in users) {
    const existingUser = (users[user].email);
    const existingPassword = (users[user].password);
    if (existingUser === loginEmail) {
      if (bcrypt.compareSync(loginPassword, existingPassword)) {
        req.session.user_id = users[user].id;
        res.redirect('/urls');
        return;
      } else if (existingPassword !== loginPassword) {
        res.status(401).send('User login and password do not match');
        return;
      }
    }
  }
  res.status(403).send('User not registered!');
});

// if user is logged in redirects to urls, otherwise renders login page
app.get('/login', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user };
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('user_login', templateVars);
  }
});

// logs user out by clearing session cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

/* creates a new tiny URL and adds it to the urlDatabase
then redirects user to their newly create url page */
app.post('/urls/:id', (req, res) => {
  const newlong = req.body.newURL;
  const tiny = req.params.id;
  urlDatabase[req.params.id].url = newlong;
  res.redirect(`/urls/${tiny}`);
});

/* if user is logged in, redirects to url list
otherwise redirects to login page */
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

/* if user is logged in, redirects to url list
otherwise renders register page */
app.get('/register', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user };
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('user_reg', templateVars);
  }
});

/* verifies user has entered email and password
checks if user is already in database
adds new user to database and hashes password */
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  if (!req.body.email && !req.body.password) {
    res.status(400).send('Please enter an email and password!');
  } else if (req.body.email && !req.body.password) {
    res.status(400).send('Please enter a password!');
  } else if (req.body.email && req.body.password) {
    for (const user in users) {
      const existing = (users[user].email);
      if (existing === newEmail) {
        res.status(400).send('User already registered!');
        return;
      }
    }
    const id = generateRandomString();
    const user = req.body.email;
    const password = req.body.password;
    const templateVars = { user };
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {};
    users[id].id = id;
    users[id].email = user;
    users[id].password = hashedPassword;
    req.session.user_id = id;
    res.redirect('/');
  }
});

// if user is logged in, renders template for new Tiny URL
app.get('/urls/new', auth, (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// creates new Tiny URL and adds it to urlDatabase
app.post('/urls', auth, (req, res) => {
  const tiny = generateRandomString();
  urlDatabase[tiny] = {};
  urlDatabase[tiny].tiny = tiny;
  urlDatabase[tiny].url = req.body.longURL;
  urlDatabase[tiny].userID = req.session.user_id;
  res.redirect(`/urls/${tiny}`);
});

// deletes Tiny URL from urlDatabase and redirects user to URL page
app.post('/urls/:id/delete', (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect('/urls');
});

// redirects user to URL page (if it exists)
app.get('/u/:shortURL', (req, res) => {
  const key = req.params.shortURL;
  if (key in urlDatabase) {
    const longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  } else {
    res.status(404).send('TinyURL does not exist.');
  }
});

// renders a page of logged-in user's Tiny URLs
app.get('/urls', auth, (req, res) => {
  const user = req.session.user_id;
  const userEmail = users[user].email;
  const userList = urlsForUser(user);
  const templateVars = { urls: userList, user: userEmail };
  res.render('urls_index', templateVars);
});

// shows single Tiny URL page if Tiny URL user is logged in
app.get('/urls/:id', auth, (req, res) => {
  if (req.params.id in urlDatabase) {
    const user = req.session.user_id;
    if (user === urlDatabase[req.params.id].userID) {
      const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].url, user };
      res.render('urls_show', templateVars);
    } else {
      res.status(403).send('Logged in user must the owner of this Tiny URL to view the page.');
    }
  } else {
    res.status(404).send('TinyURL page not found.');
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
