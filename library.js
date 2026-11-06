let myLibrary = [];
let myToReadList = [];
let combinedLibrary = [];

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

Book.prototype.toggleRead = function() {
  this.read = !this.read;
};

function saveBooks() {
  localStorage.setItem("combinedLibrary", JSON.stringify(combinedLibrary));
}

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
  

function loadBooks() {
  const savedLibrary = JSON.parse(localStorage.getItem("myLibrary")) || [];
  const savedToRead = JSON.parse(localStorage.getItem("myToReadList")) || [];
  const savedCombined = JSON.parse(localStorage.getItem("combinedLibrary"));

  //new key exists
  if (savedCombined !== null) {
    //if there is data in either of the old keys, migrate it to the new key
    if (savedLibrary.length > 0 || savedToRead.length > 0) {
        migrateData(savedLibrary, savedToRead);
      } // if both the old keys are empty, remove them and set the combinedLibrary to the new key
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
      } //if both of the old keys are empty, remove them and set the combinedLibrary to an empty array
        else {
          localStorage.removeItem("myLibrary");
          localStorage.removeItem("myToReadList");
          myLibrary = null;
          myToReadList = null;
          localStorage.setItem("combinedLibrary", JSON.stringify([]));
        }
    }

  combinedLibrary = combinedLibrary.map((book) => new Book(book.title, book.author, book.pages, book.read, book.id));
}


function addBook(title, author, pages, read) {
  const book = new Book(title, author, pages, read);

  combinedLibrary.push(book);

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
  combinedLibrary = combinedLibrary.filter((book) => book.id !==id);
  
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

function renderLibrary(list, container) {
  container.replaceChildren();

  list.forEach((book) => {
    const card = createCard(book);
    container.appendChild(card);
  });
}

function displayBooks() {
  const readBooks = combinedLibrary.filter((book) => book.read);
  const toReadBooks = combinedLibrary.filter((book) => !book.read);

  renderLibrary(readBooks, document.querySelector("#library"));
  renderLibrary(toReadBooks, document.querySelector("#to-read-list"));
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