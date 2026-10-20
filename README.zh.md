# vibe-harness

> **Agent：** 要在仓库中安装、升级或移除 vibe-harness，请阅读 [BOOTSTRAP.md](BOOTSTRAP.md) 并照做。

[English](README.md) | [简体中文](README.zh.md)

vibe-harness 让全 AI 编码的项目具备工程纪律。它是一套 agent 技能（skills）与治理模板：先有证据再下结论、显式契约、有归属的生命周期、可长期保存的决策记录，以及不残留推理过程的文档。由你的编码 agent 把它安装进仓库、按项目命令完成适配，之后升级时不会丢失本地修改。

## 快速开始

对在你仓库里工作的编码 agent 说：

```text
按 https://github.com/zehuichan/vibe-harness 的 BOOTSTRAP.md 起步。
```

agent 会克隆套件、检查仓库、询问要包含哪些可选技能、运行安装器，并用它亲自验证过的命令填写 `.agents/project-profile.md`。以后要升级，说 `升级 vibe-harness`。

## 安装内容

核心技能总会安装：

| 技能 | 用途 |
|---|---|
| `vibe-harness-bootstrap` | 安装、升级和移除本套件 |
| `error-handling` | 类型化失败、处理归属、故障隔离与可操作的报告 |
| `prose-standard` | 哪里必须写注释和文档，以及必须写清什么 |
| `trim-cot-leakage` | 清除注释和文档中残留的推理过程 |
| `test-reliability` | 设计和诊断可能非确定性失败的测试 |
| `find-simplifications` | 发现并提出有证据支撑的删减 |
| `code-review` | 按项目标准审查变更 |
| `pre-push-checks` | 为待推送的 diff 选出覆盖它的最小检查集 |
| `perf-evidence` | 用贴近真实的负载测量性能结论 |
| `agent-experience` | 为 agent 设计工具、技能与上下文 |
| `lifecycle-review` | 审计单例状态、未撤销的副作用与销毁顺序 |
| `agent-notes` | 记录并维护可长期保存的设计决策 |
| `docs-standard` | 组织、审查文档并核对其中事实 |
| `upgrade-guide` | 记录外部可感知的破坏性变更 |

可选技能依据仓库中的证据提议：

| 技能 | 何时提议 |
|---|---|
| `ui-ux-review` | 项目提供面向产品用户的图形界面 |
| `responsive-ui` | 项目提供面向产品用户的图形界面 |
| `record-browser-gif` | 项目有 Web 界面，且 PR 适合附带操作录屏 |
| `stacked-prs` | 托管在 GitHub，且团队以 stack 方式合入相互依赖的 PR |

治理文件：

| 路径 | 用途 |
|---|---|
| `AGENTS.md`（受管区块） | 每个 agent 会话都要遵守的常设规则；项目规则写在区块之外 |
| `CLAUDE.md` | 指向 `AGENTS.md` 的符号链接，让 Claude Code 读取同一份指令 |
| `.agents/project-profile.md` | 技能读取的项目事实：命令、代码托管平台、启用的界面类别 |
| `.agents/notes/` | Agent Notes：按生命周期和类别存放的决策记录 |
| `docs/defensive-patterns/` | 防止缺陷反复出现的审查规则 |
| `docs/AGENTS.md` | 文档规范 |

## 工作原理

- **技能保持通用，由 profile 完成适配。** 技能引用 `commands.focused-test`、`surfaces.ui` 这类 profile 键，而不写死具体工具链，所以同一份技能文本适用于 Node.js、Python 或 Go 仓库。
- **仓库拥有自己的副本。** 文件是复制进来的而非引用，项目可以修改其中任何一个。`.agents/vibe-harness.lock.json` 记录套件版本和每个受管文件的上游哈希。
- **升级保留本地修改。** 未修改的文件直接替换。修改过的文件用 `git merge-file` 做三方合并，以之前安装的套件版本为基准；重叠的修改留下冲突标记，交给 agent 解决。profile 这类种子文件从不覆盖，`AGENTS.md` 只改写 `vibe-harness` 标记之间的内容。
- **各家 agent 都能找到技能。** Cursor 和 Codex 读取 `.agents/skills/`。Claude Code 读取 `.claude/skills/`，它是指向 `../.agents/skills` 的一条符号链接（git 模式 120000）。安装器不会把技能再复制到那里。操作系统无法创建目录链接时，工作区文件的内容就是链接文本，git 索引仍记录为符号链接；`core.symlinks=false` 的检出也是这个文本文件。只有显式指定 `--claude mirror` 时才会逐个复制技能。

## 其他安装方式

- `npx skills add zehuichan/vibe-harness` 只安装技能，不包含治理文件和项目 profile，因此在你补上之前，技能中对 profile 的引用无法解析。
- 没有 Node.js 时，按 [BOOTSTRAP.md](BOOTSTRAP.md#without-nodejs) 中的手动步骤操作。

安装器需要 git 和 Node.js 20 或更高版本。

## 开发本套件

```sh
npm run check   # manifest、技能 frontmatter、按安装路径解析的链接、占位符、profile 键、文本规范
npm test        # 检查规则（每条都有被拒绝的用例）与安装器行为
```

技能保持与具体项目无关：项目事实一律通过 profile 键表达；核心技能和模板不得链接可选技能，因为它可能没有安装。要把源项目的更新提炼进来，让 agent 按 [DISTILL.md](DISTILL.md) 做。发布时，更新 `manifest.json` 和 `package.json` 的 `version`，在 [CHANGELOG](CHANGELOG.md) 中新增条目并写明种子模板的变化，然后推送 `vX.Y.Z` 标签。

## 许可证

[MIT](LICENSE)。vibe-harness 提炼自 DeepSeek Harness 的 agent 工作流，详见 [NOTICE](NOTICE)。
