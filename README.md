# Ecoverse - AI-Powered Waste Management

Ecoverse is a full-stack web application that uses AI to help users identify waste items, understand their environmental impact, and learn about proper disposal methods and eco-friendly alternatives.

## Features

- **AI Image Analysis**: Upload images of waste items to be analyzed using Clarifai's image recognition.
- **Environmental Analysis**: Receive detailed information about the environmental impact of waste items using Provider2API (GPT-4o).
- **Disposal Instructions**: Learn how to properly dispose of different types of waste.
- **Eco-Friendly Alternatives**: Discover sustainable alternatives to common waste products.
- **User Authentication**: Secure login with email or Google account.
- **History & Analytics**: Track your analyzed waste items over time.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API routes, Clarifai API, Provider2API
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecoverse.git
cd ecoverse
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables by creating a `.env.local` file:
```
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Authentication (optional)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_password
EMAIL_FROM=noreply@example.com

# Clarifai API
CLARIFAI_PAT=your_clarifai_personal_access_token
```

4. Initialize the database:
```bash
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Routes

- `POST /api/analyze`: Accepts an image, analyzes it with Clarifai and Provider2API, and returns detailed information.
- `GET /api/history`: Returns the user's previous analyses.
- `POST /api/chat`: Allows users to ask AI questions about waste management.

## Deployment

The application is configured for easy deployment on Vercel:

```bash
npm run build
vercel deploy
```

## Environment Variables for Production

Make sure to set the following environment variables in your production environment:

- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLARIFAI_PAT`
- Email server credentials (if using email authentication)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Clarifai for providing the image recognition API
- Provider2API for the environmental analysis capabilities 