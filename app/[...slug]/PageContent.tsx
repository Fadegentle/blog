'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';

interface Entry {
    name: string;
    isDirectory: boolean;
}

interface PageContentProps {
    type: 'file' | 'directory' | 'error';
    content?: string;
    title?: string;
    entries?: Array<{
        name: string;
        isDirectory: boolean;
    }>;
    path?: string;
    params?: {
        slug: string[];  // 现在是已解析的数组，不再需要等待
    };
}

const GITHUB_REPO_URL = 'https://github.com/Fadegentle/SelfSomething/blob/main';

export function PageContent({ type, content, entries, path, params }: PageContentProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        Promise.resolve().then(() => setIsLoaded(true));
        return () => setIsLoaded(false);
    }, [type, content, path]);

    const getGitHubUrl = (currentPath: string) => {
        if (!currentPath) return '';
        try {
            const pathParts = currentPath.split('/');
            const contentsIndex = pathParts.indexOf('contents');
            if (contentsIndex === -1) return '';

            // 提取相对路径并处理编码
            const relativeParts = pathParts.slice(contentsIndex + 1);
            const encodedParts = relativeParts.map(part => encodeURIComponent(part));
            const relativePath = encodedParts.join('/');

            if (!relativePath) return '';

            // 对于文件类型，确保添加 .md 后缀
            if (!relativePath.endsWith('.md') && type === 'file') {
                return `${GITHUB_REPO_URL}/${relativePath}.md`;
            }
            return `${GITHUB_REPO_URL}/${relativePath}`;
        } catch (error) {
            console.error('Error generating GitHub URL:', error);
            return '';
        }
    };

    const renderContent = () => {
        switch (type) {
            case 'directory': {
                // 使用已解析的 params
                const directoryName = params?.slug?.length
                    ? params.slug[params.slug.length - 1]
                    : '根目录';

                return (
                    <article>
                        <div className="nav-title">
                            <h2>
                                🗂️ {directoryName}
                                <a href="/rss.xml" className="rss-link" target="_blank" rel="noopener noreferrer">
                                    <svg className="rss-icon" viewBox="0 0 24 24">
                                        <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
                                    </svg>
                                </a>
                            </h2>
                            <ul className="nav-list">
                                {entries?.map((entry) => {
                                    const displayName = entry.name.replace(/\.md$/, '').split('-').join(' ');
                                    // 完整的路径处理，确保保留父级目录
                                    const basePath = params?.slug || [];
                                    const currentPath = [...basePath];
                                    const linkSlug = [...currentPath, entry.name.replace(/\.md$/, '')];
                                    const linkPath = `/${linkSlug.join('/')}`;

                                    return (
                                        <li key={entry.name}>
                                            <a href={linkPath}>
                                                <div className="post-title">
                                                    {entry.isDirectory ? `🗂️ ${displayName}` : displayName}
                                                </div>
                                                {!entry.isDirectory && (
                                                    <div className="post-meta">
                                                        <span className="post-date">
                                                            {new Date().toLocaleDateString('zh-CN')}
                                                        </span>
                                                    </div>
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </article>
                );
            }

            case 'file': {
                const matterResult = matter(content || '');
                const githubUrl = path ? getGitHubUrl(path) : '';
                return (
                    <article>
                        <div className="nav-title">
                            <h2>{matterResult.data.title}</h2>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {matterResult.content}
                            </ReactMarkdown>
                            {githubUrl && (
                                <p className="github-link">
                                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                                        在 GitHub 上查看原文
                                    </a>
                                </p>
                            )}
                        </div>
                    </article>
                );
            }

            default:
                return (
                    <article>
                        <div className="nav-title">
                            <h2>404 - 页面不存在</h2>
                            <p>抱歉，找不到请求的页面。</p>
                            {path && <p>路径: <a href={getGitHubUrl(path)} target="_blank" rel="noopener noreferrer">在 GitHub 上查看</a></p>}
                        </div>
                    </article>
                );
        }
    };

    return (
        <div className={`page-content ${isLoaded ? 'loaded' : ''}`}>
            {renderContent()}
        </div>
    );
}