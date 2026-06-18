import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument, DocumentType, UploadStatus } from '../entities/medical-document.entity';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 10_485_760; // 10 MB

@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(MedicalDocument)
    private medicalDocRepo: Repository<MedicalDocument>,
  ) {}

  async initiateUpload(
    userId: string,
    documentType: DocumentType,
    fileSize: number,
    mimeType: string,
  ): Promise<MedicalDocument> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must not exceed 10MB');
    }

    const doc = this.medicalDocRepo.create({
      userId,
      documentType,
      uploadStatus: UploadStatus.PENDING,
      // encryptedS3Key and encryptedDek will be set after the actual upload
      encryptedS3Key: '',
      encryptedDek: '',
    });

    return this.medicalDocRepo.save(doc);
  }

  async confirmUpload(
    documentId: string,
    userId: string,
    checksumSha256: string,
  ): Promise<MedicalDocument> {
    const doc = await this.medicalDocRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Medical document not found');
    if (doc.userId !== userId) throw new ForbiddenException('Access denied');

    await this.medicalDocRepo.update(documentId, {
      uploadStatus: UploadStatus.SCANNING,
      checksumSha256,
    });

    return this.medicalDocRepo.findOne({ where: { id: documentId } }) as Promise<MedicalDocument>;
  }

  async getMyDocuments(userId: string): Promise<Partial<MedicalDocument>[]> {
    const docs = await this.medicalDocRepo.find({
      where: { userId },
      withDeleted: false,
    });

    // Strip encrypted keys from the response
    return docs.map(({ encryptedS3Key, encryptedDek, ...rest }) => rest);
  }

  async deleteDocument(documentId: string, userId: string): Promise<{ message: string }> {
    const doc = await this.medicalDocRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Medical document not found');
    if (doc.userId !== userId) throw new ForbiddenException('Access denied');

    await this.medicalDocRepo.softDelete(documentId);

    return { message: 'Document deleted successfully' };
  }
}
