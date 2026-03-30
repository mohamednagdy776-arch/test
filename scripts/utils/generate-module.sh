#!/bin/bash
# scripts/utils/generate-module.sh
# Scaffolds a new NestJS feature module following the Tayyibt module structure.
# Usage: bash scripts/utils/generate-module.sh <module-name>
#
# Example: bash scripts/utils/generate-module.sh notifications
# Creates: backend/src/notifications/ with all required files

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "❌ Usage: bash scripts/utils/generate-module.sh <module-name>"
  exit 1
fi

# Convert to kebab-case for files, PascalCase for classes
KEBAB=$(echo "$MODULE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')
PASCAL=$(echo "$MODULE_NAME" | sed 's/-\([a-z]\)/\U\1/g;s/^\([a-z]\)/\U\1/')

TARGET="backend/src/$KEBAB"

if [ -d "$TARGET" ]; then
  echo "❌ Module '$KEBAB' already exists at $TARGET"
  exit 1
fi

echo "⏳ Scaffolding module: $PASCAL ($KEBAB)..."

mkdir -p "$TARGET/controllers"
mkdir -p "$TARGET/services"
mkdir -p "$TARGET/dto"
mkdir -p "$TARGET/entities"
mkdir -p "$TARGET/tests"

# --- Module file ---
cat > "$TARGET/$KEBAB.module.ts" << EOF
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${PASCAL} } from './entities/${KEBAB}.entity';
import { ${PASCAL}Service } from './services/${KEBAB}.service';
import { ${PASCAL}Controller } from './controllers/${KEBAB}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${PASCAL}])],
  providers: [${PASCAL}Service],
  controllers: [${PASCAL}Controller],
})
export class ${PASCAL}Module {}
EOF

# --- Entity ---
cat > "$TARGET/entities/$KEBAB.entity.ts" << EOF
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('${KEBAB}s')
export class ${PASCAL} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: add columns matching database-schema.md

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
EOF

# --- DTO ---
cat > "$TARGET/dto/create-${KEBAB}.dto.ts" << EOF
import { IsString } from 'class-validator';

export class Create${PASCAL}Dto {
  @IsString()
  // TODO: add validated fields
  name: string;
}
EOF

# --- Service ---
cat > "$TARGET/services/$KEBAB.service.ts" << EOF
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${PASCAL} } from '../entities/${KEBAB}.entity';

@Injectable()
export class ${PASCAL}Service {
  constructor(
    @InjectRepository(${PASCAL}) private repo: Repository<${PASCAL}>,
  ) {}

  // TODO: implement service methods
  // All business logic goes here — never in the controller
}
EOF

# --- Controller ---
cat > "$TARGET/controllers/$KEBAB.controller.ts" << EOF
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ${PASCAL}Service } from '../services/${KEBAB}.service';

// Thin controller — request/response only, no business logic
@UseGuards(AuthGuard('jwt'))
@Controller('${KEBAB}s')
export class ${PASCAL}Controller {
  constructor(private ${KEBAB}Service: ${PASCAL}Service) {}

  // TODO: add route handlers
}
EOF

# --- Test skeleton ---
cat > "$TARGET/tests/$KEBAB.service.spec.ts" << EOF
import { Test, TestingModule } from '@nestjs/testing';
import { ${PASCAL}Service } from '../services/${KEBAB}.service';

describe('${PASCAL}Service', () => {
  let service: ${PASCAL}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ${PASCAL}Service,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<${PASCAL}Service>(${PASCAL}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: add unit tests for each service method
});
EOF

echo ""
echo "✅ Module '$PASCAL' scaffolded at $TARGET"
echo ""
echo "Next steps:"
echo "  1. Add entity columns to $TARGET/entities/$KEBAB.entity.ts"
echo "  2. Implement service methods in $TARGET/services/$KEBAB.service.ts"
echo "  3. Add route handlers in $TARGET/controllers/$KEBAB.controller.ts"
echo "  4. Import ${PASCAL}Module in backend/src/app.module.ts"
