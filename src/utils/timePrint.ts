const formatTime = (rawSeconds) => {
  if (!rawSeconds) {
    return "nullTime";
  }

  let seconds = Math.floor(rawSeconds) % 60;
  let minutes = Math.floor(rawSeconds / 60) % 60;
  let hours = Math.floor(rawSeconds / 3600);

  let formattedTime = "";
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

const formatTimeMillis = (milliseconds) => {
  if (!milliseconds) {
    return "nullTime";
  }

  return formatTime(milliseconds / 1000);
};

const formatDateTime = (rawSeconds) => {
  if (!rawSeconds) {
    return "nullTime";
  }

  const date = new Date(rawSeconds * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

module.exports = {
  formatTime,
  formatTimeMillis,
  formatDateTime,
};
