import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Story, StoryView, StoryHighlight, SavedPost, PostReport, HiddenPost } from '../entities/story.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(StoryView) private viewRepo: Repository<StoryView>,
    @InjectRepository(StoryHighlight) private highlightRepo: Repository<StoryHighlight>,
    @InjectRepository(SavedPost) private savedRepo: Repository<SavedPost>,
    @InjectRepository(PostReport) private reportRepo: Repository<PostReport>,
    @InjectRepository(HiddenPost) private hiddenRepo: Repository<HiddenPost>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
  ) {}

  async createStory(userId: string, data: { mediaUrl?: string; mediaType?: string; thumbnailUrl?: string; text?: string; bgColor?: string; duration?: number }) {
    const story = new Story();
    story.userId = userId;
    if (data.mediaUrl) story.mediaUrl = data.mediaUrl;
    if (data.mediaType) story.mediaType = data.mediaType as 'image' | 'video';
    if (data.thumbnailUrl) story.thumbnailUrl = data.thumbnailUrl;
    if (data.text) story.text = data.text;
    if (data.bgColor) story.bgColor = data.bgColor;
    if (data.duration) story.duration = data.duration;
    const saved = await this.storyRepo.save(story);
    return this.storyRepo.findOne({ where: { id: saved.id }, relations: ['user'] });
  }

  async getStories(userId: string) {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
    const stories = await this.storyRepo
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('story.createdAt > :thirtyHoursAgo', { thirtyHoursAgo })
      .andWhere('story.isArchived = :isArchived', { isArchived: false })
      .andWhere('story.userId = :userId', { userId })
      .orderBy('story.createdAt', 'DESC')
      .getMany();
    return stories;
  }

  async getAllStories(userId: string) {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
    const stories = await this.storyRepo
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('story.createdAt > :thirtyHoursAgo', { thirtyHoursAgo })
      .andWhere('story.isArchived = :isArchived', { isArchived: false })
      .andWhere('story.userId != :userId', { userId })
      .orderBy('story.createdAt', 'DESC')
      .getMany();
    const grouped = stories.reduce((acc: Record<string, any[]>, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = [];
      }
      acc[story.userId].push(story);
      return acc;
    }, {});
    return Object.entries(grouped).map(([_, userStories]) => ({
      user: userStories[0].user,
      stories: userStories,
    }));
  }

  async deleteStory(storyId: string, userId: string) {
    const story = await this.storyRepo.findOne({ where: { id: storyId, userId } });
    if (!story) return null;
    await this.storyRepo.delete(storyId);
    return { success: true };
  }

  async viewStory(storyId: string, viewerId: string) {
    const view = new StoryView();
    view.storyId = storyId;
    view.userId = viewerId;
    await this.viewRepo.save(view);
    await this.storyRepo.increment({ id: storyId }, 'viewCount', 1);
    return { success: true };
  }

  async getStoryViewers(storyId: string) {
    const views = await this.viewRepo.find({
      where: { storyId },
      relations: ['user', 'user.profile'],
      order: { viewedAt: 'DESC' },
    });
    return views;
  }

  async addToHighlight(userId: string, storyId: string, highlightName: string) {
    let highlight = await this.highlightRepo.findOne({ where: { userId, name: highlightName } });
    if (!highlight) {
      highlight = new StoryHighlight();
      highlight.userId = userId;
      highlight.name = highlightName;
      highlight.storyIds = [];
      await this.highlightRepo.save(highlight);
    }
    if (!highlight.storyIds.includes(storyId)) {
      highlight.storyIds = [...highlight.storyIds, storyId];
      await this.highlightRepo.save(highlight);
    }
    return highlight;
  }

  async getHighlights(userId: string) {
    return this.highlightRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async savePost(userId: string, postId: string) {
    const existing = await this.savedRepo.findOne({ where: { userId, postId } });
    if (existing) {
      await this.savedRepo.delete(existing.id);
      return { saved: false };
    }
    const saved = new SavedPost();
    saved.userId = userId;
    saved.postId = postId;
    await this.savedRepo.save(saved);
    return { saved: true };
  }

  async getSavedPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.savedRepo.findAndCount({
      where: { userId },
      relations: ['post', 'post.user', 'post.group'],
      order: { savedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async reportPost(reporterId: string, postId: string, reason: string, description?: string) {
    const report = new PostReport();
    report.reporterId = reporterId;
    report.postId = postId;
    report.reason = reason;
    if (description) report.description = description;
    await this.reportRepo.save(report);
    return { success: true };
  }

  async hidePost(userId: string, postId: string, hideType: 'not_interested' | 'snooze' | 'unfollow', snoozeDays?: number) {
    const existing = await this.hiddenRepo.findOne({ where: { userId, postId } });
    if (existing) return existing;
    const hidden = new HiddenPost();
    hidden.userId = userId;
    hidden.postId = postId;
    hidden.hideType = hideType;
    if (hideType === 'snooze' && snoozeDays) {
      hidden.snoozeUntil = new Date(Date.now() + snoozeDays * 24 * 60 * 60 * 1000);
    }
    await this.hiddenRepo.save(hidden);
    return { success: true };
  }

  async getFeed(userId: string, cursor?: string, limit: number = 10) {
    const hiddenPosts = await this.hiddenRepo.find({ where: { userId, hideType: In(['not_interested', 'snooze']) } });
    const hiddenPostIds = hiddenPosts.filter(p => p.hideType === 'not_interested' || (p.snoozeUntil && p.snoozeUntil > new Date())).map(p => p.postId);
    
    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.group', 'group')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.id NOT IN (:...hiddenPostIds)', { hiddenPostIds: hiddenPostIds.length ? hiddenPostIds : [''] })
      .andWhere('post.scheduledAt IS NULL OR post.scheduledAt <= :now', { now: new Date() })
      .andWhere('post.isArchived = :isArchived', { isArchived: false })
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor } });
      if (cursorPost) {
        query.andWhere('post.createdAt < :cursorDate', { cursorDate: cursorPost.createdAt });
      }
    }

    const posts = await query.getMany();
    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async getRecentFeed(userId: string, cursor?: string, limit: number = 10) {
    const hiddenPosts = await this.hiddenRepo.find({ where: { userId, hideType: In(['not_interested', 'snooze']) } });
    const hiddenPostIds = hiddenPosts.filter(p => p.hideType === 'not_interested' || (p.snoozeUntil && p.snoozeUntil > new Date())).map(p => p.postId);
    
    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.group', 'group')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.id NOT IN (:...hiddenPostIds)', { hiddenPostIds: hiddenPostIds.length ? hiddenPostIds : [''] })
      .andWhere('post.scheduledAt IS NULL OR post.scheduledAt <= :now', { now: new Date() })
      .andWhere('post.isArchived = :isArchived', { isArchived: false })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor } });
      if (cursorPost) {
        query.andWhere('post.createdAt < :cursorDate', { cursorDate: cursorPost.createdAt });
      }
    }

    const posts = await query.getMany();
    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  async sharePost(userId: string, postId: string, content?: string) {
    const originalPost = await this.postRepo.findOne({ where: { id: postId } });
    if (!originalPost) return null;
    const newPost = new Post();
    newPost.userId = userId;
    newPost.content = content || '';
    newPost.postType = 'shared' as any;
    newPost.originalPostId = postId;
    const saved = await this.postRepo.save(newPost);
    return this.postRepo.findOne({ where: { id: saved.id }, relations: ['user', 'group', 'originalPost', 'originalPost.user'] });
  }

  async updatePost(postId: string, userId: string, data: Partial<Post>) {
    const post = await this.postRepo.findOne({ where: { id: postId, userId } });
    if (!post) return null;
    Object.assign(post, data, { editedAt: new Date() });
    await this.postRepo.save(post);
    return this.postRepo.findOne({ where: { id: postId }, relations: ['user', 'group'] });
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId, userId } });
    if (!post) return false;
    await this.postRepo.delete(postId);
    return true;
  }

  async getPostById(postId: string) {
    return this.postRepo.findOne({ where: { id: postId }, relations: ['user', 'group', 'originalPost', 'originalPost.user'] });
  }

  async createPost(userId: string, data: any) {
    const post = new Post();
    post.userId = userId;
    if (data.content) post.content = data.content;
    if (data.mediaUrl) post.mediaUrl = data.mediaUrl;
    if (data.mediaType) post.mediaType = data.mediaType;
    if (data.mediaUrls) post.mediaUrls = data.mediaUrls;
    if (data.postType) post.postType = data.postType as any;
    if (data.audience) post.audience = data.audience as any;
    if (data.bgColor) post.bgColor = data.bgColor;
    if (data.feeling) post.feeling = data.feeling;
    if (data.location) post.location = data.location;
    if (data.linkUrl) post.linkUrl = data.linkUrl;
    if (data.linkTitle) post.linkTitle = data.linkTitle;
    if (data.linkDescription) post.linkDescription = data.linkDescription;
    if (data.linkImage) post.linkImage = data.linkImage;
    if (data.pollOptions) post.pollOptions = data.pollOptions;
    if (data.scheduledAt) {
      post.scheduledAt = new Date(data.scheduledAt);
    }
    const saved = await this.postRepo.save(post);
    return this.postRepo.findOne({ where: { id: saved.id }, relations: ['user', 'group'] });
  }

  async votePoll(postId: string, userId: string, optionIndex: number) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || !post.pollOptions) return { success: false, message: 'Post or poll not found' };
    
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return { success: false, message: 'Invalid option' };
    }

    post.pollOptions[optionIndex].votes += 1;
    await this.postRepo.save(post);
    return { success: true, pollOptions: post.pollOptions };
  }
}