function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getSeededRandom(seed = '') {
  if (!seed) return Math.random();

  let value = hashSeed(seed);
  value += 0x6d2b79f5;
  let t = value;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function getRandomInt(min: number, max: number, seed = '') {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(getSeededRandom(seed) * (upper - lower + 1)) + lower;
}

export function getRandomFloat(min: number, max: number, decimals = 1, seed = '') {
  const factor = 10 ** decimals;
  return Math.round((getSeededRandom(seed) * (max - min) + min) * factor) / factor;
}

export function getRandomDate(start: Date, end: Date, seed = '') {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + getSeededRandom(seed) * (endTime - startTime));
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
