# Task Manager App

Full-stack task management application with user authentication and CRUD operations.

## Setup

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Environment Variables

Backend `.env`:
\`\`\`
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
\`\`\`

Frontend `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

## Approach

Developed a prompt and given to v0 creating separate frontend/backend architecture for clean separation of concerns. Used SQLite for simplicity, JWT for stateless auth, and React Context for state management.

**Tech Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express, SQLite
- Auth: JWT tokens with bcrypt hashing

## Time Taken

**Total: 1.5 hours**
- Backend API & auth + Frontend components & pages: 15 minutes
- Integration & testing: 30 minutes
- Bug fixing & code cleaning: 40 minutes
- Documentation: 5 minutes

## Project Structure

\`\`\`
├── frontend/          # Next.js app
│   ├── src/app/      # Pages (App Router)
│   ├── src/components/  # UI components
│   └── src/contexts/    # Auth context
└── backend/           # Express API
    ├── routes/        # API endpoints
    ├── middleware/    # Auth middleware
    └── config/        # Database setup
\`\`\`

## API Endpoints

- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
