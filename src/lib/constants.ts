export const VALID_CATEGORIES = [
  'Office Supplies',
  'Software & Subscriptions',
  'Cloud & Infrastructure',
  'IT & Electronics Accessories & Peripherals',
  'Shipping & Logistics',
  'Business Travel & Transportation',
  'Parking & Tolls',
  'Office Pantry & Refreshments',
  'Facilities & Maintenance Services',
  'Office Furniture',
  'Professional Development Training & Education',
  'Marketing & Advertising',
  'Telecommunications Internet & Phone',
  'Team Events & Employee Engagement',
] as const;

export type ReceiptCategory = typeof VALID_CATEGORIES[number];
