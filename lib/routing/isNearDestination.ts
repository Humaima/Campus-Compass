export function isNearDestination(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  threshold = 4
) {

  const distance = Math.sqrt(
    Math.pow(playerX - targetX, 2) +
    Math.pow(playerY - targetY, 2)
  );

  return distance <= threshold;
}
