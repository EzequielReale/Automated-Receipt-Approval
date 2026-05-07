import { ExtractedReceiptData, RuleEvaluationResult } from './types';
import { VALID_CATEGORIES } from './constants';

export function evaluateReceipt(data: ExtractedReceiptData): RuleEvaluationResult {
  const { category, receipt_date, total_amount } = data;

  // 1. Validating Category (Case-insensitive, normalized)
  const normalizedCategory = category?.trim().toLowerCase() || '';
  const isCategoryValid = VALID_CATEGORIES.some(
    (validCat) => validCat.toLowerCase() === normalizedCategory
  );

  if (!isCategoryValid) {
    return { status: 'Rejected', reason: `Invalid category: ${category || 'None provided'}` };
  }

  // 2. Date validations
  const parsedDate = new Date(receipt_date);
  if (isNaN(parsedDate.getTime())) {
    return { status: 'Rejected', reason: `Invalid date format: ${receipt_date}` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const receiptDay = new Date(parsedDate);
  receiptDay.setHours(0, 0, 0, 0); // Start of receipt day

  // Reject if in the future
  if (receiptDay > today) {
    return { status: 'Rejected', reason: `Receipt date is in the future: ${receipt_date}` };
  }

  // Reject if strictly older than 12 months
  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(today.getMonth() - 12);
  
  if (receiptDay < twelveMonthsAgo) {
    return { status: 'Rejected', reason: `Receipt date is older than 12 months: ${receipt_date}` };
  }

  // 3. Needs Review validation
  if (total_amount >= 100) {
    return { status: 'Needs Review', reason: 'Amount is 100 or greater' };
  }

  // 4. Approved validation
  return { status: 'Approved', reason: 'Category valid, date valid, and amount is under 100' };
}
