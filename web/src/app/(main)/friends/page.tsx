'use client';
import { useState } from 'react';
import { useFriends, usePendingRequests, useSuggestions, useAcceptFriendRequest, useDeclineFriendRequest, useSendFriendRequest } from '@/features/friends/hooks';
import { cn } from '@/lib/utils';

function FriendCard({ user, onUnfriend, onMessage }: { user: any; onUnfriend?: () => void; onMessage?: () => void }) {
  const name = user.profile?.fullName || user.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full text-[#FDFAF5] font-bold flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#213448] truncate">{name}</p>
          <p className="text-xs text-[#547792] truncate">{user.profile?.bio || ''}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onMessage} className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#547792] text-[#FDFAF5] hover:bg-[#213448] transition-colors">
          رسالة
        </button>
        <button onClick={onUnfriend} className="flex-1 py-2 rounded-lg text-xs font-medium border border-[#C8D8DF] text-[#547792] hover:bg-[#EAE0CF]/50 transition-colors">
          إلغاء الصداقة
        </button>
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline }: { request: any; onAccept: () => void; onDecline: () => void }) {
  const name = request.requester?.profile?.fullName || request.requester?.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();
  const mutualCount = request.mutualFriends || 0;

  return (
    <div className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60">
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

function SuggestionCard({ user, onAdd }: { user: any; onAdd: () => void }) {
  const name = user.userId?.profile?.fullName || user.userId?.email?.split('@')[0] || 'مستخدم';
  const initial = name.charAt(0).toUpperCase();
  const mutual = user.mutual || 0;

  return (
    <div className="bg-[#FDFAF5] rounded-xl p-4 border border-[#C8D8DF]/60">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-full text-[#FDFAF5] font-bold flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#213448] truncate">{name}</p>
          {mutual > 0 && <p className="text-xs text-[#547792]">{mutual} صديق مشترك</p>}
        </div>
      </div>
      <button onClick={onAdd} className="w-full py-2 rounded-lg text-xs font-medium bg-[#547792] text-[#FDFAF5] hover:bg-[#213448] transition-colors">
        إضافة صديق
      </button>
    </div>
  );
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const { data: friendsData, isLoading: friendsLoading } = useFriends();
  const { data: requestsData, isLoading: requestsLoading } = usePendingRequests();
  const { data: suggestionsData, isLoading: suggestionsLoading } = useSuggestions();
  const { mutate: accept } = useAcceptFriendRequest();
  const { mutate: decline } = useDeclineFriendRequest();
  const { mutate: sendRequest } = useSendFriendRequest();

  const friends = friendsData?.data?.data ?? [];
  const requests = requestsData?.data ?? [];
  const suggestions = suggestionsData?.data ?? [];

  const tabs = [
    { id: 'friends', label: 'الأصدقاء', count: friends.length },
    { id: 'requests', label: 'طلبات الصداقة', count: requests.length },
    { id: 'suggestions', label: 'اقتراحات', count: suggestions.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#EAE0CF]/30 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#213448] mb-6">الأصدقاء</h1>

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
            ) : friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((user: any) => (
                  <FriendCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-[#547792]">لم تقم بإضافة أصدقاء بعد</p>
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
                  <SuggestionCard key={s.userId?.id || s.userId} user={s} onAdd={() => sendRequest(s.userId?.id || s.userId)} />
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
      </div>
    </div>
  );
}