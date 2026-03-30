# Admin Dashboard

Next.js admin panel for managing the Tayyibt platform.

## Stack

- Framework: Next.js + React
- Language: TypeScript
- Styling: Tailwind CSS
- State: React Query + Context API
- HTTP: Axios

## Folder Structure

```
admin/
├── src/
│   ├── app/                # Next.js app router pages
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base components (Button, Input, Modal...)
│   │   └── layout/         # Layout components (Sidebar, Header...)
│   ├── features/           # Feature-based modules
│   │   ├── users/          # User management
│   │   ├── matching/       # Match review and moderation
│   │   ├── groups/         # Group moderation
│   │   ├── posts/          # Post moderation
│   │   ├── payments/       # Transaction overview
│   │   └── reports/        # Reported content
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client, utilities
│   ├── store/              # Global state (Context API)
│   └── types/              # Shared TypeScript types
├── public/                 # Static assets
├── .env.local              # Environment variables (never commit)
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Standards

- Functional components only — no class components
- One component per file
- Separate UI, logic, and API call layers
- Use React Query for all server state
- Handle loading / error / success states on every API call
- Follow `coding-standards.md`
