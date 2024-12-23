# AI-Powered Requirements Engineering Tool

This is a Next.js project that provides AI-powered requirements engineering and analysis capabilities.

## Prerequisites

Before you begin, ensure you have installed:
- Node.js 18.x or later
- npm, yarn, pnpm, or bun
- Firebase account and project setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js 14 app directory
├── components/         # React components
├── context/           # React context providers
├── lib/               # Utility functions and configurations
├── services/          # Service layer (Firebase, API)
├── styles/            # Global styles and Tailwind CSS
└── types/             # TypeScript type definitions
```

## Key Features

- AI-powered requirements analysis
- Real-time collaboration
- Document management
- Requirements traceability
- Regulatory compliance checking
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Context + Hooks
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Integration**: Gum Loop API
- **Animation**: Framer Motion

## Development Guidelines

1. Follow the TypeScript types defined in `src/types/`
2. Use the DataProvider context for data operations
3. Implement error boundaries for component error handling
4. Follow the established project structure
5. Use Tailwind CSS for styling

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Follow the project's coding standards

## License

This project is licensed under the MIT License - see the LICENSE file for details.
