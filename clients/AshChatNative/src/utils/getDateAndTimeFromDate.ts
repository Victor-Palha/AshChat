export function formatTimeOrDate(date: string) {
    const inputDate = new Date(date);
    const now = new Date();
    const millisecondsIn24Hours = 24 * 60 * 60 * 1000; // 24 hours
  
    const difference = now.getMilliseconds() - inputDate.getMilliseconds();
  
    if (difference < millisecondsIn24Hours) {
      const hours = inputDate.getHours().toString().padStart(2, "0");
      const minutes = inputDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } else if (difference < 2 * millisecondsIn24Hours) {
      return "Yesterday";
    } else {
      const day = inputDate.getDate().toString().padStart(2, "0");
      const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}`;
    }
  }