'use client';
import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">حدث خطأ</h1>
        <p className="mt-4 text-gray-600">Something went wrong. Please try again.</p>
        <Button onClick={reset} className="mt-6">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}
