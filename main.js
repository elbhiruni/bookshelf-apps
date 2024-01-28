import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11.10.4/+esm";

const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const searchBookForm = document.getElementById("searchBook");
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const btnTextIsComplete = document.getElementById("textIsCompleted");

  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();

    Swal.fire({
      toast: true,
      icon: "success",
      position: "top-right",
      title: "Buku berhasil dimasukkan ke rak " + btnTextIsComplete.textContent,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    if (inputBookIsComplete.checked) {
      btnTextIsComplete.textContent = "Selesai dibaca";
    } else {
      btnTextIsComplete.textContent = "Belum selesai dibaca";
    }
  });

  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  inputBookIsComplete.addEventListener("click", function () {
    if (inputBookIsComplete.checked) {
      btnTextIsComplete.textContent = "Selesai dibaca";
    } else {
      btnTextIsComplete.textContent = "Belum selesai dibaca";
    }
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
  document.getElementById("inputBook").reset();
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
  const checkIcon = document.createElement("span");
  const editIcon = document.createElement("span");
  const deleteIcon = document.createElement("span");
  const checkBtn = document.createElement("button");
  const editBtn = document.createElement("button");
  const deleteBookBtn = document.createElement("button");

  bookItem.classList.add("book_item");
  bookAction.classList.add("action");
  checkIcon.classList.add("material-symbols-outlined");
  editIcon.classList.add("material-symbols-outlined");
  deleteIcon.classList.add("material-symbols-outlined");
  editBtn.classList.add("edit");
  deleteBookBtn.classList.add("delete");

  bookTitle.textContent = bookObject.title;
  bookAuthor.textContent = `Penulis: ${bookObject.author}`;
  bookYear.textContent = `Tahun: ${bookObject.year}`;
  checkIcon.textContent = "check_circle";
  editIcon.textContent = "edit";
  deleteIcon.textContent = "delete_forever";

  checkBtn.appendChild(checkIcon);
  editBtn.appendChild(editIcon);
  deleteBookBtn.appendChild(deleteIcon);

  bookItem.append(bookTitle, bookAuthor, bookYear, bookAction);
  bookAction.append(checkBtn, editBtn, deleteBookBtn);

  if (bookObject.isCompleted) {
    checkBtn.classList.add("check");

    checkBtn.addEventListener("click", function () {
      moveBookToUncomplete(bookObject.id);
      Swal.fire({
        toast: true,
        icon: "success",
        position: "top-right",
        title: "Buku dipindahkan ke rak Belum selesai dibaca",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });
  } else {
    checkBtn.classList.add("uncheck");
    checkBtn.addEventListener("click", function () {
      moveBookToComplete(bookObject.id);
      Swal.fire({
        toast: true,
        icon: "success",
        position: "top-right",
        title: "Buku dipindahkan ke rak Selesai dibaca",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    });
  }

  editBtn.addEventListener("click", async function () {
    editBook(bookObject);
  });

  deleteBookBtn.addEventListener("click", function () {
    removeBook(bookObject);
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

async function editBook(book) {
  const { value: editBookFormValues } = await Swal.fire({
    title: "Ubah Buku",
    html: `
      <div>
        <label for="swal-inputBookTitle">Judul</label>
        <input id="swal-inputBookTitle" class="swal2-input" type="text" value=${book.title} placeholder="Judul" required>
      </div>

      <div>
        <label for="swal-inputBookAuthor">Penulis</label>
        <input id="swal-inputBookAuthor" class="swal2-input" type="text" value=${book.author} placeholder="Penulis" required>
      </div>

      <div>
        <label for="swal-inputBookYear">Tahun</label>
        <input id="swal-inputBookYear" class="swal2-input" type="number" value=${book.year} min="0" placeholder="Tahun" required>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    cancelButtonText: "Batal",
    confirmButtonColor: "#16a34a",
    confirmButtonText: "Simpan",
    preConfirm: () => {
      return {
        title: document.getElementById("swal-inputBookTitle").value,
        author: document.getElementById("swal-inputBookAuthor").value,
        year: document.getElementById("swal-inputBookYear").value,
      };
    },
  });

  if (editBookFormValues) {
    saveEditedBook(book.id, editBookFormValues, book.isCompleted);
    Swal.fire({
      icon: "success",
      text: "Buku berhasil diubah",
      showConfirmButton: false,
      timer: 1200,
    });
  }
}

function saveEditedBook(bookId, editedBookValues, bookIsComplete) {
  const bookTarget = findBookIndex(bookId);
  const bookTitle = editedBookValues.title;
  const bookAuthor = editedBookValues.author;
  const bookYear = editedBookValues.year;

  const editedBook = generateBookObject(
    bookId,
    bookTitle,
    bookAuthor,
    Number(bookYear),
    bookIsComplete
  );

  books.splice(bookTarget, 1, editedBook);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(book) {
  Swal.fire({
    title: `Apakah anda ingin menghapus buku ${book.title} ?`,
    icon: "warning",
    focusCancel: true,
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#3b82f6",
    confirmButtonText: "YA HAPUS BUKU",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      const bookTarget = findBookIndex(book.id);

      if (bookTarget === -1) return;

      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      Swal.fire("Terhapus!", `Buku ${book.title} telah dihapus`, "success");
    }
  });
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
