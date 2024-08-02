const formatTime = (rawSeconds) => {
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
  return formatTime(milliseconds / 1000);
};

module.exports = {
  formatTime,
  formatTimeMillis,
};
