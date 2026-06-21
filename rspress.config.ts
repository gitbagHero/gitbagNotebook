import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import rehypeKatex from 'rehype-katex';
import remarkFlexibleMarkers from 'remark-flexible-markers';
import remarkMath from 'remark-math';
import mermaid from 'rspress-plugin-mermaid';

export default defineConfig({
  root: path.join(__dirname, 'md笔记'),
  lang: 'zh-CN',
  title: 'GB Notebook',
  description: '软件质量保障课程笔记',
  plugins: [mermaid()],
  markdown: {
    remarkPlugins: [remarkFlexibleMarkers, remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
    shiki: {
      // Math blocks are rendered by rehype-katex after Shiki's pass.
      // Keep unknown language nodes intact so KaTeX can consume them.
      onError: () => {},
    },
  },
  themeConfig: {
    enableContentAnimation: true,
    enableScrollToTop: true,
  },
});
