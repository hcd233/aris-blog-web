# 应用图标配置指南

## 概述

Aris Blog 支持通过环境变量自定义应用图标和网站favicon，您可以使用自己的图标URL或使用默认图标。

## 配置方法

### 1. 环境变量配置

在项目根目录创建 `.env.local` 文件（如果不存在），并添加以下配置：

```bash
# 应用图标配置
NEXT_PUBLIC_APP_ICON_URL=https://your-domain.com/path/to/your-icon.png
NEXT_PUBLIC_APP_NAME=Your Blog Name

# 网站favicon配置
NEXT_PUBLIC_FAVICON_URL=https://your-domain.com/path/to/your-favicon.ico
```

### 2. 配置选项

| 环境变量 | 描述 | 默认值 | 必填 |
|---------|------|--------|------|
| `NEXT_PUBLIC_APP_ICON_URL` | 应用内显示的自定义图标URL | 无 (使用默认图标) | 否 |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | "Aris Blog" | 否 |
| `NEXT_PUBLIC_FAVICON_URL` | 浏览器标签页显示的favicon URL | 无 (使用默认favicon) | 否 |

### 3. 图标要求

#### 应用图标 (APP_ICON)
- **格式**: 支持 PNG, JPG, SVG 等web兼容格式
- **尺寸**: 建议使用正方形图标，最小 64x64px
- **大小**: 建议文件大小不超过 100KB

#### Favicon
- **格式**: 建议使用 ICO, PNG 格式
- **尺寸**: 建议 16x16px, 32x32px, 48x48px 或 64x64px
- **大小**: 建议文件大小不超过 50KB
- **托管**: 图标需要托管在可公开访问的URL上

## 使用示例

### 使用自定义图标和favicon

```bash
# .env.local
NEXT_PUBLIC_APP_ICON_URL=https://cdn.example.com/my-blog-icon.png
NEXT_PUBLIC_FAVICON_URL=https://cdn.example.com/my-favicon.ico
NEXT_PUBLIC_APP_NAME=我的技术博客
```

### 仅使用自定义应用图标

```bash
# .env.local
NEXT_PUBLIC_APP_ICON_URL=https://cdn.example.com/my-blog-icon.png
NEXT_PUBLIC_APP_NAME=我的博客
# NEXT_PUBLIC_FAVICON_URL 留空，使用默认favicon
```

### 使用默认图标

如果不设置任何图标URL，系统将使用默认设置：

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=我的博客
# 所有图标URL留空或不设置
```

## 技术实现

### AppIcon 组件

系统使用 `AppIcon` 组件来处理应用内图标显示逻辑：

- 如果设置了自定义图标URL，优先显示自定义图标
- 如果自定义图标加载失败，自动回退到默认图标
- 支持多种尺寸：`sm` (24px), `md` (32px), `lg` (48px)

### Favicon 配置

在 `layout.tsx` 中自动处理favicon配置：

- 如果设置了 `NEXT_PUBLIC_FAVICON_URL`，使用自定义favicon
- 否则使用默认的 `/favicon.ico`
- 同时设置多种favicon格式以确保兼容性

### 配置文件

应用配置统一管理在 `src/config/app.ts` 文件中：

```typescript
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Aris Blog',
  iconUrl: process.env.NEXT_PUBLIC_APP_ICON_URL || null,
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || null,
  defaultIcon: {
    letter: 'A',
    gradient: 'from-blue-600 to-indigo-600'
  }
};
```

## 故障排查

### 图标不显示

1. **检查URL**: 确保图标URL可以在浏览器中直接访问
2. **检查CORS**: 确保图标服务器允许跨域访问
3. **检查格式**: 确保图标文件格式被浏览器支持
4. **检查环境变量**: 确保变量名正确且以 `NEXT_PUBLIC_` 开头

### Favicon不生效

1. **清除浏览器缓存**: 浏览器会缓存favicon，需要强制刷新
2. **检查favicon格式**: 建议使用标准的ICO或PNG格式
3. **检查文件大小**: favicon文件不宜过大
4. **重启开发服务器**: 修改环境变量后需要重启服务

### 图标模糊

1. **提供高分辨率图标**: 建议提供 2x 或 3x 分辨率的图标
2. **使用SVG格式**: SVG格式在任何尺寸下都保持清晰
3. **Favicon多尺寸**: 提供16x16, 32x32, 48x48等多种尺寸

## 部署注意事项

- 环境变量需要在构建时设置，运行时修改不会生效
- 生产环境部署时，确保在部署平台设置对应的环境变量
- 图标URL应该使用HTTPS协议，确保安全性
- CDN托管的图标具有更好的加载性能

## 自定义默认图标

如需修改默认图标样式，可以编辑 `src/config/app.ts` 文件：

```typescript
defaultIcon: {
  letter: 'M',  // 修改默认字母
  gradient: 'from-green-600 to-teal-600'  // 修改渐变色
}
```

## 本地测试

创建 `.env.local` 文件进行本地测试：

```bash
# .env.local
NEXT_PUBLIC_APP_NAME=测试博客
NEXT_PUBLIC_APP_ICON_URL=https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=T
NEXT_PUBLIC_FAVICON_URL=https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=T
```

重启开发服务器后即可看到效果。 