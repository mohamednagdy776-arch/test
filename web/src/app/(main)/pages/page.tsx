'use client';
import { PagesList } from '@/features/pages/components/PagesList';
import { useCreatePage } from '@/features/pages/hooks';
import { useState } from 'react';

export default function PagesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const createPage = useCreatePage();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createPage.mutateAsync({ name: name.trim(), description: description.trim(), category: category.trim() });
    setName('');
    setDescription('');
    setCategory('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الصفحات</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showCreate ? 'إلغاء' : '+ إنشاء صفحة'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الصفحة"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black mb-3 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="الفئة"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black mb-3 focus:border-primary focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف الصفحة"
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black mb-3 focus:border-primary focus:outline-none resize-none"
          />
          <button
            type="submit"
            disabled={createPage.isPending || !name.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {createPage.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <PagesList />
    </div>
  );
}