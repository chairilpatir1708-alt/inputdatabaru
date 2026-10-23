export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Halaman tidak ditemukan</p>
        <a href="/" className="mt-6 inline-block text-emerald-700 hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}
