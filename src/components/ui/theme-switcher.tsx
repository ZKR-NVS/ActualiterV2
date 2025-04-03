import { useState, useEffect } from "react";
import { Button } from "./button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const themes = [
  { name: "Default", value: "default" },
  { name: "Ocean", value: "theme-ocean" },
  { name: "Forest", value: "theme-forest" },
  { name: "Sunset", value: "theme-sunset" },
  { name: "Lavender", value: "theme-lavender" },
  { name: "Midnight", value: "theme-midnight" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    // Check if there's a theme stored in localStorage
    const savedTheme = localStorage.getItem("theme") || "default";
    setCurrentTheme(savedTheme);
    
    // Apply the theme by adding the class to the HTML element
    const htmlElement = document.documentElement;
    
    // Remove any existing theme classes
    themes.forEach(theme => {
      if (theme.value !== "default") {
        htmlElement.classList.remove(theme.value);
      }
    });
    
    // Add the current theme class if it's not default
    if (savedTheme !== "default") {
      htmlElement.classList.add(savedTheme);
    }
  }, []);

  const changeTheme = (theme: string) => {
    const htmlElement = document.documentElement;
    
    // Remove any existing theme classes
    themes.forEach(t => {
      if (t.value !== "default") {
        htmlElement.classList.remove(t.value);
      }
    });
    
    // Add the new theme class if it's not default
    if (theme !== "default") {
      htmlElement.classList.add(theme);
    }
    
    // Save the theme to localStorage
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => changeTheme(theme.value)}
            className={currentTheme === theme.value ? "bg-accent text-accent-foreground" : ""}
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 