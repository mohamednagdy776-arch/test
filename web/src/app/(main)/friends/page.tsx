'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useFriends, usePendingRequests, useSuggestions, useAcceptFriendRequest, useDeclineFriendRequest, useSendFriendRequest, useUnfriend, useFollowUser, useBlockUser, useFriendBirthdays, useFriendLists, useCreateFriendList, useUpdateFriendList, useDeleteFriendList } from '@/features/friends/hooks';
import { cn, displayName } from '@/lib/utils';
import { DotsThreeVertical, ChatCircle, UserMinus, UserPlus, Prohibit, UsersThree } from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';

import { resolveMediaUrl } from '@/lib/media';

function FriendCard({ user, onUnfriend, onMessage, onBlock, onFollow }: { user: any; onUnfriend?: () => void; onMessage?: () => void; onBlock?: () => void; onFollow?: () => void }) {
  const name = displayName(user);
  const [showMenu, setShowMenu] = useState(false);
  const isFriend = user.friendshipStatus === 'friends' || user.isFriend;
  const avatarSrc = resolveMediaUrl(user.avatar);

  return (
    <div className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={avatarSrc} name={name} size="md" shape="rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.profile?.bio || ''}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            onKeyDown={(e) => e.key === 'Escape' && setShowMenu(false)}
            aria-haspopup="true"
            aria-expanded={showMenu}
            aria-label="خيارات"
            className="p-1.5 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
            style={{ color: 'var(--muted-foreground)' }}>
            <DotsThreeVertical size={18} weight="bold" />
          </button>
          {showMenu && (
            <div className="absolute left-0 top-9 rounded-xl shadow-xl z-20 min-w-[150px] overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onKeyDown={(e) => e.key === 'Escape' && setShowMenu(false)}>
              <button onClick={() => { onMessage?.(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-right text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                style={{ color: 'var(--foreground)' }}>
                <ChatCircle size={15} /> رسالة
              </button>
              {isFriend ? (
                <button onClick={() => { onUnfriend?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-right text-sm transition-colors hover:bg-[var(--destructive)]/10 text-[var(--destructive)]">
                  <UserMinus size={15} /> إلغاء الصداقة
                </button>
              ) : (
                <button onClick={() => { onFollow?.(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-right text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                  style={{ color: 'var(--primary)' }}>
                  <UserPlus size={15} /> متابعة
                </button>
              )}
              <button onClick={() => { onBlock?.(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-right text-sm text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10">
                <Prohibit size={15} /> حظر
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onMessage}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
          رسالة
        </button>
        {isFriend ? (
          <button onClick={onUnfriend}
            className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            إلغاء الصداقة
          </button>
        ) : (
          <button onClick={onFollow}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
            متابعة
          </button>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline }: { request: any; onAccept: () => void; onDecline: () => void }) {
  const name = displayName(request.requester);
  const mutualCount = request.mutualFriends || 0;
  const avatarSrc = resolveMediaUrl(request.requester?.avatar);

  return (
    <div className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={avatarSrc} name={name} size="md" shape="rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
          {mutualCount > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{mutualCount} صديق مشترك</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onAccept}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
          قبول
        </button>
        <button onClick={onDecline}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          رفض
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ user, onAdd, onFollow }: { user: any; onAdd: () => void; onFollow: () => void }) {
  const name = displayName(user);
  const mutual = user.mutual || 0;
  const avatarSrc = resolveMediaUrl(user.userId?.avatar);

  return (
    <div className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={avatarSrc} name={name} size="md" shape="rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
          {mutual > 0 && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{mutual} صديق مشترك</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onAdd}
          className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)' }}>
          إضافة صديق
        </button>
        <button onClick={onFollow}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          متابعة
        </button>
      </div>
    </div>
  );
}

function BirthdayCard({ birthday }: { birthday: any }) {
  const name = birthday.name;
  const date = new Date(birthday.date);
  const today = new Date();
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const dateText = diffDays === 0 ? 'اليوم' : diffDays === 1 ? 'غداً' : `خلال ${diffDays} أيام`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'color-mix(in srgb, #f59e0b 8%, var(--card))', border: '1px solid color-mix(in srgb, #f59e0b 20%, transparent)' }}>
      <Avatar name={name} size="sm" shape="rounded" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{name}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dateText}</p>
      </div>
      <span className="text-base" aria-hidden="true">🎂</span>
    </div>
  );
}

function FriendListCard({ list, onEdit, onDelete, members }: { list: any; onEdit: () => void; onDelete: () => void; members: any[] }) {
  return (
    <div className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{list.name}</h3>
        <div className="flex gap-1">
          <button onClick={onEdit} aria-label="تعديل"
            className="p-1.5 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
            style={{ color: 'var(--primary)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={onDelete} aria-label="حذف"
            className="p-1.5 rounded-lg text-[var(--destructive)]/70 transition-colors hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>{members.length} أعضاء</p>
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((member: any, idx: number) => (
          <Avatar key={idx} name={displayName(member)} size="sm" shape="circle" />
        ))}
        {members.length > 5 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--muted)', color: 'var(--primary)' }}>
            +{members.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions' | 'lists'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('name');
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<any>(null);
  const [editListName, setEditListName] = useState('');
  const [editListMemberIds, setEditListMemberIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: 'unfriend' | 'block' | 'deleteList'; id: string; label: string } | null>(null);

  const { data: friendsData, isLoading: friendsLoading, isError: friendsError } = useFriends();
  const { data: requestsData, isLoading: requestsLoading, isError: requestsError } = usePendingRequests();
  const { data: suggestionsData, isLoading: suggestionsLoading, isError: suggestionsError } = useSuggestions();
  const { data: birthdaysData } = useFriendBirthdays();
  const { data: friendListsData, isLoading: listsLoading, isError: listsError } = useFriendLists();

  const { mutate: accept } = useAcceptFriendRequest();
  const { mutate: decline } = useDeclineFriendRequest();
  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: unfriend } = useUnfriend();
  const { mutate: follow } = useFollowUser();
  const { mutate: block } = useBlockUser();
  const { mutate: createList } = useCreateFriendList();
  const { mutate: updateList } = useUpdateFriendList();
  const { mutate: deleteList } = useDeleteFriendList();

  const friends = friendsData?.data ?? [];
  const requests = requestsData?.data ?? [];
  const suggestions = suggestionsData?.data ?? [];
  const birthdays = birthdaysData?.data ?? [];
  const friendLists = friendListsData?.data ?? [];

  const filteredAndSortedFriends = useMemo(() => {
    let result = [...friends];

    if (searchQuery) {
      result = result.filter((user: any) => {
        const name = displayName(user);
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (sortBy === 'name') {
      result.sort((a: any, b: any) => {
        const nameA = displayName(a);
        const nameB = displayName(b);
        return nameA.localeCompare(nameB, 'ar');
      });
    } else {
      result.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [friends, searchQuery, sortBy]);

  const handleMessage = (userId: string) => {
    router.push(`/chat?user=${userId}`);
  };

  const handleUnfriend = (userId: string) => {
    setConfirmAction({ type: 'unfriend', id: userId, label: 'هل أنت متأكد من إلغاء الصداقة؟' });
  };

  const handleBlock = (userId: string) => {
    setConfirmAction({ type: 'block', id: userId, label: 'هل أنت متأكد من حظر هذا المستخدم؟' });
  };

  const handleFollow = (userId: string) => {
    follow(userId);
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList({ name: newListName.trim() });
      setNewListName('');
    }
  };

  const handleDeleteList = (listId: string) => {
    setConfirmAction({ type: 'deleteList', id: listId, label: 'هل أنت متأكد من حذف هذه القائمة؟' });
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'unfriend') unfriend(confirmAction.id);
    else if (confirmAction.type === 'block') block(confirmAction.id);
    else if (confirmAction.type === 'deleteList') deleteList(confirmAction.id);
    setConfirmAction(null);
  };

  const openEditList = (list: any) => {
    setEditingList(list);
    setEditListName(list.name || '');
    setEditListMemberIds((list.members || []).map((m: any) => m.id || m));
  };

  const handleSaveList = () => {
    if (!editingList) return;
    updateList({ listId: editingList.id, data: { name: editListName.trim(), memberIds: editListMemberIds } });
    setEditingList(null);
  };

  const toggleMember = (userId: string) => {
    setEditListMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const tabs = [
    { id: 'friends', label: 'الأصدقاء', count: friends.length },
    { id: 'requests', label: 'طلبات الصداقة', count: requests.length },
    { id: 'suggestions', label: 'اقتراحات', count: suggestions.length },
    { id: 'lists', label: 'القوائم', count: friendLists.length },
  ] as const;

  return (
    <div className="pb-10">
      <div className="mb-5">
        <PageHeader
          icon={UsersThree}
          eyebrow="شبكتك"
          title="الأصدقاء"
          subtitle="أصدقاؤك، طلبات الصداقة، والأشخاص الذين قد تعرفهم"
        />
      </div>

        {activeTab === 'friends' && birthdays.length > 0 && (
          <div className="mb-5 rounded-2xl p-4"
            style={{ background: 'color-mix(in srgb, #f59e0b 6%, var(--card))', border: '1px solid color-mix(in srgb, #f59e0b 20%, transparent)' }}>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              🎂 أعياد ميلاد قادمة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {birthdays.slice(0, 6).map((b: any) => (
                <BirthdayCard key={b.id} birthday={b} />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200',
              )}
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'var(--primary-foreground)', boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent)' }
                : { background: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            >
              {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {activeTab === 'friends' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="البحث عن الأصدقاء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-[var(--card)] text-base sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)]"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'recent')}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)]"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="recent">الأحدث إضافة</option>
              </select>
            </div>

            <p className="text-sm text-[var(--primary)] mb-4">لديك {friends.length} أصدقاء</p>

            {friendsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[var(--muted)]" />
                      <div className="flex-1 h-4 bg-[var(--muted)] rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-[var(--muted)] rounded" />
                      <div className="flex-1 h-8 bg-[var(--muted)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : friendsError ? (
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="text-sm text-[var(--primary)]">تعذّر تحميل قائمة الأصدقاء</p>
              </div>
            ) : filteredAndSortedFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedFriends.map((user: any) => (
                  <FriendCard
                    key={user.id}
                    user={user}
                    onMessage={() => handleMessage(user.id)}
                    onUnfriend={() => handleUnfriend(user.id)}
                    onBlock={() => handleBlock(user.id)}
                    onFollow={() => handleFollow(user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-[var(--primary)]">{searchQuery ? 'لا توجد نتائج للبحث' : 'لم تقم بإضافة أصدقاء بعد'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {requestsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[var(--muted)]" />
                      <div className="flex-1 h-4 bg-[var(--muted)] rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-[var(--muted)] rounded" />
                      <div className="flex-1 h-8 bg-[var(--muted)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requestsError ? (
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="text-sm text-[var(--primary)]">تعذّر تحميل طلبات الصداقة</p>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((request: any) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => accept(request.id)}
                    onDecline={() => decline(request.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-[var(--primary)]">لا توجد طلبات صداقة</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div>
            {suggestionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[var(--muted)]" />
                      <div className="flex-1 h-4 bg-[var(--muted)] rounded" />
                    </div>
                    <div className="h-8 bg-[var(--muted)] rounded" />
                  </div>
                ))}
              </div>
            ) : suggestionsError ? (
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="text-sm text-[var(--primary)]">تعذّر تحميل الاقتراحات</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((s: any) => (
                  <SuggestionCard
                    key={s.userId?.id || s.userId}
                    user={s}
                    onAdd={() => sendRequest(s.userId?.id || s.userId)}
                    onFollow={() => handleFollow(s.userId?.id || s.userId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">💡</p>
                <p className="text-[var(--primary)]">لا توجد اقتراحات حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="اسم القائمة الجديدة..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-base sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 focus:outline-none focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)]"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-black/10"
              >
                إنشاء
              </button>
            </div>

            {listsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] animate-pulse">
                    <div className="h-4 bg-[var(--muted)] rounded w-1/2 mb-3" />
                    <div className="h-3 bg-[var(--muted)] rounded w-1/3 mb-2" />
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-[var(--muted)]" />
                      <div className="h-8 w-8 rounded-full bg-[var(--muted)]" />
                      <div className="h-8 w-8 rounded-full bg-[var(--muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listsError ? (
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="text-sm text-[var(--primary)]">تعذّر تحميل قوائم الأصدقاء</p>
              </div>
            ) : friendLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendLists.map((list: any) => (
                  <FriendListCard
                    key={list.id}
                    list={list}
                    onEdit={() => openEditList(list)}
                    onDelete={() => handleDeleteList(list.id)}
                    members={list.members || []}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-[var(--primary)]">لم تقم بإنشاء قوائم أصدقاء بعد</p>
              </div>
            )}
          </div>
        )}

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title="تأكيد الإجراء">
        <div className="space-y-4">
          <p className="text-sm text-[var(--primary)]">{confirmAction?.label}</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setConfirmAction(null)} className="flex-1 text-[var(--primary)]">إلغاء</Button>
            <Button variant="danger" onClick={executeConfirmedAction} className="flex-1">تأكيد</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editingList} onClose={() => setEditingList(null)} title="تعديل القائمة">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--primary)] mb-1">اسم القائمة</label>
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-base sm:text-sm text-[var(--foreground)] focus:outline-none focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)] bg-[var(--card)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--primary)] mb-2">الأعضاء ({editListMemberIds.length} محدد)</label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {friends.map((friend: any) => {
                const fid = friend.id;
                const fname = displayName(friend);
                const selected = editListMemberIds.includes(fid);
                return (
                  <label key={fid} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleMember(fid)}
                      className="w-4 h-4 rounded accent-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">{fname}</span>
                  </label>
                );
              })}
              {friends.length === 0 && (
                <p className="text-xs text-[var(--muted-foreground)]">لا يوجد أصدقاء لإضافتهم</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setEditingList(null)} className="flex-1 text-[var(--primary)]">إلغاء</Button>
            <button
              onClick={handleSaveList}
              disabled={!editListName.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 shadow-lg shadow-black/10"
            >
              حفظ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
