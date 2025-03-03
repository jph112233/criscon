# CRIS Con 2025 Event Management System

A mobile-friendly web application for managing events at CRIS Con 2025, featuring a Costa Rican-inspired design theme.

## Features

- View all CRIS Con 2025 events
- Add new events with detailed information
- Comment on events
- Attach files to events
- Mobile-responsive design
- Costa Rican-inspired theme

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd criscon
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Development

The application is built with:
- Next.js
- TypeScript
- Tailwind CSS
- Prisma (SQLite database)
- React DatePicker
- Heroicons

## Project Structure

```
criscon/
├── components/        # React components
├── pages/            # Next.js pages
├── prisma/           # Database schema and migrations
├── public/           # Static assets
├── styles/           # Global styles
└── README.md         # This file
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT
