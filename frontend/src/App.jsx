import { useEffect, useState } from "react";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

function App() {
  const [books, setBooks] = useState([]);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fungsi untuk memuat ulang data (dipakai tombol "Coba lagi" & setelah CRUD)
  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/books`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data buku");
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Mengambil data ketika halaman pertama kali dibuka (aman dari warning linter)
  useEffect(() => {
    let ignore = false;

    async function fetchInitialBooks() {
      try {
        const response = await fetch(`${API_URL}/books`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data buku");
        }

        const data = await response.json();
        if (!ignore) {
          setBooks(data);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchInitialBooks();

    return () => {
      ignore = true;
    };
  }, []);

  // Menambahkan buku
  async function addBook(book) {
    try {
      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(book)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan buku");
      }

      await loadBooks();
      setBookToEdit(null);
      alert("Buku berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // Mengubah buku
  async function updateBook(book) {
    try {
      const response = await fetch(
        `${API_URL}/books/${bookToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(book)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah buku");
      }

      await loadBooks();
      setBookToEdit(null);
      alert("Buku berhasil diperbarui");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // Menghapus buku
  async function deleteBook(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus buku ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus buku");
      }

      await loadBooks();
      alert("Buku berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // Menangani pengiriman form
  function handleFormSubmit(book) {
    if (bookToEdit) {
      updateBook(book);
    } else {
      addBook(book);
    }
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">BOOK MANAGEMENT SYSTEM</p>
          <h1>Manajemen Stok Buku</h1>
          <p className="subtitle">
            Kelola data buku dengan mudah dan praktis.
          </p>
        </div>
      </header>

      <BookForm
        key={bookToEdit ? bookToEdit.id : "new"}
        bookToEdit={bookToEdit}
        onSubmit={handleFormSubmit}
        onCancel={() => setBookToEdit(null)}
      />

      <section className="content-section">
        {loading ? (
          <p className="status-message">Memuat data buku...</p>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={loadBooks}>Coba lagi</button>
          </div>
        ) : (
          <BookList
            books={books}
            onEdit={setBookToEdit}
            onDelete={deleteBook}
          />
        )}
      </section>

      <footer className="footer">
        Manajemen Stok Buku
      </footer>
    </main>
  );
}

export default App;