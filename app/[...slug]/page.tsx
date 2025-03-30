import { PageContent } from './PageContent';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { decodePath } from '../utils';

const contentsDirectory = path.join(process.cwd(), 'contents');

interface PageParams {
    params: Promise<{ slug: string[] }>;
}

// 同步处理路径的辅助函数
function createPaths(slug: string[]) {
    const slugPath = slug.join('/');
    const undecodeFullPath = path.join(contentsDirectory, slugPath);
    const currentSlug = slug[slug.length - 1];
    return { slugPath, undecodeFullPath: undecodeFullPath, currentSlug, slug };
}

export async function generateStaticParams() {
    const getAllPaths = (dir: string, basePath: string[] = []): { slug: string[] }[] => {
        const entries = fs.readdirSync(dir);
        let paths: { slug: string[] }[] = [];

        entries.forEach(entry => {
            const fullPath = path.join(dir, entry);
            const relativePath = [...basePath, entry];

            if (fs.statSync(fullPath).isDirectory()) {
                paths.push({ slug: relativePath });
                paths = paths.concat(getAllPaths(fullPath, relativePath));
            } else if (entry.endsWith('.md')) {
                paths.push({ slug: relativePath.map(p => p.replace(/\.md$/, '')) });
            }
        });

        return paths;
    };

    return getAllPaths(contentsDirectory);
}

export async function generateMetadata({ params }: PageParams) {
    const resolvedParams = await params; // 确保 params 是异步解析后的
    const resolvedSlug: string[] = [...resolvedParams.slug];
    const { undecodeFullPath, currentSlug } = createPaths(resolvedSlug);
    const fullPath = decodePath(undecodeFullPath);

    try {
        if (fs.existsSync(`${fullPath}.md`)) {
            const fileContents = fs.readFileSync(`${fullPath}.md`, 'utf8');
            const matterResult = matter(fileContents);
            return {
                title: matterResult.data.title || currentSlug,
            };
        }

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            return {
                title: currentSlug,
            };
        }

        return { title: '404 - 页面不存在' };
    } catch (error) {
        return { title: '404 - 页面不存在' };
    }
}

export default async function Post({ params }: PageParams) {
    const resolvedParams = await params;
    const resolvedSlug: string[] = [...resolvedParams.slug];
    const { slugPath, undecodeFullPath } = createPaths(resolvedSlug);
    const decodedFullPath = decodePath(undecodeFullPath);

    try {
        // 检查 .md 文件的多种可能路径 - 全部使用已解码的路径
        const possiblePaths = [
            decodedFullPath,                    // 原始路径
            `${decodedFullPath}.md`,           // 添加 .md 后缀
            path.join(decodedFullPath, 'README.md'),  // 目录下的 README.md
        ];

        // 首先检查是否为目录 - 使用已解码的路径
        if (fs.existsSync(decodedFullPath) && fs.statSync(decodedFullPath).isDirectory()) {
            const entries = fs.readdirSync(decodedFullPath);
            const processedEntries = entries
                .filter(entry => {
                    const entryPath = path.join(decodedFullPath, entry);
                    const isDirectory = fs.statSync(entryPath).isDirectory();
                    return !entry.startsWith('.') &&
                        !entry.toLowerCase().includes('license') &&
                        (entry.endsWith('.md') || isDirectory);
                })
                .map(entry => {
                    const entryPath = path.join(decodedFullPath, entry);
                    const isDirectory = fs.statSync(entryPath).isDirectory();
                    return {
                        name: entry,
                        isDirectory,
                    };
                })
                .sort((a, b) => {
                    if (a.isDirectory !== b.isDirectory) {
                        return a.isDirectory ? 1 : -1;
                    }
                    return a.name.localeCompare(b.name, 'zh-CN');
                });

            return <PageContent
                type="directory"
                entries={processedEntries}
                path={decodedFullPath}
                params={{ slug: resolvedSlug }}
            />;
        }

        for (const mdPath of possiblePaths) {
            if (fs.existsSync(mdPath)) {
                console.log('找到文件:', mdPath);
                const fileContents = fs.readFileSync(mdPath, 'utf8');
                const fileName = path.basename(mdPath, path.extname(mdPath));
                return <PageContent
                    type="file"
                    content={fileContents}
                    title={fileName}
                    path={mdPath}
                />;
            }
        }

        console.log('404 - 未找到文件，尝试的路径:', possiblePaths); // 添加日志
        return <PageContent type="error" path={slugPath} />;
    } catch (error) {
        console.error('Error reading file:', error);
        return <PageContent type="error" path={slugPath} />;
    }
}