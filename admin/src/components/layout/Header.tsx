'use client';

// Top header bar — add user avatar, logout button, notifications here
export const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {/* TODO: <NotificationBell /> */}
        {/* TODO: <AdminAvatar /> */}
        <span className="text-sm text-gray-600">Admin</span>
      </div>
    </header>
  );
};
