import fs from 'fs';
import path from 'path';
import RSS from 'rss';
import matter from 'gray-matter';
import { contentsDirectory } from '../utils';

const SITE_URL = 'https://fadegentle.com'; // 替换为你的实际网站 URL

export async function GET() {
    const feed = new RSS({
        title: 'Fadegentle WebSite',
        description: '个人博客 & 知识库',
        feed_url: `${SITE_URL}/rss.xml`,
        site_url: SITE_URL,
        language: 'zh-CN',
        pubDate: new Date(),
    });

    // 递归获取所有 .md 文件
    const getAllMarkdownFiles = (dir: string): string[] => {
        let results: string[] = [];
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                results = results.concat(getAllMarkdownFiles(fullPath));
            } else if (file.endsWith('.md')) {
                results.push(fullPath);
            }
        });

        return results;
    };

    const markdownFiles = getAllMarkdownFiles(contentsDirectory);

    markdownFiles.forEach((filePath) => {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const matterResult = matter(fileContents);
        const relativePath = path.relative(contentsDirectory, filePath);
        const urlPath = relativePath.replace(/\.md$/, '');

        feed.item({
            title: matterResult.data.title || path.basename(filePath, '.md'),
            description: matterResult.content,
            url: `${SITE_URL}/${urlPath}`,
            date: matterResult.data.date || new Date(),
            author: matterResult.data.author || 'Fadegentle',
        });
    });

    return new Response(feed.xml(), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}