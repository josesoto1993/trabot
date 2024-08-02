const formatTime = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000) % 60;
  let minutes = Math.floor(seconds / 60) % 60;
  let hours = Math.floor(minutes / 60);

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

module.exports = {
  formatTime,
};
