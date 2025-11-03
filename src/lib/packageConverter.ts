/**
 * Utility functions to handle different package formats
 * Supports both rupee amounts (9425000) and LPA values (9.5)
 */

/**
 * Convert package value to LPA (Lakhs Per Annum)
 * Handles both formats:
 * - If value > 1000, assumes it's in rupees and converts to LPA
 * - If value <= 1000, assumes it's already in LPA
 */
export const convertToLPA = (packageValue: number): number => {
  if (packageValue > 1000) {
    // Value is in rupees, convert to LPA
    return packageValue / 100000;
  }
  // Value is already in LPA
  return packageValue;
};

/**
 * Convert package value to rupees
 * Handles both formats:
 * - If value > 1000, assumes it's already in rupees
 * - If value <= 1000, assumes it's in LPA and converts to rupees
 */
export const convertToRupees = (packageValue: number): number => {
  if (packageValue > 1000) {
    // Value is already in rupees
    return packageValue;
  }
  // Value is in LPA, convert to rupees
  return packageValue * 100000;
};

/**
 * Format package value for display
 * Always returns in LPA format with proper decimal places
 */
export const formatPackage = (packageValue: number): string => {
  const lpa = convertToLPA(packageValue);
  return `₹${lpa.toFixed(2)} LPA`;
};

/**
 * Format package value in rupees with Indian numbering system
 */
export const formatPackageInRupees = (packageValue: number): string => {
  const rupees = convertToRupees(packageValue);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
};

/**
 * Determine if a package value is in rupees or LPA
 */
export const isInRupees = (packageValue: number): boolean => {
  return packageValue > 1000;
};

/**
 * Get package display with both formats
 */
export const getPackageDisplay = (packageValue: number): {
  lpa: number;
  rupees: number;
  lpaFormatted: string;
  rupeesFormatted: string;
} => {
  const lpa = convertToLPA(packageValue);
  const rupees = convertToRupees(packageValue);
  
  return {
    lpa,
    rupees,
    lpaFormatted: formatPackage(packageValue),
    rupeesFormatted: formatPackageInRupees(packageValue)
  };
};
