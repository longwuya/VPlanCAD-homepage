[English](README.md) | [简体中文](README.zh-CN.md)

# VPlanCAD 项目主页

本仓库用于展示 **VPlanCAD: Learning Parametric CAD Generation from Engineering Drawings via Cross-View Fusion and Command Planning** 项目。

## 项目链接

- 项目主页：[https://longwuya.github.io/VPlanCAD-homepage/](https://longwuya.github.io/VPlanCAD-homepage/)
- 主页仓库：[https://github.com/longwuya/VPlanCAD-homepage](https://github.com/longwuya/VPlanCAD-homepage)
- 算法仓库：[https://github.com/longwuya/VPlanCAD](https://github.com/longwuya/VPlanCAD)
- 项目视频：[https://youtu.be/_ArdSNKLISI](https://youtu.be/_ArdSNKLISI)

## 页面内容

页面包含摘要、演示视频、工程图输入与 CAD 模型定性对比，以及消融实验图。Paper 入口在提供真实论文地址前保持禁用，引用信息目前待补充。

模型对比覆盖单视图、三视图和四视图输入。模型默认显示静态渲染图，指针交互时启用共享的三维查看器，双击可恢复当前模型的默认视角。

## 本地预览

在仓库目录运行：

```sh
python -m http.server 8010 --bind 127.0.0.1
```

打开 [http://127.0.0.1:8010/](http://127.0.0.1:8010/)。ES 模块和 OBJ 资源请求需要 HTTP 服务；页面不需要前端构建或安装依赖包。

## 文件结构

| 路径 | 内容 |
| --- | --- |
| `index.html` | 项目正文与资源链接 |
| `style.css` | 排版、字体及响应式样式 |
| `page.js` | 分区导航和轻量图像动效 |
| `viewer.js` | 共享的交互式 CAD 模型查看器 |
| `images/` | 校标、研究图、视频封面及模型静态图 |
| `media/` | 用于网页播放的视频版本 |
| `result/` | 工程图输入与 OBJ 示例模型 |
| `fonts/` | 本地 Inter 字体及许可证 |
| `vendor/` | Three.js、OBJLoader、OrbitControls 及许可证 |

## 发布方式

GitHub Pages 从 `main` 分支的仓库根目录发布页面，`.nojekyll` 用于直接发布静态文件。页面使用相对资源路径，支持 `/VPlanCAD-homepage/` 项目地址。

后续提交说明使用英文，更新后应核对实际线上页面。本仓库不包含大体积原始视频及本地评审记录。

## 第三方组件

- Inter：SIL Open Font License 1.1，许可证见 [fonts/OFL.txt](fonts/OFL.txt)。
- Three.js r160 及其 addons：MIT License，许可证见 [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt)。
