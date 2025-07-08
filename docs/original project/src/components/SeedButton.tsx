import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function SeedButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const seedTools = useMutation(api.seedData.seedTools);
  const tools = useQuery(api.tools.getFeaturedTools);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedTools({});
      console.log(result);
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Don't show the button if tools already exist
  if (tools && tools.length > 0) {
    return null;
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-600 dark:text-gray-300 mb-4">No tools found in the database. Would you like to add some sample tools?</p>
      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSeeding ? "Adding Sample Tools..." : "Add Sample Tools"}
      </button>
    </div>
  );
}
