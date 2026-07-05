const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
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

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

// Get book details based on ISBN (direct)
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({message: "Book not found"});
});

// Task 11: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => response.data)
      .catch(error => {
        throw new Error("Book not found");
      });
  };

  getBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({message: err.message}));
});

// Get book details based on author (direct)
public_users.get('/author/:author', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].author === req.params.author)
    .map(key => ({isbn: key, ...books[key]}));
  if (result.length > 0) return res.status(200).json(result);
  return res.status(404).json({message: "No books found for this author"});
});

// Task 12: Get book details based on Author using async/await with Axios
public_users.get('/author-async/:author', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;
    const result = Object.keys(allBooks)
      .filter(key => allBooks[key].author === req.params.author)
      .map(key => ({isbn: key, ...allBooks[key]}));
    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({message: "No books found for this author"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

// Get book details based on title (direct)
public_users.get('/title/:title', function (req, res) {
  const result = Object.keys(books)
    .filter(key => books[key].title === req.params.title)
    .map(key => ({isbn: key, ...books[key]}));
  if (result.length > 0) return res.status(200).json(result);
  return res.status(404).json({message: "No books found with this title"});
});

// Task 13: Get book details based on Title using Promises with Axios
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = (title) => {
    return axios.get('http://localhost:5000/')
      .then(response => {
        const allBooks = response.data;
        const result = Object.keys(allBooks)
          .filter(key => allBooks[key].title === title)
          .map(key => ({isbn: key, ...allBooks[key]}));
        if (result.length === 0) {
          throw new Error("No books found with this title");
        }
        return result;
      });
  };

  getBooksByTitle(title)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({message: err.message}));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;