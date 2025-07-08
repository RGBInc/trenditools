interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const allCategories = ["", ...categories];

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {allCategories.map((category) => (
            <button
              key={category || 'all'}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {category || 'All'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
