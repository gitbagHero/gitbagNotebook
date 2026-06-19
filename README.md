# GB Notebook

使用 Rspress 构建的软件质量保障课程笔记，部署于 Cloudflare Pages：

https://gbnotebook.pages.dev

## 本地开发

```bash
nvm use 22
pnpm install
pnpm run dev
```

## 构建与部署

```bash
nvm use 22
pnpm run build
pnpx wrangler pages deploy doc_build --project-name=gbnotebook --branch=main
```

也可使用 `pnpm run deploy` 一次完成构建和部署。
