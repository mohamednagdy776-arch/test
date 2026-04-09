import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendsService } from '../services/friends.service';
import { SendFriendRequestDto, RespondToFriendRequestDto, CreateFriendListDto, UpdateFriendListDto, BlockUserDto, RestrictUserDto } from '../dto/friend.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request')
  async sendRequest(@Body() dto: SendFriendRequestDto, @CurrentUser() user: User) {
    const result = await this.friendsService.sendRequest(user.id, dto.userId);
    return ok(result, 'Friend request sent');
  }

  @Post('request/:requestId/accept')
  async acceptRequest(@Param('requestId') requestId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.acceptRequest(user.id, requestId);
    return ok(result, 'Friend request accepted');
  }

  @Post('request/:requestId/decline')
  async declineRequest(@Param('requestId') requestId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.declineRequest(user.id, requestId);
    return ok(result, 'Friend request declined');
  }

  @Delete('request/:requestId')
  async cancelRequest(@Param('requestId') requestId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.cancelRequest(user.id, requestId);
    return ok(result, 'Friend request cancelled');
  }

  @Get('list')
  async getFriends(@CurrentUser() user: User, @Query() query: PaginationDto) {
    const { data, total } = await this.friendsService.getFriends(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('requests')
  async getPendingRequests(@CurrentUser() user: User) {
    const requests = await this.friendsService.getPendingRequests(user.id);
    return ok(requests);
  }

  @Get('requests/sent')
  async getSentRequests(@CurrentUser() user: User) {
    const requests = await this.friendsService.getSentRequests(user.id);
    return ok(requests);
  }

  @Get('suggestions')
  async getSuggestions(@CurrentUser() user: User, @Query('limit') limit?: number) {
    const suggestions = await this.friendsService.getSuggestions(user.id, limit);
    return ok(suggestions);
  }

  @Get('status/:userId')
  async getFriendshipStatus(@CurrentUser() user: User, @Param('userId') otherUserId: string) {
    const status = await this.friendsService.getFriendshipStatus(user.id, otherUserId);
    return ok(status);
  }

  @Delete(':userId')
  async unfriend(@CurrentUser() user: User, @Param('userId') friendId: string) {
    const result = await this.friendsService.deleteFriendship(user.id, friendId);
    return ok(result, 'Unfriend successful');
  }

  @Post('block')
  async blockUser(@Body() dto: BlockUserDto, @CurrentUser() user: User) {
    const result = await this.friendsService.blockUser(user.id, dto.userId);
    return ok(result, 'User blocked');
  }

  @Delete('block/:userId')
  async unblockUser(@Param('userId') userId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.unblockUser(user.id, userId);
    return ok(result, 'User unblocked');
  }

  @Post('restrict')
  async restrictUser(@Body() dto: RestrictUserDto, @CurrentUser() user: User) {
    const result = await this.friendsService.restrictUser(user.id, dto.userId, dto.restrictPosts, dto.restrictMessages);
    return ok(result, 'User restricted');
  }

  @Delete('restrict/:userId')
  async unrestrictUser(@Param('userId') userId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.unrestrictUser(user.id, userId);
    return ok(result, 'User unrestricted');
  }

  @Get('lists')
  async getFriendLists(@CurrentUser() user: User) {
    const lists = await this.friendsService.getFriendLists(user.id);
    return ok(lists);
  }

  @Post('lists')
  async createFriendList(@Body() dto: CreateFriendListDto, @CurrentUser() user: User) {
    const list = await this.friendsService.createFriendList(user.id, dto.name, dto.type);
    return ok(list, 'Friend list created');
  }

  @Patch('lists/:listId')
  async updateFriendList(@Param('listId') listId: string, @Body() dto: UpdateFriendListDto, @CurrentUser() user: User) {
    const list = await this.friendsService.updateFriendList(user.id, listId, dto);
    return ok(list, 'Friend list updated');
  }

  @Delete('lists/:listId')
  async deleteFriendList(@Param('listId') listId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.deleteFriendList(user.id, listId);
    return ok(result, 'Friend list deleted');
  }

  @Post('follow/:userId')
  async followUser(@Param('userId') followedId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.followUser(user.id, followedId);
    return ok(result, 'Now following user');
  }

  @Delete('follow/:userId')
  async unfollowUser(@Param('userId') followedId: string, @CurrentUser() user: User) {
    const result = await this.friendsService.unfollowUser(user.id, followedId);
    return ok(result, 'Unfollowed user');
  }
}