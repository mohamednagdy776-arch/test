import { Injectable } from '@nestjs/common';

@Injectable()
export class BiasMonitorService {
  private readonly FEATURE_IMPORTANCE_CAP = 0.4; // 40% max per feature

  validateScoreBreakdown(breakdown: Record<string, number>): { valid: boolean; violations: string[] } {
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const violations: string[] = [];
    for (const [feature, value] of Object.entries(breakdown)) {
      if (total > 0 && value / total > this.FEATURE_IMPORTANCE_CAP) {
        violations.push(
          `Feature '${feature}' exceeds 40% cap (${Math.round((value / total) * 100)}%)`,
        );
      }
    }
    return { valid: violations.length === 0, violations };
  }

  async generateFairnessReport(): Promise<{ generatedAt: Date; note: string }> {
    return {
      generatedAt: new Date(),
      note: 'Full bias analysis requires production data pipeline',
    };
  }
}
