import path from 'path';

export const contentsDirectory = path.join(process.cwd(), 'public', 'SelfSomething');

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


const GITHUB_REPO_URL = 'https://github.com/Fadegentle/SelfSomething/blob/main';

export function getGitHubUrl(currentPath: string) {
    if (!currentPath) return GITHUB_REPO_URL; // 防止空路径返回错误

    try {
        const submodule = 'SelfSomething';
        const contentsIndex = currentPath.indexOf(submodule);

        if (contentsIndex === -1) return GITHUB_REPO_URL;

        const relativePath = currentPath.slice(contentsIndex + submodule.length + 1); // 'contents/'.length = 9
        const decodedPath = decodePath(relativePath);
        const cleanPath = decodedPath.replace(/^\/+/, '');  // 移除开头的斜杠（如果有）

        if (!cleanPath) return GITHUB_REPO_URL;

        return `${GITHUB_REPO_URL}/${decodedPath}`;
    } catch (error) {
        console.error('GitHub URL 生成失败:', error);
        return GITHUB_REPO_URL;
    }
};