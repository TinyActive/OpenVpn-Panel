# OV-Panel Documentation

This is the documentation website for OV-Panel and OV-Node built with Next.js and shadcn/ui.

## Documentation Pages

### Master Panel (Panel Quản Lý)
- **Home (/)**: Landing page với features overview
- **Installation (/installation)**: Hướng dẫn cài đặt Panel
- **User Management (/user-management)**: Quản lý người dùng OpenVPN
- **Node Management (/node-management)**: Quản lý các worker nodes
- **Settings (/settings)**: Cấu hình hệ thống Panel

### OV-Node (Worker Node)
- **Node Installation (/node-installation)**: Hướng dẫn cài đặt và kết nối Node
- **Node API Reference (/node-api)**: Tài liệu API endpoints của Node
- **Node Troubleshooting (/node-troubleshooting)**: Xử lý sự cố thường gặp

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Build

Build the static site:

```bash
npm run build
```

The output will be in the `out` directory.

## Deploy

This documentation is automatically deployed to GitHub Pages when changes are pushed to the `document` branch.

## Structure

```
docs/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page
│   ├── installation/             # Panel installation guide
│   ├── user-management/          # User management guide
│   ├── node-management/          # Node management guide (Panel side)
│   ├── settings/                 # Settings guide
│   ├── node-installation/        # Node installation & connection guide
│   ├── node-api/                 # Node API reference
│   └── node-troubleshooting/     # Node troubleshooting guide
├── components/
│   ├── doc-layout.tsx            # Documentation layout with sidebar
│   └── ui/                       # shadcn/ui components
├── lib/
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## Development

The documentation uses:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

## Contributing

When adding new documentation pages:

1. Create a new folder in `app/` with a `page.tsx` file
2. Use the `DocLayout` component for consistent layout
3. Update the navigation in `components/doc-layout.tsx`
4. Add a link on the home page if needed
