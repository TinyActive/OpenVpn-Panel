# Hướng dẫn triển khai Documentation Site

## Đã tạo thành công

Tôi đã tạo một documentation website hoàn chỉnh cho dự án OV-Panel với các thành phần sau:

### 1. **Next.js Project với shadcn/ui**
- ✅ Cấu hình Next.js 14 với TypeScript
- ✅ Tailwind CSS với shadcn/ui design system
- ✅ Components: Button, Card, ScrollArea
- ✅ Responsive layout với navigation và sidebar

### 2. **Tài liệu đầy đủ**
- ✅ **Trang chủ (/)**: Landing page với features và links
- ✅ **User Management (/user-management)**: Hướng dẫn quản lý người dùng
- ✅ **Node Management (/node-management)**: Hướng dẫn quản lý nodes
- ✅ **Installation (/installation)**: Hướng dẫn cài đặt hệ thống
- ✅ **Settings (/settings)**: Hướng dẫn cấu hình

### 3. **GitHub Actions Workflow**
- ✅ Tự động build và deploy lên GitHub Pages
- ✅ Trigger khi push vào branch `document`
- ✅ Static site generation với Next.js

## Cách sử dụng

### Chạy development server:

```bash
cd docs
npm install
npm run dev
```

Truy cập: http://localhost:3000

### Build production:

```bash
cd docs
npm run build
```

Output trong thư mục `docs/out/`

### Deploy tự động:

1. Commit và push code vào branch `document`
2. GitHub Actions sẽ tự động:
   - Install dependencies
   - Build Next.js site
   - Deploy lên GitHub Pages

## Cấu hình GitHub Pages

Để kích hoạt GitHub Pages:

1. Vào **Settings** > **Pages** của repository
2. Chọn **Source**: GitHub Actions
3. Workflow sẽ tự động chạy khi có thay đổi

## URL Documentation

Sau khi deploy, tài liệu sẽ có tại:
```
https://tinyactive.github.io/OpenVpn-Panel/
```

## Cấu trúc thư mục

```
docs/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── user-management/
│   │   └── page.tsx             # User guide
│   ├── node-management/
│   │   └── page.tsx             # Node guide
│   ├── installation/
│   │   └── page.tsx             # Installation guide
│   └── settings/
│       └── page.tsx             # Settings guide
├── components/
│   ├── doc-layout.tsx           # Documentation layout
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── scroll-area.tsx
├── lib/
│   └── utils.ts                 # Utility functions
├── images/                      # Existing images (logo, panel)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies

.github/
└── workflows/
    └── deploy-docs.yml          # GitHub Actions workflow
```

## Tính năng

- ✅ Giao diện đạt chuẩn shadcn/ui với Tailwind CSS
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Navigation và sidebar cho documentation
- ✅ Static site generation (SSG) cho performance cao
- ✅ Tự động deploy qua GitHub Actions
- ✅ TypeScript để đảm bảo type safety
- ✅ Tài liệu chi tiết về cách sử dụng các tính năng

## Lưu ý

- Images trong `docs/images/` đã được giữ nguyên
- basePath được cấu hình cho GitHub Pages
- Workflow chỉ chạy khi có thay đổi trong thư mục `docs/`
- Tất cả tài liệu đều bằng tiếng Việt
