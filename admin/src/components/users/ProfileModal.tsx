'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useProfileWithMatch } from '@/features/matching/hooks';
import type { ProfileWithMatch, UserProfile } from '@/types';

interface ProfileModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ userId, open, onClose }: ProfileModalProps) {
  const { data, isLoading, isError } = useProfileWithMatch(userId || '');

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const renderProfileField = (label: string, value?: string | number | null) => {
    if (!value) return null;
    return (
      <div className="flex gap-4">
        <dt className="w-28 font-medium text-gray-500 text-sm">{label}</dt>
        <dd className="text-gray-900 text-sm">{value}</dd>
      </div>
    );
  };

  const renderProfile = (profile: UserProfile) => (
    <div className="space-y-4">
      {/* Avatar and Basic Info */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.firstName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-400">
              {profile.firstName?.[0] || profile.email?.[0] || '?'}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <div className="flex gap-2 mt-1">
            {profile.gender && <Badge label={profile.gender} variant="default" />}
            {profile.age && <Badge label={`${profile.age} years`} variant="default" />}
            <Badge label={profile.status} variant={profile.status === 'active' ? 'success' : 'warning'} />
          </div>
        </div>
      </div>

      {/* Match Score Section */}
      {data?.data?.matchScore !== undefined && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Match Score</span>
            <Badge 
              label={getMatchScoreLabel(data.data.matchScore)} 
              variant={data.data.matchScore >= 60 ? 'success' : data.data.matchScore >= 40 ? 'warning' : 'danger'} 
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getMatchScoreColor(data.data.matchScore)} transition-all duration-500`}
                style={{ width: `${data.data.matchScore}%` }}
              />
            </div>
            <span className="text-lg font-bold text-gray-900 w-12 text-right">
              {Math.round(data.data.matchScore)}%
            </span>
          </div>
        </div>
      )}

      {/* Match Reasons */}
      {data?.data?.matchReasons && data.data.matchReasons.length > 0 && (
        <div className="bg-green-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-800 mb-2">Match Reasons</h4>
          <ul className="text-sm text-green-700 space-y-1">
            {data.data.matchReasons?.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compatibility Details */}
      {data?.data?.compatibilityDetails && data.data.compatibilityDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Compatibility Breakdown</h4>
          <div className="space-y-2">
            {data.data.compatibilityDetails?.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-28 truncate">{detail.criteria}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getMatchScoreColor(detail.score)}`}
                    style={{ width: `${detail.score}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {Math.round(detail.score)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="space-y-2 pt-2">
        <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-1">Profile Details</h4>
        {renderProfileField('Phone', profile.phone)}
        {renderProfileField('Country', profile.country)}
        {renderProfileField('City', profile.city)}
        {renderProfileField('Sect', profile.sect)}
        {renderProfileField('Education', profile.education)}
        {renderProfileField('Occupation', profile.occupation)}
        {renderProfileField('Lifestyle', profile.lifestyle)}
        {renderProfileField('Prayer Level', profile.prayerLevel)}
        {renderProfileField('Looking For', profile.lookingFor)}
        {profile.dateOfBirth && renderProfileField('Date of Birth', new Date(profile.dateOfBirth).toLocaleDateString())}
        
        {profile.bio && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <dt className="text-sm font-medium text-gray-500 mb-1">Bio</dt>
            <dd className="text-sm text-gray-700">{profile.bio}</dd>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <dt className="text-sm font-medium text-gray-500">Joined</dt>
          <dd className="text-sm text-gray-700">{new Date(profile.createdAt).toLocaleString()}</dd>
        </div>
      </div>
    </div>
  );

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={data?.data?.user ? `${data.data.user.firstName || 'User'}'s Profile` : 'Profile'}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {isError && (
        <div className="text-center py-8 text-red-500">
          Failed to load profile. Please try again.
        </div>
      )}

      {data?.data && !isLoading && (
        renderProfile(data.data.user)
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
