import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const contentsDirectory = path.join(process.cwd(), 'contents');

export async function generateStaticParams() {
    const fileNames = fs.readdirSync(contentsDirectory);

    return fileNames.map((fileName) => {
        return {
            slug: fileName.replace(/\.md$/, ''),
        };
    });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const fullPath = path.join(contentsDirectory, `${params.slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
        title: matterResult.data.title,
    };
}

export default async function Post({ params }: { params: { slug: string } }) {
    const fullPath = path.join(contentsDirectory, `${params.slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return (
        <article>
            <h1>{matterResult.data.title}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{matterResult.content}</ReactMarkdown>
        </article>
    );
}