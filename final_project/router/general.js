const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({message: "User already exists!"});
  }
  users.push({username, password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({message: "Book not found"});
});

public_users.get('/author/:author', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].author === req.params.author)
    .map(key => ({isbn: key, ...books[key]}));
  if (result.length > 0) return res.status(200).json(result);
  return res.status(404).json({message: "No books found for this author"});
});

public_users.get('/title/:title', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].title === req.params.title)
    .map(key => ({isbn: key, ...books[key]}));
  if (result.length > 0) return res.status(200).json(result);
  return res.status(404).json({message: "No books found with this title"});
});

public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;