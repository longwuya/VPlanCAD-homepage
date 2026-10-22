[English](README.md) | [简体中文](README.zh-CN.md)

# VPlanCAD Project Homepage

Project website for **VPlanCAD: Learning Parametric CAD Generation from Engineering Drawings via Cross-View Fusion and Command Planning**.

## Project Links

- Project homepage: [https://longwuya.github.io/VPlanCAD-homepage/](https://longwuya.github.io/VPlanCAD-homepage/)
- Homepage repository: [https://github.com/longwuya/VPlanCAD-homepage](https://github.com/longwuya/VPlanCAD-homepage)
- Code repository: [https://github.com/longwuya/VPlanCAD](https://github.com/longwuya/VPlanCAD)
- Project video: [https://youtu.be/_ArdSNKLISI](https://youtu.be/_ArdSNKLISI)

## Website Contents

The website presents the project abstract, demonstration videos, qualitative comparisons with engineering drawing inputs and interactive CAD models, and ablation figures. The Paper resource is disabled until a verified paper URL is available. Citation information is currently pending.

The model comparisons show 1-view, 3-view, and 4-view input settings. Each model initially appears as a static render; pointer interaction enables a shared 3D viewer, and double-clicking resets the active model's view.

## Local Preview

Serve this directory over HTTP:

```sh
python -m http.server 8010 --bind 127.0.0.1
```

Open [http://127.0.0.1:8010/](http://127.0.0.1:8010/). HTTP is required for ES modules and OBJ requests. The page requires no frontend build or package installation.

## Repository Structure

| Path | Contents |
| --- | --- |
| `index.html` | Project content and resource links |
| `style.css` | Page layout, typography, and responsive styles |
| `page.js` | Section navigation and lightweight figure transitions |
| `viewer.js` | Shared interactive CAD model viewer |
| `images/` | Institution logo, research figures, video poster, and static model renders |
| `media/` | Web-optimized demonstration videos |
| `result/` | Engineering drawing inputs and OBJ model examples |
| `fonts/` | Local Inter fonts and their license |
| `vendor/` | Three.js, OBJLoader, OrbitControls, and the Three.js license |

## Deployment

GitHub Pages publishes the repository root from the `main` branch. The `.nojekyll` file enables direct static-file publishing. Relative asset paths support the `/VPlanCAD-homepage/` project URL.

Use English commit messages and verify the deployed page after updates. Original large video masters and local review notes are not part of this repository.

## Third-Party Components

- Inter: SIL Open Font License 1.1, retained in [fonts/OFL.txt](fonts/OFL.txt).
- Three.js r160 and its addons: MIT License, retained in [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt).
