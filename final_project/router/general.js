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

// Get book details based on ISBN - using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  getBookByISBN(isbn)
    .then(book => {
      return axios.get(`http://localhost:5000/review/${isbn}`)
        .then(() => res.status(200).json(book))
        .catch(() => res.status(200).json(book));
    })
    .catch(err => res.status(404).json({message: err}));
});

// Get book details based on author - using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = async (author) => {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;
    return Object.keys(allBooks)
      .filter(key => allBooks[key].author === author)
      .map(key => ({isbn: key, ...allBooks[key]}));
  };

  try {
    const result = await getBooksByAuthor(author);
    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({message: "No books found for this author"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

// Get book details based on title - using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = async (title) => {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;
    return Object.keys(allBooks)
      .filter(key => allBooks[key].title === title)
      .map(key => ({isbn: key, ...allBooks[key]}));
  };

  try {
    const result = await getBooksByTitle(title);
    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({message: "No books found with this title"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;