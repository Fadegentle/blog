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

export function decodePath(path: string) {
    return path
        .split('/')
        .map(part => {
            try {
                return decodeURIComponent(part); // 先解码
            } catch (e) {
                return part; // 如果解码失败（如不需要解码的部分），直接返回原部分
            }
        }).join('/');
}

export function getBaseFileName(fileName: string) {
    const withoutMd = fileName.replace(/\.md$/, '');
    const lastSlashIndex = withoutMd.lastIndexOf('/');
    return lastSlashIndex === -1 ? withoutMd : withoutMd.slice(lastSlashIndex + 1);
}

export function decodeGitHubPath(path: string) {
    return path
        .split('/')
        .map(part => {
            try {
                return decodeURIComponent(part); // 先解码
            } catch (e) {
                return part; // 如果解码失败（如不需要解码的部分），直接返回原部分
            }
        })
        .map(part => encodeURIComponent(part))
        .join('/');
}