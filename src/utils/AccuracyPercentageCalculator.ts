export function AccurancyPercentageCalculator(correctChars: number, totalChar: number) {
    const num = (correctChars / totalChar) * 100;
    return Math.round(num * 100) / 100;
}