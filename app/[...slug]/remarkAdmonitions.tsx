import { visit } from 'unist-util-visit';
import { Plugin } from 'unified';
import { Root } from 'mdast';
import { Node } from 'unist';

interface TextNode extends Node {
    type: 'text';
    value: string;
}

const ADMONITION_EMOJIS: Record<string, string> = {
    'NOTE': '📝 ######',      // 笔记
    'TIP': '💡 💡 💡',       // 提示
    'IMPORTANT': '⚠️ ⚠️ ⚠️', // 重要
    'WARNING': '🚨 🚨 🚨',   // 警告
    'CAUTION': '🚫 🚫 🚫',   // 警示
};

const remarkAdmonitions: Plugin<[], Root> = () => {
    return (tree) => {
        visit(tree, 'text', (node: TextNode) => {
            const match = node.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/);

            if (match) {
                const type = match[1].toUpperCase();
                const content = match[2];
                const emoji = ADMONITION_EMOJIS[type];

                // 替换原始节点内容
                node.value = `${emoji} ${content}`;
            }
        });

        visit(tree, (node: any) => {
            if (
                node.type === 'containerDirective' &&
                Object.keys(ADMONITION_EMOJIS).includes(node.name.toUpperCase())
            ) {
                const data = node.data || (node.data = {});
                const type = node.name.toUpperCase();
                const emoji = ADMONITION_EMOJIS[type];

                // 创建标题节点，只使用表情符号
                const titleNode = {
                    type: 'paragraph',
                    children: [{
                        type: 'text',
                        value: emoji
                    }],
                    data: {
                        hProperties: {
                            className: 'admonition-title'
                        }
                    }
                };

                // 将标题节点添加到内容前面
                if (node.children && Array.isArray(node.children)) {
                    node.children.unshift(titleNode);
                }

                data.hName = 'div';
                data.hProperties = {
                    className: [`admonition admonition-${node.name.toLowerCase()}`]
                };
            }
        });
    };
};

export default remarkAdmonitions;