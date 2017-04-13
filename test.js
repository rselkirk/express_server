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

//console.log(users["user1"]);

for(var user in users) {
    console.log('user', users[user].email);
}