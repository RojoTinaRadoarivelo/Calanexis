const MONTHS: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function DateToString(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${day} ${MONTHS[month]} ${year}`;
}
