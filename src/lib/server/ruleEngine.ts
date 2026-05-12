import { ExtractedReceiptData, RuleEvaluationResult } from '../types';
import { VALID_CATEGORIES } from '../constants';

type RuleFunction = (data: ExtractedReceiptData) => RuleEvaluationResult | null;

const validateCategory: RuleFunction = (data) => {
  const normalizedCategory = data.category?.trim().toLowerCase() || '';
  const isCategoryValid = VALID_CATEGORIES.some(
    (validCat) => validCat.toLowerCase() === normalizedCategory
  );

  if (!isCategoryValid) {
    return { status: 'Rejected', reason: `Invalid category: ${data.category || 'None provided'}` };
  }
  return null;
};

const validateDate: RuleFunction = (data) => {
  const parsedDate = new Date(data.receipt_date);
  if (isNaN(parsedDate.getTime())) {
    return { status: 'Rejected', reason: `Invalid date format: ${data.receipt_date}` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const receiptDay = new Date(parsedDate);
  receiptDay.setHours(0, 0, 0, 0);

  if (receiptDay > today) {
    return { status: 'Rejected', reason: `Receipt date is in the future: ${data.receipt_date}` };
  }

  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(today.getMonth() - 12);
  
  if (receiptDay < twelveMonthsAgo) {
    return { status: 'Rejected', reason: `Receipt date is older than 12 months: ${data.receipt_date}` };
  }

  return null;
};

const validateAmount: RuleFunction = (data) => {
  if (data.total_amount >= 100) {
    return { status: 'Needs Review', reason: 'Amount is 100 or greater' };
  }
  return null;
};

export function evaluateReceipt(data: ExtractedReceiptData): RuleEvaluationResult {
  const rules: RuleFunction[] = [
    validateCategory,
    validateDate,
    validateAmount
  ];

  for (const rule of rules) {
    const result = rule(data);
    if (result) return result;
  }

  return { 
    status: 'Approved', 
    reason: 'Category valid, date valid, and amount is under 100' 
  };
}
