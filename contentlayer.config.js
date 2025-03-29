import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

/** @type {import('contentlayer2/source-files').ComputedFields} */
const computedFields = {
    slug: {
        type: 'string',
        resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
    slugAsParams: {
        type: 'string',
        resolve: (doc) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
    },
};

export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: `**/*.md`,
    contentType: 'md',
    fields: {
        title: {
            type: 'string',
            required: true,
        },
        date: {
            type: 'date',
            required: true,
        },
        description: {
            type: 'string',
        },
        published: {
            type: 'boolean',
            default: true,
        },
        image: {
            type: 'string',
        },
        authors: {
            type: 'list',
            of: { type: 'string' },
        },
    },
    computedFields,
}));

export default makeSource({
    contentDirPath: 'contents', // 指定你的子项目目录
    documentTypes: [Post],
    mdx: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            rehypeAutolinkHeadings,
            [
                rehypePrettyCode,
                {
                    theme: 'github-dark',
                    onVisitLine(node) {
                        if (node.children.length === 0) {
                            node.children = [{ type: 'text', value: ' ' }];
                        }
                    },
                    onVisitHighlightedLine(node) {
                        node.properties.className.push('line--highlighted');
                    },
                    onVisitHighlightedWord(node) {
                        node.properties.className = ['word--highlighted'];
                    },
                },
            ],
        ],
    },
});