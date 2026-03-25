const CAREER_START = new Date(2014, 0, 1); // January 2014

export function getYearsOfExperience(): number {
  const now = new Date();
  const years = now.getFullYear() - CAREER_START.getFullYear();
  const monthDiff = now.getMonth() - CAREER_START.getMonth();
  return monthDiff < 0 ? years - 1 : years;
}
