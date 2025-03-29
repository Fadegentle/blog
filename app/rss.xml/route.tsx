import fs from 'fs';
import path from 'path';
import RSS from 'rss';
import matter from 'gray-matter';

const contentsDirectory = path.join(process.cwd(), 'contents');

export async function GET() {
    const feed = new RSS({
        title: '你的博客标题',
        description: '你的博客描述',
        feed_url: '你的博客 URL/rss.xml',
        site_url: '你的博客 URL',
    });

    const fileNames = fs.readdirSync(contentsDirectory);

    fileNames.forEach((fileName) => {
        const fullPath = path.join(contentsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        feed.item({
            title: matterResult.data.title,
            description: matterResult.content,
            url: `你的博客 URL/${fileName.replace(/\.md$/, '')}`,
            date: matterResult.data.date,
        });
    });

    return new Response(feed.xml(), {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}