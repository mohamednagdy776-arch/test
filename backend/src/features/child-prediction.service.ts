import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ChildPredictionService {
  private readonly logger = new Logger(ChildPredictionService.name);
  private readonly aiUrl = 'http://ai-service:5000/api/v1/child-prediction';

  constructor(private readonly http: HttpService) {}

  async predict(parent1: Buffer, parent2: Buffer): Promise<string> {
    const body = {
      parent1: parent1.toString('base64'),
      parent2: parent2.toString('base64'),
    };

    try {
      const res = await this.http.axiosRef.post<{ image: string; format: string }>(
        this.aiUrl,
        body,
        { headers: { 'Content-Type': 'application/json' }, timeout: 120_000 },
      );
      return res.data.image;
    } catch (err: any) {
      const status: number | undefined = err?.response?.status;
      const detail: string = err?.response?.data?.detail ?? err?.message ?? 'unknown error';
      this.logger.error(`AI service ${status ?? 'network'} error: ${detail}`);
      if (status === 422) throw new BadRequestException(detail);
      throw new InternalServerErrorException('Child prediction service unavailable');
    }
  }
}