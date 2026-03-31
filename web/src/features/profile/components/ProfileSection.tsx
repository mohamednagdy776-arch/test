interface Props {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const ProfileSection = ({ title, icon, children }: Props) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
      <span>{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);
