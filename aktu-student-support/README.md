# AKTU Student Support AI Chatbot (Frontend UI)

A modern, responsive, university-tech frontend web application built with **Next.js (App Router)** and **Tailwind CSS** for students of **Dr. A.P.J. Abdul Kalam Technical University (AKTU)**.

---

## 🌟 Features Implemented

### 1. Polished Landing Page (`/`)
- **University Brand Identity**: Official AKTU typography, dark navy theme, subtle glassmorphism panels, and glow accents.
- **Hero Section**: Headline, university stats (800+ colleges, 400K+ students), CTA buttons, and quick popular prompts.
- **Interactive Chatbot Preview Widget**: Real-time topic switcher demonstrating how the AI answers grace marks, CGPA-to-percentage conversion, and challenge evaluation SOPs.
- **5 Core Pillars Showcase**: Dedicated interactive cards for all 5 university resource categories.
- **Features & Accordion FAQ**: Accordion answering student inquiries on ordinances, detention, and branches.
- **University Footer**: Direct links to AKTU ERP, OneView result portal, Nodal center Lucknow address, and contact numbers.

### 2. Student AI Chatbot Dashboard (`/chat`)
- **Conversational Sidebar**:
  - `+ New Conversation` button with dynamic session management.
  - Chat history session list with realistic student inquiry previews.
  - Responsive mobile drawer support with toggle button.
- **Interactive Chat Stream**:
  - Realistic keyword-driven mock AI responses (grace marks, COP back papers, CGPA calculation, AICTE CSE syllabus, attendance criteria).
  - Official citation badges referencing AKTU ordinances and COE circulars.
  - Interactive response actions (Copy to clipboard with checkmark, Thumbs Up/Down feedback).
  - Pulsing typing indicator simulating knowledge base search.
  - Suggested question chips for instant 1-click prompts.

### 3. Comprehensive Resources & Documentation Hub (`/resources`)
Dedicated catalog covering all 5 required university categories:
1. **B.Tech syllabus and academic scheme** (CSE AI/ML, 1st Year AICTE, IT CBCS, ECE).
2. **Examination regulations and academic rules** (Grace marks ordinance, detention & 75% attendance rules, challenge evaluation SOP).
3. **Academic calendar and examination schedules** (Odd/Even semester calendars, tentative datesheets).
4. **University notices and circulars** (ABC ID / DigiLocker registration, practical & viva circulars).
5. **Results, carry-over papers, and examination guidelines** (Carry Over Paper COP forms, PDC/Migration guide, Honours division criteria).

- **Features**: Category tab filtering, live multi-field keyword search, branch filters, tag chips, and document download modal.

### 4. Authentication Flow (UI-only)
- **Sign In (`/login`)**:
  - AKTU Roll Number / University Email input.
  - Password reveal toggle, remember me checkbox.
  - Form validation UI and 1-click **"Fill Mock Details"** demo button.
- **Sign Up (`/signup`)**:
  - 13-digit university roll number format validation.
  - Engineering branch and semester selection dropdowns.
  - Password matching and terms of conduct confirmation.
- **Forgot Password (`/forgot-password`)**:
  - University identifier verification.
  - Instant dispatched status feedback with instructions for AKTU ERP users.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on `v26.7.0`)
- npm `v9+` or `v11+`

### Running Locally

```bash
cd aktu-student-support
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture & Future Integration Readiness

The codebase is organized with separation of concerns to allow plugging in backend APIs, RAG vector pipelines, and authentication when needed:

```
src/
├── app/
│   ├── chat/page.tsx            # AI Chatbot Dashboard
│   ├── forgot-password/page.tsx # Password Reset UI
│   ├── login/page.tsx           # Student Sign In UI
│   ├── resources/page.tsx       # 5 Document Categories Hub
│   ├── signup/page.tsx          # Student Registration UI
│   ├── globals.css              # Glassmorphism & university dark theme
│   ├── layout.tsx               # Root Layout with Inter font & SEO meta
│   └── page.tsx                 # Main Landing Page
├── components/
│   ├── ChatbotPreview.tsx       # Interactive Hero Preview Widget
│   ├── Footer.tsx               # University Footer with links & contacts
│   ├── Navbar.tsx               # Navigation Bar with responsive drawer
│   └── ResourceCategories.tsx   # 5-Pillar Resource Section
├── data/
│   └── mockData.ts              # Categorized documents, sample FAQs, sessions
├── lib/
│   └── utils.ts                 # Tailwind cn utility function
└── types/
    └── index.ts                 # TypeScript interfaces for Docs, Chats & Sessions
```
