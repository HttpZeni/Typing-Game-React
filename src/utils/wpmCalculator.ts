export function CalculateWPM(characters: number, time: number): number {
    if (time <= 0) return 0;
    return Math.round((characters / 5) / (time));
}