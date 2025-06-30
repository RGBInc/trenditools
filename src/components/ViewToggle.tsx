import { LayoutGrid, Grid3X3, Grid2X2, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ViewToggleProps {
  viewMode: 1 | 2 | 3 | 4;
  onViewModeChange: (mode: 1 | 2 | 3 | 4) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const modes = [
    { value: 1 as const, icon: Square, label: "Single column" },
    { value: 2 as const, icon: Grid2X2, label: "Two columns" },
    { value: 3 as const, icon: Grid3X3, label: "Three columns" },
    { value: 4 as const, icon: LayoutGrid, label: "Four columns" },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
        {modes.map(({ value, icon: Icon, label }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === value ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange(value)}
                className="w-8 h-8 p-0"
              >
                <Icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
