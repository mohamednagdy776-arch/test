import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

// A real DTO class (not an inline intersection type) so the global ValidationPipe
// actually runs: it applies PaginationDto's page/limit defaults and number
// transform. With the old `PaginationDto & { isReel?: string }` intersection the
// metatype was `Object`, validation was skipped, page/limit stayed undefined and
// GET /videos (no query params) 500'd on `(undefined-1)*undefined` (#749).
export class VideoQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  isReel?: string;
}
