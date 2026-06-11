import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-black text-stadium-green mb-4">404</h1>
      <p className="text-gray-400 mb-6">Page not found</p>
      <Link href="/" className="btn-primary px-6 py-3 rounded-xl">
        Back to Home
      </Link>
    </div>
  );
}
