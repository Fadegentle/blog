export function generateRandomColdColor(): string {
    const h = Math.floor(Math.random() * (240 - 200) + 200);
    const s = Math.floor(Math.random() * 30 + 30) + '%';
    const l = Math.floor(Math.random() * 20 + 70) + '%';
    return `hsl(${h}, ${s}, ${l})`;
}

export function generateRandomWarmColor(): string {
    const h = Math.floor(Math.random() * 40);
    const s = Math.floor(Math.random() * 30 + 30) + '%';
    const l = Math.floor(Math.random() * 20 + 70) + '%';
    return `hsl(${h}, ${s}, ${l})`;
}