export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return "just now";
  }

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  let counter;
  for (const interval in intervals) {
    counter = Math.floor(seconds / intervals[interval]);
    if (counter > 0) {
      if (counter === 1) {
        return `${counter} ${interval} ago`;
      } else {
        return `${counter} ${interval}s ago`;
      }
    }
  }

  return `${Math.floor(seconds)} seconds ago`;
}
