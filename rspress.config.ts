import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'md笔记'),
  lang: 'zh-CN',
  title: 'GB Notebook',
  description: '软件质量保障课程笔记',
  themeConfig: {
    enableContentAnimation: true,
    enableScrollToTop: true,
  },
});
