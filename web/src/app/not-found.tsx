import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">الصفحة غير موجودة</p>
        <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
