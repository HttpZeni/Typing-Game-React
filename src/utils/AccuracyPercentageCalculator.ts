export function AccurancyPercentageCalculator(correctChars: number, totalChar: number) {
    if (totalChar === 0) return 0;
    const num = (correctChars / totalChar) * 100;
    return Math.round(num * 100) / 100;
}