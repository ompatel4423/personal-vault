import { Component } from "@/components/ui/morphing-card-stack";
import { Layers, Palette, Clock, Sparkles } from "lucide-react";

const cardData = [
  {
    id: "1",
    title: "Magnetic Dock",
    description: "Cursor-responsive scaling with smooth spring animations",
    icon: <Layers className="h-5 w-5 text-emerald-400" />,
  },
  {
    id: "2",
    title: "Gradient Mesh",
    description: "Dynamic animated gradient backgrounds that follow your cursor",
    icon: <Palette className="h-5 w-5 text-sky-400" />,
  },
  {
    id: "3",
    title: "Pulse Timeline",
    description: "Interactive timeline with animated pulse nodes",
    icon: <Clock className="h-5 w-5 text-amber-400" />,
  },
  {
    id: "4",
    title: "Command Menu",
    description: "Radial command palette with keyboard navigation",
    icon: <Sparkles className="h-5 w-5 text-purple-400" />,
  },
];

export function DemoOne() {
  return <Component cards={cardData} />;
}

export default DemoOne;
