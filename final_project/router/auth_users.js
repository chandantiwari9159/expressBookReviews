const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
  let accessToken = jwt.sign({data: username}, 'access', {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "User successfully logged in"});
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  if (!review) return res.status(400).json({message: "Review text is required"});
  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review successfully added/updated", reviews: books[isbn].reviews});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!books[isbn]) return res.status(404).json({message: "Book not found"});
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review successfully deleted"});
  }
  return res.status(404).json({message: "No review found for this user"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;