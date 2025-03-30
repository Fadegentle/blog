'use client';

import { HTMLAttributes, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import matter from 'gray-matter';
import { getGitHubUrl } from '../utils';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { Plugin } from 'unified';
import { Root } from 'mdast';
import remarkAdmonitions from './remarkAdmonitions';

// 初始化 Mermaid 配置
mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'system-ui, -apple-system, "Segoe UI"',
    fontSize: 14,
    flowchart: {
        htmlLabels: true,
        curve: 'basis'
    }
});

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

const MermaidComponent = ({ value }: { value: string }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        try {
            mermaid.render('mermaid-svg', value).then(({ svg }) => {
                setSvg(svg);
                setError('');
            }).catch(err => {
                console.error('Mermaid 渲染错误:', err);
                setError('图表语法错误，请检查 Mermaid 语法');
            });
        } catch (err) {
            console.error('Mermaid 处理错误:', err);
            setError('图表处理失败');
        }
    }, [value]);

    if (error) {
        return (
            <div className="mermaid-error">
                <p>{error}</p>
                <pre>{value}</pre>
            </div>
        );
    }

    return (
        <div
            className="mermaid-wrapper"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

interface DirectiveNode {
    type: string;
    name: string;
    data?: {
        hName?: string;
        hProperties?: Record<string, unknown>;
    };
}

const remarkCustomDirectives: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, (node) => {
            if (!node || typeof node !== 'object') return;

            const directive = node as DirectiveNode;
            if (
                directive.type === 'textDirective' ||
                directive.type === 'leafDirective' ||
                directive.type === 'containerDirective'
            ) {
                const data = directive.data || (directive.data = {});
                const tagName = directive.type === 'textDirective' ? 'span' : 'div';

                data.hName = tagName;
                data.hProperties = {
                    className: [`custom-${directive.name}`, directive.name],
                };
            }
        });
    };
};

export default remarkCustomDirectives;


export function PageContent({ type, content, title, entries, path, params }: PageContentProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        Promise.resolve().then(() => setIsLoaded(true));
        return () => setIsLoaded(false);
    }, [type, content, path]);

    const renderContent = () => {
        switch (type) {
            case 'directory': {
                // 使用已解析的 params
                const directoryName = params?.slug?.length
                    ? decodeURIComponent(params.slug[params.slug.length - 1])
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
                console.log('GitHub URL:', path, githubUrl);

                return (
                    <article>
                        <div className="nav-title">
                            <h2>{title}
                                <a href="/rss.xml" className="rss-link" target="_blank" rel="noopener noreferrer">
                                    <svg className="rss-icon" viewBox="0 0 24 24">
                                        <path d="M6.18,15.64A2.18,2.18 0 0,1 8.36,17.82C8.36,19 7.38,20 6.18,20C5,20 4,19 4,17.82A2.18,2.18 0 0,1 6.18,15.64M4,4.44A15.56,15.56 0 0,1 19.56,20H16.73A12.73,12.73 0 0,0 4,7.27V4.44M4,10.1A9.9,9.9 0 0,1 13.9,20H11.07A7.07,7.07 0 0,0 4,12.93V10.1Z" />
                                    </svg>
                                </a>
                            </h2>
                            <div className="markdown-content">
                                <ReactMarkdown
                                    remarkPlugins={[
                                        remarkGfm,
                                        remarkDirective,
                                        remarkCustomDirectives,
                                        remarkAdmonitions  // 添加新插件
                                    ]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        code: ({
                                            inline,
                                            className,
                                            children,
                                            ...props
                                        }: {
                                            inline?: boolean; // ✅ 这里显式定义 inline
                                            className?: string;
                                            children?: React.ReactNode;
                                        } & HTMLAttributes<HTMLElement>) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const value = String(children).replace(/\n$/, '');

                                            if (!inline && match?.[1] === 'mermaid') {
                                                return <MermaidComponent value={value} />;
                                            }

                                            return (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        // 添加图片处理
                                        img: ({ src, alt, ...props }) => {
                                            const isRelativePath = src && !src.startsWith('http') && !src.startsWith('/');
                                            const newSrc = isRelativePath
                                                ? `/SelfSomething/${params?.slug?.slice(0, -1).join('/')}/${src}`
                                                : src;

                                            return <img src={newSrc} alt={alt} {...props} />;
                                        }
                                    }}
                                >
                                    {matterResult.content}
                                </ReactMarkdown>
                            </div>
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