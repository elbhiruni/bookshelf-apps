const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchBook");

  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) loadDataFromStorage();
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBOOKList = document.getElementById("completeBookshelfList");

  uncompletedBOOKList.textContent = "";
  completedBOOKList.textContent = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function addBook() {
  const generatedID = generateId();
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    Number(bookYear),
    bookIsComplete
  );

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const bookItem = document.createElement("article");
  const bookTitle = document.createElement("h3");
  const bookAuthor = document.createElement("p");
  const bookYear = document.createElement("p");
  const bookAction = document.createElement("div");
  const greenBtn = document.createElement("button");
  const deleteBookBtn = document.createElement("button");

  bookItem.classList.add("book_item");
  bookAction.classList.add("action");
  greenBtn.classList.add("green");
  deleteBookBtn.classList.add("red");

  bookTitle.textContent = bookObject.title;
  bookAuthor.textContent = `Penulis: ${bookObject.author}`;
  bookYear.textContent = `Tahun: ${bookObject.year}`;
  greenBtn.textContent = "Selesai dibaca";
  deleteBookBtn.textContent = "Hapus buku";

  bookItem.append(bookTitle, bookAuthor, bookYear, bookAction);
  bookAction.append(greenBtn, deleteBookBtn);

  if (bookObject.isCompleted) {
    greenBtn.textContent = "Belum selesai di Baca";

    greenBtn.addEventListener("click", function () {
      moveBookToUncomplete(bookObject.id);
    });
  } else {
    greenBtn.addEventListener("click", function () {
      moveBookToComplete(bookObject.id);
    });
  }

  deleteBookBtn.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  return bookItem;
}

function moveBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveBookToUncomplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const tempBooks = [];
  const bookTitleSearch = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  tempBooks.splice(0, tempBooks.length);

  if (bookTitleSearch.search(/\S/g) == -1) {
    books.splice(0, books.length);
    return loadDataFromStorage();
  }

  for (const book of books) {
    const bookTitle = book.title.toLowerCase();
    if (bookTitle.indexOf(bookTitleSearch) !== -1) {
      tempBooks.push(book);
    }
  }

  books.splice(0, books.length);
  tempBooks.map((book) => books.push(book));

  document.dispatchEvent(new Event(RENDER_EVENT));
}
