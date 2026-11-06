let myLibrary = [];
let myToReadList = [];
let combinedLibrary = [];

//book constructor function, takes in title and author as strings, pages as a number, read as a boolean, and id as an optional string. no provided id generates a random UUID
function Book(title, author, pages, read, id = crypto.randomUUID()) {
  if (!new.target) {
    throw Error("You must use the 'new' operator to call this function")
  }

  this.id = id;
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
};

//prototype method to toggle the read status of a book
Book.prototype.toggleRead = function() {
  this.read = !this.read;
};

//save function that sets the library array to local storage as a JSON string.
function saveBooks() {
  localStorage.setItem("combinedLibrary", JSON.stringify(combinedLibrary));
}

//migration function used to transfer old data from previous iteration of the application using multiple keys/arrays into a single key/array
function migrateData(savedLibrary, savedToRead) {
  //combine the two arrays into one and save onto the new key
  //overwrites any existing data in the new key; additions made between failed and retried migration can be lost
  const migrateLibrary = savedToRead.concat(savedLibrary);
  localStorage.setItem("combinedLibrary", JSON.stringify(migrateLibrary));
  // check if the new key matches the migrated data, if it does, remove the old keys and set the combinedLibrary to the new key
  if (localStorage.getItem("combinedLibrary") === JSON.stringify(migrateLibrary)) { 
    console.log("Migration successful");
    localStorage.removeItem("myLibrary");
    localStorage.removeItem("myToReadList");
    myLibrary = null;
    myToReadList = null;
    combinedLibrary = migrateLibrary;
  } // if not, log an error message
    else {
    console.error("Migration failed");
    combinedLibrary = migrateLibrary;
  }
}
  
//load function to retrieve the library array from local storage and parse it back into an array of objects. allows users to keep data between sessions. includes migration logic to transfer data from previous iterations of the application using multiple keys/arrays into a single key/array
function loadBooks() {
  const savedLibrary = JSON.parse(localStorage.getItem("myLibrary")) || [];
  const savedToRead = JSON.parse(localStorage.getItem("myToReadList")) || [];
  const savedCombined = JSON.parse(localStorage.getItem("combinedLibrary"));

  //new key exists
  if (savedCombined !== null) {
    //if there is data in either of the old keys, migrate it to the new key
    if (savedLibrary.length > 0 || savedToRead.length > 0) {
        migrateData(savedLibrary, savedToRead);
      } // if both the old keys are empty, remove them and set the combinedLibrary to the new key. removing old keys prevents future migration attempts and makes it possible to remove this code in future iterations of the application without losing data
        else {
          localStorage.removeItem("myLibrary");
          localStorage.removeItem("myToReadList");
          myLibrary = null;
          myToReadList = null;
          combinedLibrary = savedCombined;
        }
  } //new key doesn't exist
    else if (savedCombined === null) { //if there is data in either of the old keys, migrate it to the new key
      if (savedLibrary.length > 0 || savedToRead.length > 0) {
        migrateData(savedLibrary, savedToRead);
      } //if both of the old keys are empty, remove them and set the combinedLibrary to an empty array. effectively resets the library without impacting brand new users. removing old keys prevents future migration attempts and makes it possible to remove this code in future iterations of the application without losing data
        else {
          localStorage.removeItem("myLibrary");
          localStorage.removeItem("myToReadList");
          myLibrary = null;
          myToReadList = null;
          localStorage.setItem("combinedLibrary", JSON.stringify([]));
        }
    }
  //rehydrate loaded data from combinedLibrary into Book objects so prototype methods are available. this is necessary because JSON.parse() returns plain objects, not instances of the Book constructor function
  combinedLibrary = combinedLibrary.map((book) => new Book(book.title, book.author, book.pages, book.read, book.id));
}

//function to add a new book to the library array and return the book object. the optional id parameter is left out ensuring new books are always assigned a new UUID.
function addBook(title, author, pages, read) {
  const book = new Book(title, author, pages, read);

  combinedLibrary.push(book);

  return book;
};

//function to delete a book from the library array, filters the array based on a given id
function delBook(id) {
  combinedLibrary = combinedLibrary.filter((book) => book.id !==id);
  
}

//UI logic to create new book dialog form
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

//function to create cards, includes a toggle and remove button to change a books read status or remove it from the library array and UI
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

  const readToggle = document.createElement("button");
  readToggle.textContent = book.read ? "Mark as Unread" : "Mark as Read";
  readToggle.addEventListener("click", () => {
    book.toggleRead();
    saveBooks();
    displayBooks();
  });

  const delCard = document.createElement("button");
  delCard.textContent = `Remove`;
  delCard.addEventListener("click", () => {
    delBook(book.id);
    saveBooks();
    displayBooks();
  });

  
  card.append(title, author, pages, readToggle, delCard);
  return card;
}

//render function, takes in a list which is the library array filtered based on read status, and a container which is given based on 
function renderLibrary(list, container) {
  container.replaceChildren();

  list.forEach((book) => {
    const card = createCard(book);
    container.appendChild(card);
  });
}

//display function, filters the array into two constants based on read status, then calls the render function to place cards into appropriate HTML container
function displayBooks() {
  const readBooks = combinedLibrary.filter((book) => book.read);
  const toReadBooks = combinedLibrary.filter((book) => !book.read);

  renderLibrary(toReadBooks, document.querySelector("#to-read-list"));
  renderLibrary(readBooks, document.querySelector("#library"));
}

//add book form submit logic, handles save and display functions to automatically update UI on submission
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

//load and display functions show any saved library data on page reload
loadBooks();
displayBooks();