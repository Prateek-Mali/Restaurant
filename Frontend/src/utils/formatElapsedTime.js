export function getElapsedMinutes(createdAt, now = Date.now()) {
  return Math.floor((now - new Date(createdAt).getTime()) / 60000);
}

export function formatElapsedLabel(elapsedMin) {
  return elapsedMin < 1 ? 'Just now' : `${elapsedMin} min`;
}

export function getElapsedColor(elapsedMin) {
  if (elapsedMin > 10) return '#FF5A5A';
  if (elapsedMin >= 5) return '#FFC94A';
  return '#A89C8E';
}
