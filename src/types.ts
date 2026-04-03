export interface UserProfile {
  uid: string;
  name: string;
  age?: number;
  sex?: string;
  photoUrl?: string;
  vitality_score: number;
  balance: number;
  monthly_spending: number;
  savings: number;
  currency: string;
  primary_goal: string;
  income_range: string;
  credit_score_range: string;
  notifications: Record<string, any>;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  is_flagged: boolean;
  timestamp: number;
  name: string;
}

export interface CreditCard {
  name: string;
  annualFee: string;
  introBonus: string;
  rewardsRate: string;
  recommendedCreditScore: string;
  foreignTransactionFee: string;
  image: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
