const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
              {
                username: "Mike",
                password: "Alaska"  
              },
              {
                username: "Neha",
                password: "Jet"
              }
            ];

let isValid = (username)=>{ //returns boolean
    const isUser = users.filter((user) => user.username === username);
    if (isUser.length > 0) {
        isValid = true;
    } else {
      isValid = false;
    }
    return isValid;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const isUser = users.filter((user) => user.username === username);
  if (isUser.length > 0) {
      isValid = true;
  } else {
    isValid = false;
  }
  return isValid;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  console.log(req.body.username);
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  if (!username || !password) {
		return res.status(404).json({message: 'Error logging in'})
	}

  if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			'access',
			{expiresIn: 60 * 60}
		)

		req.session.authorization = {
			accessToken,
			username,
		}
		return res.status(200).send('User successfully logged in')
	} else {
    return res.status(208).json({message: 'Invalid Login. Check username and password'})
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
