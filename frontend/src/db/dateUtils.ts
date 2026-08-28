export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isTimePassed(timeStr: string, date: Date = new Date()): boolean {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  
  if (date.toDateString() !== now.toDateString()) {
    return date.getTime() < now.getTime();
  }

  const target = new Date(date);
  target.setHours(hours, minutes, 0, 0);
  return target.getTime() <= now.getTime();
}

/**
 * Returns true if the target time is overdue by more than gracePeriodMinutes.
 */
export function isOverdue(timeStr: string, gracePeriodMinutes: number, date: Date = new Date()): boolean {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const target = new Date(date);
  target.setHours(hours, minutes, 0, 0);
  
  const threshold = new Date(target.getTime() + gracePeriodMinutes * 60000);
  return new Date().getTime() > threshold.getTime();
}
