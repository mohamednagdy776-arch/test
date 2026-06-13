import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from '../services/groups.service';
import { PostsService } from '../../posts/services/posts.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(
    private groupsService: GroupsService,
    private postsService: PostsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @CurrentUser() user: User) {
    const group = await this.groupsService.create(dto, user);
    return ok(group, 'Group created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.groupsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('search')
  async search(@Query('q') q: string, @CurrentUser() user: User) {
    const result = await this.groupsService.search(q, user.id);
    return ok(result);
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    const results = await this.groupsService.autocomplete(q);
    return ok(results);
  }

  @Get('my')
  async myGroups(@CurrentUser() user: User) {
    const groups = await this.groupsService.getMyGroups(user.id);
    return ok(groups);
  }

  // Static segments MUST be declared before @Get(':id'); otherwise they are
  // captured by the :id param and rejected as a non-UUID ("Invalid identifier
  // format").
  @Get('public')
  async findPublic(@Query() query: PaginationDto) {
    const { data, total } = await this.groupsService.findByPrivacy('public', query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('private')
  async findPrivate(@Query() query: PaginationDto) {
    const { data, total } = await this.groupsService.findByPrivacy('private', query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('suggested')
  async suggested(@Query('limit') limit: string, @CurrentUser() user: User) {
    return ok(await this.groupsService.getSuggested(user.id, limit ? Number(limit) : 5));
  }

  @Get('pending')
  async pending(@CurrentUser() user: User) {
    return ok(await this.groupsService.getPendingRequests(user.id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const group = await this.groupsService.findOne(id, user.id);
    return ok(group);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @CurrentUser() user: User) {
    const group = await this.groupsService.join(id, user);
    return ok(group, 'Joined group');
  }

  @Delete(':id/leave')
  async leave(@Param('id') id: string, @CurrentUser() user: User) {
    await this.groupsService.leave(id, user.id);
    return ok(null, 'Left group');
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Query() query: PaginationDto) {
    const members = await this.groupsService.getMembers(id, query.page!, query.limit!);
    return ok(members);
  }

  // ── Group posts (H-09) ────────────────────────────────────────

  @Get(':id/posts')
  async getGroupPosts(@Param('id') id: string, @Query() query: PaginationDto) {
    const { data, total } = await this.postsService.findByGroup(
      id,
      query.page || 1,
      query.limit || 20,
    );
    return paginated(data, total, query.page || 1, query.limit || 20);
  }

  @Post(':id/posts')
  async createGroupPost(
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    // Must be a member to post in the group (was unchecked — any user who knew
    // a group UUID could post in it, including private/secret groups).
    if (!(await this.groupsService.isMember(id, user.id))) {
      throw new ForbiddenException('You must be a member of this group to post');
    }
    const post = await this.postsService.create(id, dto, user);
    return ok(post, 'Post created');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.groupsService.delete(id);
    return ok(null, 'Group deleted');
  }
}
