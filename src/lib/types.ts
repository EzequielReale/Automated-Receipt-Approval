import { ReceiptCategory } from './constants';

export type { ReceiptCategory };

export interface ExtractedReceiptData {
  merchant_name: string;
  receipt_date: string; // ISO format or string
  total_amount: number;
  category: string;
}

export type ReceiptStatus = 'Approved' | 'Rejected' | 'Needs Review';

export interface RuleEvaluationResult {
  status: ReceiptStatus;
  reason: string;
}

export type UserRole = 'EMPLOYEE' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  userId: string;
  creatorEmail?: string;
  reviewerId?: string;
  reviewerEmail?: string;
  data: ExtractedReceiptData;
  evaluation: RuleEvaluationResult;
  finalStatus?: ReceiptStatus;
  comment?: string;
  imageBase64: string;
  createdAt: string;
  history?: {
    type: string;
    user: string;
    date: string;
  }[];
}
