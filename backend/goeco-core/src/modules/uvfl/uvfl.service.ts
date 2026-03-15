import { Injectable } from '@nestjs/common';

type UvflTier = 'F1' | 'F2' | 'F3';

interface MemberContribution {
  memberId: string;
  contribution: number;
  kpiScore: number;
  abuseFlag: boolean;
}

interface DistributionLine {
  memberId: string;
  tier: UvflTier;
  grossAmount: number;
  cappedAmount: number;
}

@Injectable()
export class UvflService {
  evaluateTier(contribution: number, kpiScore: number): UvflTier {
    if (contribution >= 5_000 && kpiScore >= 90) return 'F3';
    if (contribution >= 2_000 && kpiScore >= 75) return 'F2';
    return 'F1';
  }

  distributeProfitPool(poolAmount: number, members: MemberContribution[]): DistributionLine[] {
    const eligible = members.filter((m) => !m.abuseFlag && m.contribution > 0);
    const totalContribution = eligible.reduce((sum, m) => sum + m.contribution, 0);

    if (totalContribution === 0) {
      return [];
    }

    return eligible.map((member) => {
      const tier = this.evaluateTier(member.contribution, member.kpiScore);
      const grossAmount = (poolAmount * member.contribution) / totalContribution;
      const cap = this.rewardCapByTier(tier);
      return {
        memberId: member.memberId,
        tier,
        grossAmount,
        cappedAmount: Math.min(grossAmount, cap),
      };
    });
  }

  private rewardCapByTier(tier: UvflTier): number {
    switch (tier) {
      case 'F3':
        return 10_000;
      case 'F2':
        return 5_000;
      default:
        return 2_000;
    }
  }
}
