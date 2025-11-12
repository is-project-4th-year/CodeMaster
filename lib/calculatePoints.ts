export function calculatePoints(rank: number): number {
  const pointsMap: Record<number, number> = {
    8: 10,   // 8 kyu
    7: 20,   // 7 kyu
    6: 30,   // 6 kyu
    5: 50,   // 5 kyu
    4: 80,   // 4 kyu
    3: 120,  // 3 kyu
    2: 180,  // 2 kyu
    1: 250   // 1 kyu
  };
  
  return pointsMap[rank] || 10;
}
