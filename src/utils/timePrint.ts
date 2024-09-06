export const formatTime = (rawSeconds: number | null | undefined): string => {
  if (!rawSeconds) {
    return "nullTime";
  }

  let seconds: number = Math.floor(rawSeconds) % 60;
  let minutes: number = Math.floor(rawSeconds / 60) % 60;
  let hours: number = Math.floor(rawSeconds / 3600);

  let formattedTime: string = "";
  if (hours > 0) {
    formattedTime += `${hours}h`;
  }
  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m`;
  }
  if (seconds > 0 || minutes > 0 || hours > 0) {
    formattedTime += `${seconds}s`;
  }

  return formattedTime || "0s";
};

export const formatTimeMillis = (
  milliseconds: number | null | undefined
): string => {
  if (!milliseconds) {
    return "nullTime";
  }

  return formatTime(milliseconds / 1000);
};

export const formatDateTime = (raw: number | null | undefined): string => {
  if (!raw) {
    return "nullTime";
  }

  const date: Date = new Date(raw);

  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const day: string = String(date.getDate()).padStart(2, "0");
  const hours: string = String(date.getHours()).padStart(2, "0");
  const minutes: string = String(date.getMinutes()).padStart(2, "0");
  const seconds: string = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};
