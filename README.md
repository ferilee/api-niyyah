# User API with Bun, Hono, and SQLite

API sederhana untuk mengelola data pengguna dengan fitur CRUD.

## Persyaratan
- [Bun](https://bun.sh/) installed

## Cara Menjalankan
1. Install dependensi:
   ```bash
   bun install
   ```
2. Jalankan server:
   ```bash
   bun run src/index.ts
   ```
   Atau cukup:
   ```bash
   bun .
   ```
   Server akan berjalan di `http://localhost:3000`.

## Endpoints

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/` | Informasi API dan daftar endpoint |
| GET | `/users` | List semua pengguna |
| GET | `/users/:id` | Detail pengguna berdasarkan ID |
| POST | `/users` | Tambah pengguna baru |
| PUT | `/users/:id` | Update data pengguna |
| DELETE | `/users/:id` | Hapus pengguna |

### Contoh Request Tambah Pengguna (POST `/users`)
```json
{
  "nama": "Antigravity",
  "jenis_kelamin": "Laki-laki"
}
```
