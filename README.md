# Claude Builder Club @ MSU - Members Portal

A comprehensive web application for managing the Claude Builder Club at Michigan State University. This portal handles member management, event coordination, project tracking, class organization, and application processing for the club.

---

## 🎯 What This Portal Does

The Members Portal is the central hub for all Claude Builder Club operations at MSU:

- **Member Management**: Track members from prospect to e-board, manage roles and permissions
- **Event System**: Create events with RSVP, QR code check-ins, and automatic points allocation
- **Project Coordination**: Organize client projects with GitHub integration and team management
- **Class Organization**: Schedule educational sessions with teacher/student enrollment
- **Application Processing**: Handle applications for board positions, projects, and classes
- **Points System**: Track member engagement and contributions
- **Real-time Updates**: Live data synchronization across all users

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Query (TanStack Query)
- **Build Tool**: Vite
- **Deployment**: Vercel

---

## 🚀 Getting Started for Development

### Prerequisites

- **Node.js 18+** and npm/yarn
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** - Install via:
  ```bash
  npm install -g supabase
  ```

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/claude-msu/members-portal.git
   cd members-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local Supabase instance**
   ```bash
   supabase init  # Only needed first time
   supabase start
   ```

   This will:
   - Spin up a local Supabase stack in Docker
   - Apply all migrations from `supabase/migrations/`
   - Generate local development credentials
   - Display your local API URL and anon key

4. **Configure environment variables**

   Create a `.env.local` file using the credentials from `supabase start`:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Portal: `http://localhost:8080`
   - Supabase Studio: `http://localhost:54323` (local database admin UI)

### Stopping Development Environment

```bash
supabase stop
```

---

## 🤝 Contributing

We welcome contributions! Follow these steps to contribute:

### Step 1: Create an Issue

Before making any changes, [create an issue](https://github.com/claude-msu/members-portal/issues/new/choose) describing the bug or feature. We have templates for:
- 🐛 [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.yml)
- ✨ [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.yml)

This helps us:
- Track all proposed changes
- Discuss implementation approaches
- Avoid duplicate work
- Maintain a clear project roadmap

### Step 2: Implement Changes (Optional)

If you'd like to implement the fix or feature yourself:

1. **Fork the repository** and clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/members-portal.git
   cd members-portal
   ```

2. **Create a feature branch** linked to the issue
   ```bash
   git checkout -b feature/issue-123-your-feature-name
   ```

3. **Set up your development environment** (see [Getting Started](#-getting-started-for-development))

4. **Make your changes**
   - Follow existing code style and naming conventions
   - Use TypeScript for all new code
   - Test thoroughly with your local Supabase instance

5. **Database schema changes?**
   If you modify the database schema:
   ```bash
   supabase migration new your_migration_name
   # Edit the generated file in supabase/migrations/
   supabase migration up  # Test locally
   ```

6. **Commit your changes**
   - Write clear, descriptive commit messages
   - Use Conventional Commits format (e.g., `feat:`, `fix:`, `docs:`)
   - Reference the issue number in commits (e.g., `feat: add dark mode (#123)`)

7. **Push to your fork**
   ```bash
   git push origin feature/issue-123-your-feature-name
   ```

8. **Open a Pull Request**
   - Navigate to the [original repository](https://github.com/claude-msu/members-portal)
   - Click "New Pull Request" and select your fork's branch
   - Reference the issue number in the PR description (e.g., `Closes #123`)
   - Provide a clear description of your changes
   - Ensure all checks pass

### Code Style Guidelines

- **Components**: Functional components with hooks (PascalCase filenames)
- **Utilities**: camelCase filenames
- **Styling**: Tailwind CSS utility classes
- **Types**: Explicit TypeScript types from `database.types.ts`
- **Imports**: Group by external libraries, then internal modules

### What to Contribute

- 🐛 Bug fixes
- ✨ New features (UI improvements, mobile enhancements)
- ♿ Accessibility improvements
- 📚 Documentation updates
- 🎨 Design refinements
- ⚡ Performance optimizations

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── modals/         # Modal dialogs
│   └── ...
├── contexts/           # React contexts (Auth, Profile, Theme)
├── hooks/              # Custom React hooks
├── integrations/
│   └── supabase/       # Supabase client and database types
├── pages/
│   ├── dashboard/      # Dashboard pages
│   └── ...
└── main.tsx

supabase/
└── migrations/         # Database schema migrations (version controlled)
```

---

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 📄 License

This project is private and proprietary to the Claude Builder Club at Michigan State University.

---

## 👨‍💻 Maintained by

The **Claude Builder Club @ MSU** Executive Board.

For questions or support:
- Instagram: [@claudemsu](https://www.instagram.com/claudemsu)
- LinkedIn: [Claude Builder Club @ MSU](https://www.linkedin.com/company/claude-msu/)
- GitHub Issues: [Report a problem](https://github.com/claude-msu/members-portal/issues)

---

*Built with ❤️ for the Computer Science community at Michigan State University*