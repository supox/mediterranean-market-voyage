
export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string; // ISO date
}

const STORAGE_KEY = "mediterraneanTraderLeaderboard";

export function loadLeaderboard(): LeaderboardEntry[] {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function qualifiesForLeaderboard(score: number): boolean {
  const lb = loadLeaderboard();
  if (lb.length < 10) return true;
  const min = lb.reduce((min, e) => Math.min(min, e.score), Infinity);
  return score > min;
}

export function addToLeaderboard(entry: LeaderboardEntry) {
  const lb = loadLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  const trimmed = lb.slice(0, 10);
  saveLeaderboard(trimmed);
  return trimmed;
}
