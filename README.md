# 🏈 YDKB (You Don't Know Ball)

Test your knowledge of NFL players' college careers in this daily guessing game, inspired by Immaculate Grid.

![Game Preview](/public/opengraph.png)

## 🎯 Game Features

- **Three Difficulty Levels**
  - 🟢 Easy: Current NFL stars from well-known universities
  - 🟡 Hard: Lesser-known players or smaller colleges
  - 🔴 Hall of Fame: NFL legends challenge

- **Daily Challenges**: New players to guess every day
- **Educational Content**: Learn about players' college careers
- **Archive Mode**: Access and play past daily challenges

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/docsofdw/YDKB.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🌐 Vercel Deployment

This application is configured for deployment on Vercel. Follow these steps to deploy:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set up the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (use your production URL)
   - `NEXT_PUBLIC_SITE_NAME`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `ADMIN_API_KEY`
   - `CRON_SECRET`
   - `THESPORTSDB_API_KEY`
4. Deploy using the Vercel framework preset (automatic detection)

For detailed documentation on Vercel deployment, visit [Vercel's Next.js documentation](https://vercel.com/docs/frameworks/nextjs).

## 🛠️ Built With

- [Next.js 14](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

## 📁 Project Structure

```
├── app/                # Next.js App Router
│   ├── components/    # React components
│   │   ├── ui/        # Reusable UI components
│   │   └── features/  # Feature-specific components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Helper functions
│   ├── api/           # API routes
│   └── [routes]/      # Page routes
├── public/            # Static assets
└── docs/              # Documentation
```

## 📖 Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [Development Guide](./docs/development/README.md)
- [Next.js Maintenance Guide](./docs/development/NEXT_MAINTENANCE.md)
- [Component Documentation](./docs/components/README.md)
- [API Documentation](./docs/api/README.md)

## 🧪 Running Tests

```bash
npm run test
npm run test:e2e
npm run test:coverage
```

## 🤝 Contributing

We love your input! See our [Contributing Guide](./CONTRIBUTING.md) for ways to get started.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Inspired by [Immaculate Grid](https://www.immaculategrid.com/football)
- NFL data sourced from public records