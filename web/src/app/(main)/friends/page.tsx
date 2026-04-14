'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFriends, usePendingRequests, useSuggestions, useAcceptFriendRequest, useDeclineFriendRequest, useSendFriendRequest, useUnfriend, useFollowUser, useBlockUser, useFriendBirthdays, useFriendLists, useCreateFriendList, useUpdateFriendList, useDeleteFriendList } from '@/features/friends/hooks';
import { cn } from '@/lib/utils';

function FriendCard({ user, onUnfriend, onMessage, onBlock, onFollow }: { user: any; onUnfriend?: () => void; onMessage?: () => void; onBlock?: () => void; onFollow?: () => void }) {
  const name = user.profile?.fullName || user.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();
  const [showMenu, setShowMenu] = useState(false);
  const isFriend = user.friendshipStatus === 'friends' || user.isFriend;

  return (
    <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full text-white font-bold flex items-center justify-center bg-gradient-to-br from-emerald-500 to-amber-500">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-emerald-900 truncate">{name}</p>
          <p className="text-xs text-emerald-600/70 truncate">{user.profile?.bio || ''}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-[#EAE0CF] rounded-full">
            <svg className="w-5 h-5 text-[#547792]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute left-0 top-8 bg-white rounded-lg shadow-lg border border-[#C8D8DF] z-10 min-w-[140px]">
              <button onClick={() => { onMessage?.(); setShowMenu(false); }} className="w-full px-3 py-2 text-right text-sm text-[#213448] hover:bg-[#EAE0CF]">
                رسالة
              </button>
              {isFriend && (
                <button onClick={() => { onUnfriend?.(); setShowMenu(false); }} className="w-full px-3 py-2 text-right text-sm text-[#547792] hover:bg-[#EAE0CF]">
                  إلغاء الصداقة
                </button>
              )}
              {!isFriend && (
                <button onClick={() => { onFollow?.(); setShowMenu(false); }} className="w-full px-3 py-2 text-right text-sm text-[#4A8C6F] hover:bg-[#EAE0CF]">
                  متابعة
                </button>
              )}
              <button onClick={() => { onBlock?.(); setShowMenu(false); }} className="w-full px-3 py-2 text-right text-sm text-red-600 hover:bg-[#EAE0CF]">
                حظر
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onMessage} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#547792] text-[#FDFAF5] hover:bg-[#213448] transition-colors">
          رسالة
        </button>
        {isFriend ? (
          <button onClick={onUnfriend} className="flex-1 py-2 rounded-lg text-xs font-medium border border-[#C8D8DF] text-[#547792] hover:bg-[#EAE0CF]/50 transition-colors">
            إلغاء الصداقة
          </button>
        ) : (
          <button onClick={onFollow} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#4A8C6F] text-[#FDFAF5] hover:bg-[#3D7A5E] transition-colors">
            متابعة
          </button>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline }: { request: any; onAccept: () => void; onDecline: () => void }) {
  const name = request.requester?.profile?.fullName || request.requester?.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();
  const mutualCount = request.mutualFriends || 0;

  return (
    <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full text-[#FDFAF5] font-bold flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#213448] truncate">{name}</p>
          {mutualCount > 0 && <p className="text-xs text-[#547792]">{mutualCount} صديق مشترك</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onAccept} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#4A8C6F] text-[#FDFAF5] hover:bg-[#3D7A5E] transition-colors">
          تأكيد
        </button>
        <button onClick={onDecline} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#EAE0CF] text-[#547792] hover:bg-[#D4E8EE] transition-colors">
          رفض
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ user, onAdd, onFollow }: { user: any; onAdd: () => void; onFollow: () => void }) {
  const name = user.userId?.profile?.fullName || user.userId?.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();
  const mutual = user.mutual || 0;

  return (
    <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full text-[#FDFAF5] font-bold flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#213448] truncate">{name}</p>
          {mutual > 0 && <p className="text-xs text-[#547792]">{mutual} صديق مشترك</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onAdd} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#547792] text-[#FDFAF5] hover:bg-[#213448] transition-colors">
          إضافة صديق
        </button>
        <button onClick={onFollow} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#4A8C6F] text-[#FDFAF5] hover:bg-[#3D7A5E] transition-colors">
          متابعة
        </button>
      </div>
    </div>
  );
}

function BirthdayCard({ birthday }: { birthday: any }) {
  const name = birthday.name;
  const initial = name.charAt(0).toUpperCase();
  const date = new Date(birthday.date);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let dateText = '';
  if (diffDays === 0) dateText = 'اليوم';
  else if (diffDays === 1) dateText = 'غداً';
  else dateText = `خلال ${diffDays} أيام`;

  return (
    <div className="flex items-center gap-3 p-3 bg-[#FDFAF5] rounded-lg border border-[#C8D8DF]/60">
      <div className="h-10 w-10 rounded-full text-[#FDFAF5] font-bold flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #E91E63, #FF5722)' }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#213448] truncate">{name}</p>
        <p className="text-xs text-[#547792]">{dateText}</p>
      </div>
      <span className="text-lg">🎂</span>
    </div>
  );
}

function FriendListCard({ list, onEdit, onDelete, members }: { list: any; onEdit: () => void; onDelete: () => void; members: any[] }) {
  return (
    <div className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#213448]">{list.name}</h3>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1 hover:bg-[#EAE0CF] rounded">
            <svg className="w-4 h-4 text-[#547792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs text-[#547792] mb-2">{members.length} أعضاء</p>
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((member: any, idx: number) => {
          const name = member.profile?.fullName || member.email?.split('@')[0] || 'م';
          return (
            <div key={idx} className="h-8 w-8 rounded-full bg-[#547792] text-[#FDFAF5] text-xs font-bold flex items-center justify-center border-2 border-[#FDFAF5]">
              {name.charAt(0).toUpperCase()}
            </div>
          );
        })}
        {members.length > 5 && (
          <div className="h-8 w-8 rounded-full bg-[#EAE0CF] text-[#547792] text-xs font-bold flex items-center justify-center border-2 border-[#FDFAF5]">
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

  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const { data: requestsData, isLoading: requestsLoading } = usePendingRequests();
  const { data: suggestionsData, isLoading: suggestionsLoading } = useSuggestions();
  const { data: birthdaysData } = useFriendBirthdays();
  const { data: friendListsData, isLoading: listsLoading } = useFriendLists();
  
  const { mutate: accept } = useAcceptFriendRequest();
  const { mutate: decline } = useDeclineFriendRequest();
  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: unfriend } = useUnfriend();
  const { mutate: follow } = useFollowUser();
  const { mutate: block } = useBlockUser();
  const { mutate: createList } = useCreateFriendList();
  const { mutate: updateList } = useUpdateFriendList();
  const { mutate: deleteList } = useDeleteFriendList();

  const friends = friendsData?.data?.data ?? [];
  const requests = requestsData?.data ?? [];
  const suggestions = suggestionsData?.data ?? [];
  const birthdays = birthdaysData ?? [];
  const friendLists = friendListsData?.data ?? [];

  const filteredAndSortedFriends = useMemo(() => {
    let result = [...friends];
    
    if (searchQuery) {
      result = result.filter((user: any) => {
        const name = user.profile?.fullName || user.email?.split('@')[0] || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    if (sortBy === 'name') {
      result.sort((a: any, b: any) => {
        const nameA = a.profile?.fullName || a.email?.split('@')[0] || '';
        const nameB = b.profile?.fullName || b.email?.split('@')[0] || '';
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
    if (confirm('هل أنت متأكد من إلغاء الصداقة؟')) {
      unfriend(userId);
    }
  };

  const handleBlock = (userId: string) => {
    if (confirm('هل أنت متأكد من حظر هذا المستخدم؟')) {
      block(userId);
    }
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
    if (confirm('هل أنت متأكد من حذف هذه القائمة؟')) {
      deleteList(listId);
    }
  };

  const tabs = [
    { id: 'friends', label: 'الأصدقاء', count: friends.length },
    { id: 'requests', label: 'طلبات الصداقة', count: requests.length },
    { id: 'suggestions', label: 'اقتراحات', count: suggestions.length },
    { id: 'lists', label: 'القوائم', count: friendLists.length },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-amber-50/30 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-emerald-900 mb-6">الأصدقاء</h1>

        {activeTab === 'friends' && birthdays.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-200">
            <h2 className="text-sm font-bold text-[#213448] mb-3 flex items-center gap-2">
              <span>🎂</span> أعياد ميلاد قادمة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {birthdays.slice(0, 6).map((b: any) => (
                <BirthdayCard key={b.id} birthday={b} />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-[#213448] text-[#FDFAF5]'
                  : 'bg-[#FDFAF5] text-[#547792] hover:bg-[#D4E8EE]'
              )}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
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
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-[#C8D8DF] bg-[#FDFAF5] text-sm text-[#213448] placeholder-[#547792]/50 focus:outline-none focus:border-[#547792]"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#547792]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'recent')}
                className="px-4 py-2 rounded-lg border border-[#C8D8DF] bg-[#FDFAF5] text-sm text-[#213448] focus:outline-none focus:border-[#547792]"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="recent">الأحدث إضافة</option>
              </select>
            </div>

            <p className="text-sm text-[#547792] mb-4">لديك {friends.length} أصدقاء</p>

            {friendsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[#EAE0CF]" />
                      <div className="flex-1 h-4 bg-[#EAE0CF] rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-[#EAE0CF] rounded" />
                      <div className="flex-1 h-8 bg-[#EAE0CF] rounded" />
                    </div>
                  </div>
                ))}
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
                <p className="text-[#547792]">{searchQuery ? 'لا توجد نتائج للبحث' : 'لم تقم بإضافة أصدقاء بعد'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {requestsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[#EAE0CF]" />
                      <div className="flex-1 h-4 bg-[#EAE0CF] rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-[#EAE0CF] rounded" />
                      <div className="flex-1 h-8 bg-[#EAE0CF] rounded" />
                    </div>
                  </div>
                ))}
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
                <p className="text-[#547792]">لا توجد طلبات صداقة</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div>
            {suggestionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-[#EAE0CF]" />
                      <div className="flex-1 h-4 bg-[#EAE0CF] rounded" />
                    </div>
                    <div className="h-8 bg-[#EAE0CF] rounded" />
                  </div>
                ))}
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
                <p className="text-[#547792]">لا توجد اقتراحات حالياً</p>
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
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8D8DF] bg-[#FDFAF5] text-sm text-[#213448] placeholder-[#547792]/50 focus:outline-none focus:border-[#547792]"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="px-4 py-2 rounded-lg bg-[#547792] text-[#FDFAF5] text-sm font-medium hover:bg-[#213448] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                إنشاء
              </button>
            </div>

            {listsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60 animate-pulse">
                    <div className="h-4 bg-[#EAE0CF] rounded w-1/2 mb-3" />
                    <div className="h-3 bg-[#EAE0CF] rounded w-1/3 mb-2" />
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-[#EAE0CF]" />
                      <div className="h-8 w-8 rounded-full bg-[#EAE0CF]" />
                      <div className="h-8 w-8 rounded-full bg-[#EAE0CF]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : friendLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendLists.map((list: any) => (
                  <FriendListCard
                    key={list.id}
                    list={list}
                    onEdit={() => setEditingList(list)}
                    onDelete={() => handleDeleteList(list.id)}
                    members={list.members || []}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-[#547792]">لم تقم بإنشاء قوائم أصدقاء بعد</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
