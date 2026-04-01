export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#94B4C1]/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#547792] animate-spin" />
      </div>
      <p className="text-sm text-[#547792]">جاري التحميل...</p>
    </div>
  );
}
