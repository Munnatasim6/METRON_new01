# ⚡ Metron - High Frequency Trading Dashboard

![Metron Banner](public/icon-512.svg)

**Metron** is an industry-grade, ultra-low latency trading dashboard designed for monitoring high-frequency trading (HFT) systems. It provides real-time visualizations, system health monitoring, and direct control over trading strategies.

## ✨ Key Features

- **🚀 Real-Time Monitoring:** Live data updates for system metrics, PnL, and active positions.
- **📱 PWA Support:** Installable on Desktop and Mobile with offline capabilities.
- **🌍 Internationalization (i18n):** Native support for English (EN) and Bengali (BN).
- **🛡️ Sentry Integration:** Production-grade error tracking and performance monitoring.
- **🧪 Robust Testing:** Automated unit tests with Vitest and React Testing Library.
- **💅 Modern UI:** Sleek, dark-mode interface built with TailwindCSS and Lucide Icons.
- **🔄 Persistent State:** User settings and logs are preserved across sessions using Zustand Persist.
- **🔍 SEO Optimized:** Dynamic meta tags and titles using React Helmet Async.

## 🛠 Tech Stack

- **Core:** React 18, TypeScript, Vite
- **State Management:** Zustand
- **Styling:** TailwindCSS, Lucide React
- **Charts:** Recharts
- **Testing:** Vitest, Testing Library
- **Quality Control:** ESLint, Prettier, Husky, Lint-Staged
- **CI/CD:** GitHub Actions

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/metron.git
   cd metron
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## 📖 Component Documentation (Storybook)

Metron uses **Storybook** for UI component development and documentation.

1. **Run Storybook:**
   ```bash
   npm run storybook
   ```
   This will open the Storybook interface at `http://localhost:6006`.

## 📂 Project Structure

```
f:/metron
├── .github/            # GitHub Actions (CI/CD)
├── .husky/             # Pre-commit hooks
├── public/             # Static assets (Icons, Locales)
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layouts (Sidebar, Header)
│   ├── pages/          # Application pages
│   ├── services/       # API and Audio services
│   ├── store/          # Global State (Zustand)
│   ├── stories/        # Storybook stories
│   ├── test/           # Test setup and utilities
│   ├── App.tsx         # Main App Component
│   ├── i18n.ts         # Internationalization Config
│   └── index.tsx       # Entry Point
└── vite.config.ts      # Vite Configuration
```

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

Built with ❤️ by **Antigravity** & **Munna**.
