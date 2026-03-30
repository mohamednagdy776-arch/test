import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
  ) {}

  async create(postId: string, dto: CreateCommentDto, user: User) {
    const comment = this.commentsRepo.create({
      content: dto.content,
      post: { id: postId } as any,
      user,
      parent: dto.parentId ? ({ id: dto.parentId } as any) : null,
    });
    return this.commentsRepo.save(comment);
  }

  async findByPost(postId: string) {
    // Returns top-level comments; client can nest by parentId
    return this.commentsRepo.find({
      where: { post: { id: postId } },
      order: { createdAt: 'ASC' },
      relations: ['user', 'parent'],
    });
  }
}
