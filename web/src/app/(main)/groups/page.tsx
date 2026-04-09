'use client';
import { GroupList } from '@/features/groups/components/GroupList';
import { useCreateGroup } from '@/features/groups/hooks';
import { useState, useRef } from 'react';

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'secret'>('public');
  const [category, setCategory] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createGroup = useCreateGroup();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createGroup.mutateAsync({ 
      name: name.trim(), 
      description: description.trim(), 
      privacy,
      category: category.trim(),
      coverPhoto: coverPhoto || undefined
    });
    setName('');
    setDescription('');
    setPrivacy('public');
    setCategory('');
    setCoverPhoto(null);
    setCoverPreview(null);
    setShowCreate(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">المجتمعات</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {showCreate ? 'إلغاء' : '+ إنشاء مجتمع'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
            {coverPreview ? (
              <>
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPhoto(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500"
              >
                <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">إضافة صورة غلاف</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المجتمع"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">اختر الفئة</option>
              <option value="دراسة">دراسة</option>
              <option value="صحة">صحة</option>
              <option value="رياضة">رياضة</option>
              <option value="تكنولوجيا">تكنولوجيا</option>
              <option value="فنون">فنون</option>
              <option value="موسيقى">موسيقى</option>
              <option value="ألعاب">ألعاب</option>
              <option value="طعام">طعام</option>
              <option value="سفر">سفر</option>
              <option value="أعمال">أعمال</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as 'public' | 'private' | 'secret')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="public">عام - Everyone can see and join</option>
              <option value="private">خاص - Approval required to join</option>
              <option value="secret">سري - Only members can see</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف المجتمع (اختياري)"
            rows={2}
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <button
            type="submit"
            disabled={createGroup.isPending || !name.trim()}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {createGroup.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
          </button>
        </form>
      )}

      <GroupList />
    </div>
  );
}