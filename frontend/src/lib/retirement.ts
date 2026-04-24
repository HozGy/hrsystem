export function calculateRetirementYear(birthDate: string): number {
  const birth = new Date(birthDate);
  const retirementAge = 60;
  const birthMonth = birth.getMonth();
  
  // Fiscal year: October onwards counts as next year
  // If birth month is October (9) or later, add 1 to retirement year
  const fiscalYearAdjustment = birthMonth >= 9 ? 1 : 0;
  
  return birth.getFullYear() + retirementAge + fiscalYearAdjustment;
}

export function getYearsUntilRetirement(birthDate: string): number {
  const retirementYear = calculateRetirementYear(birthDate);
  const currentYear = new Date().getFullYear();
  return retirementYear - currentYear;
}

export function isRetiringSoon(birthDate: string, monthsThreshold: number = 12): boolean {
  const retirementYear = calculateRetirementYear(birthDate);
  const retirementDate = new Date(retirementYear, new Date(birthDate).getMonth(), new Date(birthDate).getDate());
  const now = new Date();
  const monthsUntil = (retirementDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsUntil <= monthsThreshold && monthsUntil > 0;
}

export function isRetiringThisYear(birthDate: string): boolean {
  const retirementYear = calculateRetirementYear(birthDate);
  const currentYear = new Date().getFullYear();
  return retirementYear === currentYear;
}
