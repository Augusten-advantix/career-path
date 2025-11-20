# Career Roadmap Application

AI-powered career roadmap generator that analyzes resumes and provides personalized career development paths.

## 🏗️ Architecture

This is a monorepo containing:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript + SQLite

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AdvantixAGI-Tech/AI-Solutions.git
cd AI-Solutions
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Environment Variables** (`.env` file already included):
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Secret for JWT token signing
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

**Run Backend:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Environment Variables** (`.env.production` file included):
- `VITE_API_URL`: Backend API URL

**Run Frontend:**
```bash
# Development
npm run dev

# Production  
npm run build
npm run preview
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
AI-Solutions/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (LLM, parser)
│   │   └── index.ts        # Entry point
│   ├── uploads/            # File uploads directory
│   ├── .env                # Environment variables (INCLUDED)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── assets/         # Static assets
│   │   ├── config.ts       # API configuration
│   │   └── main.tsx        # Entry point
│   ├── .env.production     # Production env vars (INCLUDED)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

## 🔧 Features

- **User Authentication**: Register/Login with JWT
- **Resume Upload**: Support for PDF, DOCX, TXT files
- **AI Analysis**: Powered by Google Gemini 2.0
- **Career Questionnaire**: Contextual questions for personalized analysis
- **Gap Analysis**: Identifies skill and experience gaps
- **Personalized Roadmap**: Step-by-step career development plan

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (Sequelize ORM)
- **Authentication**: JWT + bcryptjs
- **AI**: Google Generative AI (Gemini 2.0)
- **File Processing**: Multer, pdf-parse, mammoth

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🔐 Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3000
NODE_ENV=development
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com/api
```

**Note**: `.env` files are included in this repository for organization use. Update the values as needed.

## 🚢 Deployment

### Backend Deployment (Render/Railway)

1. **Connect GitHub Repository**
2. **Set Build Command**: `npm install && npm run build`
3. **Set Start Command**: `npm start`
4. **Environment Variables**: Add all from `.env`

### Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Set `VITE_API_URL`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### File Upload
- `POST /api/upload` - Upload resume (PDF/DOCX/TXT)

### Questionnaire
- `GET /api/questions` - Get questionnaire
- `POST /api/questions` - Submit answers (optional)

### Analysis
- `POST /api/analyze` - Analyze profile and generate roadmap

## 🧪 Development Commands

### Backend
```bash
npm run dev      # Run with nodemon (auto-reload)
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🤝 Contributing

This is an internal organization project. For contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Internal use only - AdvantixAGI-Tech

## 🆘 Support

For issues or questions, contact the development team at AdvantixAGI-Tech.

## 🎯 Roadmap

- [ ] Add more AI models support
- [ ] Implement resume templates
- [ ] Add progress tracking
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting

---

**Built with ❤️ by AdvantixAGI-Tech**
