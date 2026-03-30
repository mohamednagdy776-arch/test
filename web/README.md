# Web App

User-facing Next.js web application for the Tayyibt platform.
This is the main product — like Facebook/Instagram but for matchmaking.

## Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State: React Query + Context API
- HTTP: Axios
- Real-time: Socket.IO client

## Folder Structure

```
web/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/             # Login, register (no layout)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/             # Authenticated pages (with layout)
│   │   │   ├── dashboard/      # Home feed
│   │   │   ├── matching/       # AI match suggestions
│   │   │   ├── profile/        # User profile
│   │   │   ├── chat/           # Messaging
│   │   │   ├── groups/         # Community groups
│   │   │   └── settings/       # Account settings
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page → redirect to /dashboard
│   ├── components/
│   │   ├── ui/                 # Base components (Button, Input, Avatar, Card...)
│   │   ├── layout/             # Navbar, Sidebar, Footer
│   │   └── shared/             # Shared feature components
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Login, register, token management
│   │   ├── profile/            # User profile view/edit
│   │   ├── matching/           # Match cards, compatibility display
│   │   ├── chat/               # Messaging UI + Socket.IO
│   │   ├── groups/             # Group list, group detail
│   │   ├── posts/              # Post feed, create post, comments
│   │   └── notifications/      # Notification bell + list
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API client, socket client, utilities
│   ├── store/                  # React Query provider, auth context
│   └── types/                  # Shared TypeScript types
├── public/                     # Static assets
├── .env.local.example
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
- RTL support for Arabic using `dir="rtl"` on root
- Follow `coding-standards.md`

## Key Differences from Admin

| | Web App | Admin |
|---|---|---|
| Users | Regular users | Admins only |
| Auth guard | Redirect to /login | Redirect to /login |
| Layout | Navbar + Sidebar (social) | Sidebar only |
| Real-time | Chat + notifications | None |
| RTL | Yes (Arabic) | No |
