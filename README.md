# LearnWise Smart Hub

<div align="center">

![LearnWise Smart Hub](https://img.shields.io/badge/LearnWise-Smart%20Hub-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

A comprehensive, intelligent educational platform designed to revolutionize exam preparation through adaptive learning, gamification, and advanced plagiarism detection.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Systems](#-key-systems)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**LearnWise Smart Hub** is a next-generation educational platform that combines adaptive learning algorithms, comprehensive gamification, and intelligent plagiarism detection to create an engaging and effective learning environment for students preparing for competitive exams.

The platform supports multiple examination systems including **GATE**, **JEE**, **CAT**, **NEET**, and **UPSC**, providing students with personalized learning paths, real-time progress tracking, and competitive leaderboards.

### Key Highlights

- 🎓 **Adaptive Quiz System** - Dynamic difficulty adjustment based on student performance
- 🏆 **Comprehensive Gamification** - Streaks, badges, leaderboards, and progress tracking
- 🔍 **Advanced Plagiarism Detection** - Multi-algorithm analysis for assignments
- 📝 **Blog Platform** - Educational content creation and sharing
- 📊 **Analytics Dashboard** - Detailed performance insights with interactive charts
- 🔐 **Firebase Authentication** - Secure user management
- 🌓 **Dark Mode Support** - Modern, accessible UI with theme switching

---

## ✨ Features

### 🎓 Adaptive Learning System

- **Smart Question Selection** - AI-driven adaptive difficulty based on student performance
- **Rating System** - Elo-inspired rating calculation for accurate skill assessment
- **Category Progression** - Dynamic categorization (Low → Medium → Best)
- **Multiple Quiz Types** - Full syllabus, subject-wise, and topic-wise tests
- **Calibration Tests** - Initial level assessment for personalized learning paths

### 🏆 Gamification Engine

- **Streak Tracking** - Daily quiz completion tracking with visual indicators
- **12 Unique Badges** - Achievement system covering accuracy, speed, consistency, and improvement
- **Multi-Criteria Leaderboards** - Rank by score, accuracy, streak, or badges
- **Progress Analytics** - Interactive charts showing performance trends
- **PDF Export** - Professional progress reports with comprehensive statistics

### 🔍 Plagiarism Detection System

- **Multi-Algorithm Analysis** - 6 text algorithms + 4 code-specific algorithms
- **Assignment Management** - Create, submit, and track assignments
- **Side-by-Side Comparison** - Visual highlighting of similar content
- **Automated Flagging** - Intelligent threshold-based detection (≥60% flagged)
- **Comprehensive Reports** - Detailed PDF reports with algorithm breakdowns

### 📚 Exam Preparation Modules

- **GATE** - Computer Science topics with 24 questions across 5 subjects
- **JEE** - Physics, Chemistry, Mathematics with 24 questions
- **CAT** - Quantitative Aptitude, Verbal Ability, Logical Reasoning
- **NEET** - Biology, Physics, Chemistry for medical entrance
- **UPSC** - Civil Services preparation materials

### 📝 Blog Platform

- **Content Creation** - Rich text editor for educational articles
- **Category Management** - Organized content by topics
- **Reading Time Estimation** - Automatic calculation
- **Responsive Design** - Mobile-friendly blog interface

### 🎨 User Experience

- **Modern UI/UX** - Clean, intuitive interface built with shadcn/ui
- **Dark Mode** - System-aware theme switching
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Real-time Updates** - Instant feedback and progress tracking
- **Accessibility** - WCAG compliant components

---

## 🛠️ Tech Stack

### Frontend Framework

- **React 18.3.1** - Modern UI library with hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Lightning-fast build tool and dev server

### UI & Styling

- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful, consistent icon set
- **Framer Motion 12.23.24** - Smooth animations and transitions

### State Management & Data

- **React Query (TanStack Query) 5.83.0** - Server state management
- **React Context API** - Global state for auth and quiz data
- **LocalStorage** - Client-side data persistence

### Routing & Navigation

- **React Router DOM 6.30.1** - Declarative routing

### Authentication

- **Firebase 12.4.0** - Authentication and user management

### Forms & Validation

- **React Hook Form 7.61.1** - Performant form handling
- **Zod 3.25.76** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### Charts & Visualization

- **Recharts 2.15.4** - Composable charting library
- **jsPDF 3.0.3** - PDF generation
- **jspdf-autotable 5.0.2** - Table generation for PDFs

### Developer Tools

- **ESLint 9.32.0** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Autoprefixer** - CSS vendor prefixing
- **PostCSS** - CSS transformations

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** - Version 18.x or higher
- **npm** - Version 9.x or higher (or **yarn**/**pnpm**)
- **Git** - For version control

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/AvinashUmrao/edusmartPlus.git
cd learnwise-smart-hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Firebase** (Optional - for authentication)

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

5. **Build for production**

```bash
npm run build
```

6. **Preview production build**

```bash
npm run preview
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
learnwise-smart-hub/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── assets/                  # Images and media files
│   │   ├── blog-*.jpg          # Blog post images
│   │   └── *.png               # UI assets
│   │
│   ├── components/              # React components
│   │   ├── blogs/              # Blog system components
│   │   ├── exam/               # Exam preparation components
│   │   ├── gamification/       # Badges, streaks, rewards
│   │   ├── gate/               # GATE-specific components
│   │   ├── home/               # Homepage components
│   │   ├── layout/             # Layout components (Footer, etc.)
│   │   ├── leaderboard/        # Leaderboard components
│   │   ├── plagiarism/         # Plagiarism detection UI
│   │   ├── progress/           # Progress tracking components
│   │   ├── quiz/               # Quiz system components
│   │   └── ui/                 # shadcn/ui components (50+ components)
│   │
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── QuizContext.tsx     # Quiz state management
│   │
│   ├── data/                    # Static data and question banks
│   │   ├── badges.ts           # Badge definitions
│   │   ├── jeeQuestionBank.ts  # JEE questions
│   │   └── *.ts                # Other data files
│   │
│   ├── lib/                     # Utility functions and libraries
│   │   ├── gamification.ts     # Gamification logic
│   │   ├── pdfGenerator.ts     # PDF export functionality
│   │   ├── plagiarismDetection.ts    # Plagiarism algorithms
│   │   ├── plagiarismStorage.ts      # Storage utilities
│   │   └── utils.ts            # General utilities
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Home.tsx            # Landing page
│   │   ├── ExamPrep.tsx        # Exam preparation hub
│   │   ├── Gate.tsx            # GATE preparation
│   │   ├── GateQuiz.tsx        # GATE quiz interface
│   │   ├── Jee.tsx             # JEE preparation
│   │   ├── JeeQuiz.tsx         # JEE quiz interface
│   │   ├── Cat.tsx             # CAT preparation
│   │   ├── Neet.tsx            # NEET preparation
│   │   ├── Upsc.tsx            # UPSC preparation
│   │   ├── PlagiarismPage.tsx  # Plagiarism detection
│   │   ├── Blogs.tsx           # Blog listing
│   │   ├── CreateBlog.tsx      # Blog creation
│   │   ├── Auth.tsx            # Authentication page
│   │   ├── LeaderboardPage.tsx # Leaderboard
│   │   ├── ProgressPage.tsx    # Progress tracking
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── plagiarism.ts       # Plagiarism system types
│   │
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
│
├── dist/                        # Production build output
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
├── components.json              # shadcn/ui configuration
└── README.md                    # This file
```

---

## 🔑 Key Systems

### Adaptive Quiz System

The adaptive quiz system uses an Elo-inspired rating algorithm to dynamically adjust question difficulty based on student performance:

- **Rating Calculation**: Students start at 300 rating and progress through Low (100-299), Medium (300-599), and Best (600+) categories
- **Question Selection**: Questions are selected based on current category and performance
- **Performance Tracking**: Detailed analytics track accuracy, time taken, and improvement over time
- **Multiple Exam Types**: Support for GATE, JEE, CAT, NEET, and UPSC with subject-specific question banks

### Gamification System

Comprehensive gamification features to enhance student engagement:

**Badges** (12 types):
- ⚡ Fast Learner - Complete 5 quizzes in a day
- 👑 Accuracy King/Queen - Achieve 90%+ accuracy
- 💯 Perfect Score - Get 100% in any quiz
- 🔥 Comeback Champ - Improve by 30%+ after low score
- 🌟 Streak Starter - Maintain 3-day streak
- 💪 Week Warrior - Maintain 7-day streak
- 🏆 Month Master - Maintain 30-day streak
- 🚀 Speed Demon - Complete quiz in under 5 minutes
- 📚 Dedicated Learner - Complete 50 quizzes total
- 📈 Category Climber - Progress from Low to Best category
- 🎯 Consistent Performer - Maintain 75%+ accuracy over 10 quizzes

**Leaderboard Features**:
- Multi-criteria sorting (Score, Accuracy, Streak, Badges)
- Real-time updates after each quiz
- User position highlighting
- Top 3 special badges (Gold, Silver, Bronze)

**Progress Tracking**:
- Interactive charts (Line, Pie, Bar)
- Comprehensive statistics dashboard
- Quiz history with detailed logs
- Personalized improvement suggestions
- PDF export for progress reports

### Plagiarism Detection System

Advanced multi-algorithm plagiarism detection for both text and code:

**Text Analysis Algorithms**:
1. **Jaccard Similarity** - Measures word set overlap
2. **Cosine Similarity** - Calculates document vector angles
3. **TF-IDF** - Weighs term importance across documents
4. **Levenshtein Distance** - Character-level edit distance
5. **LCS (Longest Common Subsequence)** - Finds matching sequences
6. **Semantic Similarity** - Meaning-based similarity detection

**Code-Specific Algorithms**:
1. **AST Analysis** - Analyzes code structure
2. **CFG Similarity** - Compares program logic flow
3. **Winnowing Fingerprinting** - Creates k-gram fingerprints
4. **Variable Renaming Detection** - Identifies renamed variables

**Features**:
- Assignment creation and management
- Support for text, code, PDF, and image submissions
- Automated flagging (≥60% similarity)
- Side-by-side comparison with highlighting
- Comprehensive PDF reports
- Independent from gamification system

---

## 📖 Documentation

Detailed documentation is available for each major system:

- **[Adaptive Quiz System](./ADAPTIVE_QUIZ_SYSTEM.md)** - Complete guide to the adaptive learning algorithm
- **[Gamification System](./GAMIFICATION_SYSTEM.md)** - Badges, streaks, leaderboards, and progress tracking
- **[Plagiarism Detection](./PLAGIARISM_SYSTEM.md)** - Multi-algorithm plagiarism detection system
- **[JEE System](./JEE_SYSTEM.md)** - JEE-specific quiz implementation
- **[GATE System](./ENHANCED_QUIZ_SYSTEM.md)** - GATE quiz system details
- **[Blog System](./BLOG_SYSTEM_GUIDE.md)** - Blog creation and management
- **[Quick Start Guide](./QUICK_START.md)** - Get started quickly

---

## 🎯 Usage Examples

### Taking a Quiz

1. Navigate to the exam preparation page (e.g., `/gate` or `/jee`)
2. Click on the "Quiz" tab
3. Select quiz type (Full Syllabus, Subject-wise, or Topic-wise)
4. Choose subject and topic (if applicable)
5. Start the adaptive quiz
6. Answer questions with real-time feedback
7. View results with detailed analytics
8. Check updated streak, badges, and leaderboard position

### Checking Progress

1. Navigate to `/progress`
2. View comprehensive statistics dashboard
3. Analyze performance charts (accuracy trends, category distribution, subject performance)
4. Review quiz history
5. Read personalized improvement suggestions
6. Export PDF report for offline viewing

### Using Plagiarism Detection

**For Teachers**:
1. Navigate to `/plagiarism` and select "Teacher" role
2. Create assignments with detailed instructions
3. View student submissions
4. Run plagiarism analysis (requires ≥2 submissions)
5. Review flagged matches and algorithm breakdowns
6. Download PDF reports

**For Students**:
1. Navigate to `/plagiarism` and select "Student" role
2. View available assignments
3. Submit text or code answers
4. Update submissions before deadline
5. Track submission status

---

## 🛠️ Configuration

### Firebase Setup

To enable authentication and data persistence:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config
5. Create a `.env` file with your credentials (see [Getting Started](#-getting-started))

### Customization

**Theme Customization**:
- Edit `tailwind.config.ts` for color schemes
- Modify `src/index.css` for global styles
- Update `components.json` for shadcn/ui theme

**Question Banks**:
- Add questions to `src/data/jeeQuestionBank.ts` or create new files
- Follow the existing question format with difficulty levels
- Update subject and topic arrays

**Gamification Settings**:
- Modify badge criteria in `src/data/badges.ts`
- Adjust rating thresholds in `src/lib/gamification.ts`
- Customize streak requirements

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed
- Ensure TypeScript types are properly defined
- Follow React best practices and hooks guidelines

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules (run `npm run lint`)
- Use functional components with hooks
- Implement proper error handling
- Write reusable, modular components

---

## 🐛 Known Issues & Troubleshooting

### Common Issues

**Build Errors**:
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure Node.js version is 18.x or higher

**Firebase Authentication Issues**:
- Verify `.env` file has correct Firebase credentials
- Check Firebase console for enabled authentication methods

**Quiz Not Loading**:
- Check browser console for errors
- Verify question bank data is properly formatted
- Clear localStorage if needed

---

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with code splitting and lazy loading
- **Load Time**: < 2s on 3G networks
- **Responsive**: Fully responsive across all device sizes

---

## 🔒 Security

- Firebase Authentication for secure user management
- Environment variables for sensitive data
- Client-side validation with Zod schemas
- Secure routing with protected routes
- XSS protection through React's built-in sanitization

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 LearnWise Smart Hub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors & Acknowledgments

### Development Team

- **Avinash Umrao** - [@AvinashUmrao](https://github.com/AvinashUmrao)

### Acknowledgments

This project was built using amazing open-source technologies:

- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Recharts](https://recharts.org/) - Charting library
- [Firebase](https://firebase.google.com/) - Backend services
- [React Router](https://reactrouter.com/) - Routing
- [React Query](https://tanstack.com/query) - Data fetching
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

## 📞 Support & Contact

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/AvinashUmrao/edusmartPlus/issues)
- **Documentation**: See the [documentation](#-documentation) section

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Mobile app (React Native)
- [ ] Real-time multiplayer quizzes
- [ ] AI-powered study recommendations
- [ ] Video lecture integration
- [ ] Discussion forums
- [ ] Mock test series
- [ ] Performance comparison with peers
- [ ] Integration with external plagiarism databases
- [ ] Advanced analytics dashboard for teachers
- [ ] Notification system for deadlines and achievements

---

## ⭐ Show Your Support

If you find this project helpful, please consider:

- Giving it a ⭐ on GitHub
- Sharing it with fellow students and educators
- Contributing to the codebase
- Reporting bugs and suggesting features

---

<div align="center">

**Built with ❤️ for students, by students**

[Documentation](./QUICK_START.md) • [Report Bug](https://github.com/AvinashUmrao/edusmartPlus/issues) • [Request Feature](https://github.com/AvinashUmrao/edusmartPlus/issues)

</div>
