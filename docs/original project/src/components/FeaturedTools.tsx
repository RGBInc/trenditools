import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { SeedButton } from "./SeedButton";
import { Loader2, Star } from "lucide-react";

interface FeaturedToolsProps {
  onViewDetails: (tool: Doc<"tools">) => void;
}

export function FeaturedTools({ onViewDetails }: FeaturedToolsProps) {
  const featuredTools = useQuery(api.tools.getFeaturedTools);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="text-2xl font-bold">Featured Tools</h2>
        </div>
        <p className="text-muted-foreground">Curated tools that are trending and highly rated</p>
      </div>
      
      {!featuredTools ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : featuredTools.length === 0 ? (
        <SeedButton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <ToolCard key={tool._id} tool={tool} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}
    </div>
  );
}
