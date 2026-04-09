import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoriesService } from '../services/stories.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ok, paginated } from '../../common/response.helper';
import { CreatePostDto } from '../dto/create-post.dto';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post('posts')
  async createPost(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    const post = await this.storiesService.createPost(user.id, dto);
    return ok(post, 'Post created');
  }

  @Get('feed')
  async getFeed(@CurrentUser() user: User, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    const { data, nextCursor, hasMore } = await this.storiesService.getFeed(user.id, cursor, lim);
    return { success: true, message: 'Feed retrieved', data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('feed/recent')
  async getRecentFeed(@CurrentUser() user: User, @Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    const { data, nextCursor, hasMore } = await this.storiesService.getRecentFeed(user.id, cursor, lim);
    return { success: true, message: 'Recent feed retrieved', data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('stories')
  async getStories(@CurrentUser() user: User) {
    const stories = await this.storiesService.getAllStories(user.id);
    return ok(stories, 'Stories retrieved');
  }

  @Post('stories')
  async createStory(@CurrentUser() user: User, @Body() body: { mediaUrl?: string; mediaType?: string; thumbnailUrl?: string; text?: string; bgColor?: string; duration?: number }) {
    const story = await this.storiesService.createStory(user.id, body);
    return ok(story, 'Story created');
  }

  @Delete('stories/:id')
  async deleteStory(@CurrentUser() user: User, @Param('id') storyId: string) {
    const result = await this.storiesService.deleteStory(storyId, user.id);
    return ok(result, 'Story deleted');
  }

  @Post('stories/:id/view')
  async viewStory(@CurrentUser() user: User, @Param('id') storyId: string) {
    const result = await this.storiesService.viewStory(storyId, user.id);
    return ok(result, 'View recorded');
  }

  @Get('stories/:id/viewers')
  async getStoryViewers(@Param('id') storyId: string) {
    const viewers = await this.storiesService.getStoryViewers(storyId);
    return ok(viewers, 'Viewers retrieved');
  }

  @Post('stories/:id/highlights')
  async addToHighlight(@CurrentUser() user: User, @Param('id') storyId: string, @Body() body: { name: string }) {
    const highlight = await this.storiesService.addToHighlight(user.id, storyId, body.name);
    return ok(highlight, 'Added to highlight');
  }

  @Get('highlights')
  async getHighlights(@CurrentUser() user: User) {
    const highlights = await this.storiesService.getHighlights(user.id);
    return ok(highlights, 'Highlights retrieved');
  }

  @Post('posts/:id/share')
  async sharePost(@CurrentUser() user: User, @Param('id') postId: string, @Body() body: { content?: string }) {
    const post = await this.storiesService.sharePost(user.id, postId, body.content);
    return ok(post, 'Post shared');
  }

  @Post('posts/:id/save')
  async savePost(@CurrentUser() user: User, @Param('id') postId: string) {
    const result = await this.storiesService.savePost(user.id, postId);
    return ok(result, result.saved ? 'Post saved' : 'Post unsaved');
  }

  @Get('posts/saved')
  async getSavedPosts(@CurrentUser() user: User, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    const { data, total } = await this.storiesService.getSavedPosts(user.id, p, l);
    return paginated(data, total, p, l);
  }

  @Post('posts/:id/report')
  async reportPost(@CurrentUser() user: User, @Param('id') postId: string, @Body() body: { reason: string; description?: string }) {
    const result = await this.storiesService.reportPost(user.id, postId, body.reason, body.description);
    return ok(result, 'Post reported');
  }

  @Post('posts/:id/hide')
  async hidePost(@CurrentUser() user: User, @Param('id') postId: string, @Body() body: { hideType: 'not_interested' | 'snooze' | 'unfollow'; snoozeDays?: number }) {
    const result = await this.storiesService.hidePost(user.id, postId, body.hideType, body.snoozeDays);
    return ok(result, 'Post hidden');
  }

  @Get('posts/:id')
  async getPost(@Param('id') postId: string) {
    const post = await this.storiesService.getPostById(postId);
    return ok(post, 'Post retrieved');
  }

  @Patch('posts/:id')
  async updatePost(@CurrentUser() user: User, @Param('id') postId: string, @Body() body: any) {
    const post = await this.storiesService.updatePost(postId, user.id, body);
    return ok(post, 'Post updated');
  }

  @Delete('posts/:id')
  async deletePost(@CurrentUser() user: User, @Param('id') postId: string) {
    const result = await this.storiesService.deletePost(postId, user.id);
    return ok(null, 'Post deleted');
  }

  @Post('posts/:id/poll/:optionIndex/vote')
  async votePoll(@CurrentUser() user: User, @Param('id') postId: string, @Param('optionIndex') optionIndex: string) {
    const result = await this.storiesService.votePoll(postId, user.id, parseInt(optionIndex, 10));
    return ok(result, 'Vote recorded');
  }
}