import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useColorTheme, ColorTheme } from "@/contexts/ThemeContext";

const colorThemes: { name: string; value: ColorTheme; color: string }[] = [
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Purple", value: "purple", color: "bg-purple-500" },
  { name: "Green", value: "green", color: "bg-green-500" },
  { name: "Orange", value: "orange", color: "bg-orange-500" },
  { name: "Rose", value: "rose", color: "bg-rose-500" },
  { name: "Slate", value: "slate", color: "bg-slate-500" },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9" />;
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-9 h-9">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Mode
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              <span>Color</span>
            </div>
          </DropdownMenuLabel>
          {colorThemes.map((ct) => (
            <DropdownMenuItem
              key={ct.value}
              onClick={() => setColorTheme(ct.value)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${ct.color}`} />
                <span>{ct.name}</span>
              </div>
              {colorTheme === ct.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
  );
};
