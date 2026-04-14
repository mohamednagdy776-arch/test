'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'basic',
    name: 'أساسي',
    price: 'مجاناً',
    period: '',
    features: ['إنشاء ملف شخصي', 'البحث الأساسي', '5 توافقات يومياً', 'الانضمام لمجتمعات'],
    current: true,
    color: '#10B981',
  },
  {
    id: 'premium',
    name: 'متميز',
    price: '99',
    period: 'شهرياً',
    features: ['كل ميزات الأساسي', 'توافقات غير محدودة', 'تحليلات معمقة', 'أولوية في البحث', 'شارة مميز', 'دعم ذو أولوية'],
    popular: true,
    color: '#059669',
  },
  {
    id: 'family',
    name: 'عائلي',
    price: '149',
    period: 'شهرياً',
    features: ['كل ميزات المتميز', '3 حسابات فرعية', 'إشراف ولي الأمر', 'تقارير شهرية', 'مستشار زواج مخصص'],
    color: '#F59E0B',
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState('premium');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-4 py-1.5 text-sm font-semibold text-[#059669] mb-4">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>
          ترقية حسابك
        </div>
        <h1 className="text-3xl font-bold text-[#059669] mb-2">اختر الخطة المناسبة</h1>
        <p className="text-[#10B981]">احصل على ميزات حصرية للتوافق المتقدم والبحث الذكي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={cn(
              'relative rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300',
              selected === plan.id
                ? 'border-[#10B981] shadow-lg bg-[#FFFBEB] scale-[1.02]'
                : 'border-[#DCFCE7] bg-[#FFFBEB] shadow-soft hover:shadow-lg hover:border-[#6EE7B7]'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold text-[#FFFBEB]" style={{ background: '#10B981' }}>
                الأكثر شعبية
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#DCFCE7] px-3 py-1 text-[10px] font-bold text-[#10B981]">
                خطتك الحالية
              </div>
            )}
            <div className="text-center mb-4 pt-2">
              <p className="text-sm font-bold text-[#10B981] mb-1">{plan.name}</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-[#059669]">{plan.price}</span>
                {plan.period && <span className="text-sm text-[#10B981]">ر.س / {plan.period}</span>}
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#065F46]">
                  <svg className="h-4 w-4 shrink-0" style={{ color: plan.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                'w-full rounded-2xl py-2.5 text-sm font-semibold transition-all duration-200',
                plan.current
                  ? 'bg-[#DCFCE7] text-[#10B981] cursor-default'
                  : selected === plan.id
                  ? 'text-[#FFFBEB] shadow-sm hover:shadow-md'
                  : 'border border-[#DCFCE7] text-[#10B981] hover:bg-[#DCFCE7]/50'
              )}
              style={!plan.current && selected === plan.id ? { background: plan.color } : {}}
              disabled={plan.current}
            >
              {plan.current ? 'نشط حالياً' : 'اشترك الآن'}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={() => router.back()} className="text-sm text-[#10B981] hover:text-[#059669] transition-colors">
          ← العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
