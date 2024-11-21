// src/app/page.tsx

import BackgroundPattern from "@/components/common/BackgroundPattern";
import LandingPage from "@/components/public/LandingPage";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Layout } from "lucide-react";
import Nav from "@/components/common/Nav";

export default function Home() {
  return (
    <div>
      <header>
        <div>
          <Nav />
        </div>
      </header>
      <LandingPage />
      <BackgroundPattern />
    </div>
  );
}
