import { format, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, isSameDay, isSameMonth, isSameYear, parseISO, isValid } from 'date-fns';

export function formatEntryDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isSameYear(dateObj, new Date())) {
    return format(dateObj, 'MMM d, h:mm a');
  }
  
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatCalendarDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

export function formatTimeOnly(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid time';
  }

  return format(dateObj, 'h:mm a');
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  if (isSameDay(startDate, endDate)) {
    return formatDisplayDate(startDate);
  }
  
  if (isSameMonth(startDate, endDate)) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  }
  
  if (isSameYear(startDate, endDate)) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
  
  return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date),
    end: endOfWeek(date),
  };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getCalendarDays(month: Date): Date[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const weekStart = startOfWeek(start);
  const weekEnd = endOfWeek(end);
  
  const days: Date[] = [];
  let current = weekStart;
  
  while (current <= weekEnd) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return days;
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function getDateFromDaysAgo(daysAgo: number): Date {
  return subDays(new Date(), daysAgo);
}

export function getDayOfWeek(date: Date): string {
  return format(date, 'EEEE');
}

export function getShortDayOfWeek(date: Date): string {
  return format(date, 'EEE');
}

export function getMonthName(date: Date): string {
  return format(date, 'MMMM');
}

export function getShortMonthName(date: Date): string {
  return format(date, 'MMM');
}

export function getYear(date: Date): number {
  return date.getFullYear();
}

export function createDateFromString(dateString: string): Date | null {
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
}

export function isValidDateString(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date);
}

export function sortDatesByNewest(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => b.getTime() - a.getTime());
}

export function sortDatesByOldest(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => a.getTime() - b.getTime());
}

export function groupDatesByDay(dates: Date[]): Map<string, Date[]> {
  const groups = new Map<string, Date[]>();
  
  dates.forEach(date => {
    const dayKey = formatCalendarDate(date);
    if (!groups.has(dayKey)) {
      groups.set(dayKey, []);
    }
    groups.get(dayKey)!.push(date);
  });
  
  return groups;
}

export function groupDatesByMonth(dates: Date[]): Map<string, Date[]> {
  const groups = new Map<string, Date[]>();
  
  dates.forEach(date => {
    const monthKey = format(date, 'yyyy-MM');
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(date);
  });
  
  return groups;
}

export function getStreakDays(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = sortDatesByNewest(dates);
  const today = new Date();
  let streak = 0;
  let currentDate = today;
  
  for (const date of sortedDates) {
    if (isSameDay(date, currentDate)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export function getThisWeekDates(): Date[] {
  const today = new Date();
  const { start, end } = getWeekRange(today);
  
  const dates: Date[] = [];
  let current = start;
  
  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return dates;
}

export function getThisMonthDates(): Date[] {
  const today = new Date();
  const { start, end } = getMonthRange(today);
  
  const dates: Date[] = [];
  let current = start;
  
  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  
  return dates;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseDuration(durationString: string): number {
  const parts = durationString.split(':').map(Number);
  
  if (parts.length === 1) {
    return parts[0]; // seconds only
  }
  
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // minutes:seconds
  }
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hours:minutes:seconds
  }
  
  return 0;
}

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DEFAULT_TIME_FORMAT = 'HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMMM d, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMMM d, yyyy h:mm a';
export const DISPLAY_TIME_FORMAT = 'h:mm a';
