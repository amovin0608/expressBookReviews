const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const jwt = require('jsonwebtoken')
const public_users = express.Router();
const session = require('express-session')
const axios = require("axios");

public_users.post("/register", (req,res) => {
    const user = req.body.username;
    const password = req.body.password;
    
    if (user && password) {
      if (isValid(user)) {    
        return res.status(200).json({message: "User is already present"});
      } else {
        users.push({"username":user,"password":password})
        const token = jwt.sign(
          { username: user },
          "SecretKey",
          {
            expiresIn: "2h",
          }
        );
        return res.status(200).json(token);
        //return res.status(200).json({message: "User is registered"});
      }
    }

    return res.status(404).json({message: "Body Empty"});
    
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify({books},null,4));
});

public_users.get("/async", async (req, res) => {
  let response = await axios.get("http://localhost:5000/");
  return res.send(response.data);});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  console.log("called this method");
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn],null,4));
 });

public_users.get("/async/isbn/:isbn", async (req, res) => {
  let response = await axios.get("http://localhost:5000/isbn/"+req.params.isbn);
  return res.status(200).json(response.data)
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const filteredBooks = [];
    for (let value of Object.values(books)) {
      if (value.author.includes(author)) {
        filteredBooks.push(value);
      }
    }
    res.send(JSON.stringify({filteredBooks},null,4))
});

public_users.get("/async/author/:author", async (req, res) => {
  let response = await axios.get("http://localhost:5000/author/"+req.params.author);
  return res.status(200).json(response.data)
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const filtered_books = [];
  for (let value of Object.values(books)) {
    if (value.title.includes(title)) {
      filtered_books.push(value);
    }
  }
  res.send(JSON.stringify({filtered_books},null,4));
});

public_users.get("/async/title/:title", async (req, res) => {
  let response = await axios.get("http://localhost:5000/title/"+req.params.title);
  return res.status(200).json(response.data)
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  console.log("get review");
    const isbn = req.params.isbn;
    const book = books[isbn];
    res.send(book.reviews);
});

public_users.put('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const username = req.session.authorization.username
  if (books[isbn]) {
      let book = books[isbn]
      console.log(book);
      book.reviews[username] = review
      return res.status(200).send('Review successfully posted')} 
  else {return res.status(404).json({message: `ISBN ${isbn} not found`})}
});

public_users.delete('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization.username
  if (books[isbn]) {
      let book = books[isbn]
      delete book.reviews[username]
      return res.status(200).send('Review successfully deleted')} 
  else {return res.status(404).json({message: `ISBN ${isbn} not found`})}
});

module.exports.general = public_users;
