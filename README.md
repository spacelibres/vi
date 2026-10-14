<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="01-logos/horizontal-reverse.svg">
    <img alt="spacelibre" src="01-logos/horizontal-primary.svg" width="420">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/spacelibres/vi/actions/workflows/verify-release.yml"><img alt="Verify and release" src="https://github.com/spacelibres/vi/actions/workflows/verify-release.yml/badge.svg"></a>
  <a href="https://github.com/spacelibres/vi/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/spacelibres/vi"></a>
  <a href="https://vi.spacelibre.cn/"><img alt="Website" src="https://img.shields.io/badge/site-vi.spacelibre.cn-007BFF"></a>
</p>

# spacelibre VI

spacelibre 的 SVG 视觉识别资产、互动 VI 手册和可复用设计 skill。当前版本见 [VERSION](VERSION)，全部变更见 [CHANGELOG.md](CHANGELOG.md)。

已确认的星球轨道 logo 同时用于页头、横向/纵向编排和 favicon。六套预设与自定义主色会生成 16 个色彩角色，并同步整个页面、40 个应用场景、图标、轨道渐变及单个 SVG 下载。星球圆环采用辅色的可读色阶，轨道采用主色的可读色阶；结构性遮罩保持原样。

40 个应用模板涵盖品牌物料、网站/移动端、开发者工具、文档、活动、服装、包装和视频。轨道装饰位于内容后方，采用连续曲线和渐隐处理。模板中的姓名、标题和联系方式为可替换内容。

## 运行与检查

```sh
npm ci
npm test
npm run check
npm run build
python -m http.server 8765
```

访问 http://localhost:8765/ 。网页本身无需 Node 服务；Node 仅用于验证。构建输出为 `spacelibre-svg-assets.zip` 和 `artifacts/spacelibre-vi-<version>.zip`。单个 SVG 的网页下载包含当前配色；合集保留母版与预设配色板。

## 版本控制

严格按 [版本规则](docs/versioning.md)维护：每个验证完成的小里程碑递增 patch、更新日志、提交并打不可变的 annotated tag。package.json、锁文件、VERSION、页面标注和标签保持一致。GitHub Actions 对 main / PR 做验证，对版本标签验证后创建 Release 和下载包。旧版本保留，不移动标签、不强制覆盖历史。自动化贡献者与 AI agent 必须遵守强制流程 [AGENTS.md](AGENTS.md)（同时提供 [.rules](.rules)）。

## 统一视觉 skill

完整 skill 位于 [skills/spacelibre-vi](skills/spacelibre-vi/SKILL.md)。复制该目录到 `~/.codex/skills/spacelibre-vi` 后可使用 `$spacelibre-vi`。它包含获批 logo SVG、16 角色配色、可移植配色引擎、40 个场景索引及视觉检查规则。应用于网站、应用、文档、幻灯片、图表和印刷物；明确指定的其他品牌或外部模板优先。

## 影像与发布

NASA 影像仅作为辅助背景，原始发布链接和完整署名见 [影像来源](05-imagery/sources.json)。SVG 标志和图形保持矢量，不以照片替代。

站点标题、canonical 和 manifest 按 vi.spacelibre.cn 准备。提交 GitHub 不等于已配置 DNS、HTTPS 或部署该域名；发布时将此目录作为静态站点根目录。RGB 印刷应按实际输出配置转换并打样。
