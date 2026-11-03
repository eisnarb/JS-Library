let myLibrary = [];
let myToReadList = [];

function Book(title, author, pages, read) {
  if (!new.target) {
    throw Error("You must use the 'new' operator to call this function")
  }

  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
};

function saveBooks() {
  localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
  localStorage.setItem("myToReadList", JSON.stringify(myToReadList));
}

function loadBooks() {
  const savedLibrary = JSON.parse(localStorage.getItem("myLibrary")) || [];
  const savedToRead = JSON.parse(localStorage.getItem("myToReadList")) || [];

  myLibrary = savedLibrary;
  myToReadList = savedToRead;
}

function addBook(title, author, pages, read) {
  const book = new Book(title, author, pages, read);

  if (read) {
    myLibrary.push(book);
  } else {
    myToReadList.push(book);
  }

  return book;
};



const dialog = document.querySelector("#book-dialog");
const addBookBtn = document.querySelector("#add-book");
const cancelBtn = document.querySelector("#cancel-btn");
const form = document.querySelector("#book-form");

addBookBtn.addEventListener("click", () => {
  dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

function delBook(id) {
  myLibrary = myLibrary.filter((book) => book.id !==id);
  myToReadList = myToReadList.filter((book) => book.id !== id);
  saveBooks();
  displayBooks();
}

function createCard(book) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = book.id;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.textContent = `by ${book.author}`;

  const pages = document.createElement("p");
  pages.textContent = `${book.pages} pages`;

  const delCard = document.createElement("button");
  delCard.textContent = `Remove`;
  delCard.addEventListener("click", () => {
    delBook(book.id);
  });

  
  card.append(title, author, pages, delCard);
  return card;
}

function displayBooks() {
  const libraryContainer = document.querySelector("#library");
  const readListContainer = document.querySelector("#read-list");

  libraryContainer.replaceChildren();
  readListContainer.replaceChildren();
  
  myLibrary.forEach((book) => {
    libraryContainer.appendChild(createCard(book));
  });

  myToReadList.forEach((book) => {
    readListContainer.appendChild(createCard(book));
  });
}

form.addEventListener("submit", () => {
  const data = new FormData(form);

  const title = data.get("title");
  const author = data.get("author");
  const pages = Number(data.get("pages"));
  const read = data.get("read") === "on";

  addBook(title, author, pages, read);
  saveBooks();
  displayBooks();
  form.reset();
});

loadBooks();
displayBooks();