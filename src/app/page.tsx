import BackgroundPattern from "@/components/common/BackgroundPattern";
import LandingPage from "@/components/public/LandingPage";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Layout } from "lucide-react";

export default function Home() {
  return (
    <div>
      <header className="bg-white/80 dark:bg-dark-bg-start/80 shadow-sm border-b border-gray-200 dark:border-dark-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layout className="w-8 h-8 text-dark-accent dark:text-dark-accent" />
              <div>
                <h1 className="text-2xl font-bold font-mono text-gray-900 dark:text-dark-text-primary tech-glow">
                  shilp.io
                </h1>
                <p className="text-sm font-mono text-gray-600 dark:text-dark-text-secondary">
                  Requirements Engineering Made Simple
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <LandingPage />
      <BackgroundPattern />
      <h1>Hello World</h1>
    </div>
  );
}
