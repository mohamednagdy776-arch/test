import { SelectQueryBuilder } from 'typeorm';
import { Post } from '../entities/post.entity';

// Shared between PostsService's feed queries and FeedService's separate
// "Trending Posts" query. A fix to one of these was previously applied to
// the other feed methods but missed FeedService.getFeed() entirely, so
// Trending Posts still leaked deleted-account posts and private/secret
// group posts nobody outside the group could otherwise see (#288, same bug
// class as #149/#359 elsewhere). Centralizing here so a future fix can't
// miss a caller.
//
// Requires the query to have already joined `post.user` as `user` and
// `post.group` as `group`.
export function applyAudienceFilter(qb: SelectQueryBuilder<Post>, viewerId?: string) {
  qb.andWhere('user.isDeactivated = false');
  if (viewerId) {
    qb.andWhere(`(
      post.user_id = :viewerId
      OR post.audience = 'public'
      OR (
        post.audience IN ('friends', 'friends_of_friends')
        AND EXISTS (
          SELECT 1 FROM friendships f
          WHERE f.status = 'accepted'
          AND f.deleted_at IS NULL
          AND (
            (f.requester_id = post.user_id AND f.addressee_id = :viewerId)
            OR (f.addressee_id = post.user_id AND f.requester_id = :viewerId)
          )
        )
      )
    )`, { viewerId });
  } else {
    qb.andWhere("post.audience = 'public'");
  }
  qb.andWhere(`(
    post.group_id IS NULL
    OR group.privacy = 'public'
    ${viewerId ? `OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = post.group_id AND gm.user_id = :viewerId AND gm.status = 'active'
    )` : ''}
  )`, { viewerId });
}

// Excludes posts the viewer hid ("not interested") or snoozed.
export function applyHiddenFilter(qb: SelectQueryBuilder<Post>, viewerId?: string) {
  if (!viewerId) return;
  qb.andWhere(
    `NOT EXISTS (
      SELECT 1 FROM hidden_posts hp
      WHERE hp.post_id = post.id
        AND hp.user_id = :hiddenViewerId
        AND (
          hp.hide_type = 'not_interested'
          OR (hp.hide_type = 'snooze' AND hp.snooze_until > NOW())
        )
    )`,
    { hiddenViewerId: viewerId },
  );
}
