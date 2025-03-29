import { PageContent } from './PageContent';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentsDirectory = path.join(process.cwd(), 'contents');

interface PageParams {
    params: {
        slug: string[];
    };
}

// 同步处理路径的辅助函数
function createPaths(slug: string[]) {
    const slugPath = slug.join('/');
    const fullPath = path.join(contentsDirectory, slugPath);
    const currentSlug = slug[slug.length - 1];
    return { slugPath, fullPath, currentSlug, slug };
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
    const { fullPath, currentSlug } = createPaths(resolvedSlug);

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
    const resolvedParams = await params; // 确保 params 是异步解析后的
    const resolvedSlug: string[] = [...resolvedParams.slug];
    const { slugPath, fullPath, slug } = createPaths(resolvedSlug);

    try {
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            const entries = fs.readdirSync(fullPath);
            const processedEntries = entries
                .filter(entry => {
                    const entryPath = path.join(fullPath, entry);
                    const isDirectory = fs.statSync(entryPath).isDirectory();
                    return !entry.startsWith('.') &&
                        !entry.toLowerCase().includes('license') &&
                        (entry.endsWith('.md') || isDirectory);
                })
                .map(entry => {
                    const entryPath = path.join(fullPath, entry);
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
                path={fullPath}
                params={{ slug: resolvedSlug }}  // 传递已解析的 slug
            />;
        }

        // 检查 .md 文件
        const mdPath = fullPath.endsWith('.md') ? fullPath : `${fullPath}.md`;
        if (fs.existsSync(mdPath)) {
            const fileContents = fs.readFileSync(mdPath, 'utf8');
            const matterResult = matter(fileContents);
            return <PageContent
                type="file"
                content={fileContents}
                title={matterResult.data.title}
            />;
        }

        return <PageContent type="error" path={slugPath} />;
    } catch (error) {
        console.error('Error reading file:', error);
        return <PageContent type="error" path={slugPath} />;
    }
}