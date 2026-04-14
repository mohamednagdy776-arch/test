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
        <h1 className="text-2xl font-bold text-emerald-900">الصفحات</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
        >
          {showCreate ? 'إلغاء' : '+ إنشاء صفحة'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الصفحة"
            className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm text-emerald-900 placeholder-emerald-400/50 mb-3 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80"
            required
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="الفئة"
            className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm text-emerald-900 placeholder-emerald-400/50 mb-3 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف الصفحة"
            rows={2}
            className="w-full rounded-xl border border-emerald-200/50 px-4 py-3 text-sm text-emerald-900 placeholder-emerald-400/50 mb-3 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80 resize-none"
          />
          <button
            type="submit"
            disabled={createPage.isPending || !name.trim()}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            {createPage.isPending ? 'جاري...' : 'إنشاء'}
          </button>
        </form>
      )}

      <PagesList />
    </div>
  );
}