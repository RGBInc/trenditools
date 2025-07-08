# TrendiTools Schema Documentation

## Tool Data Schema

This document defines the complete schema for tool data in TrendiTools, explaining each field's purpose, usage in the UI, and how to make changes.

### Core Schema Structure

```json
{
  "url": "string (required)",
  "name": "string (required)",
  "tagline": "string (required)",
  "summary": "string (required)",
  "descriptor": "string (required)",
  "category": "string (optional)",
  "tags": "array of strings (optional)",
  "screenshot": "string (required)",
  "rating": "number or null (optional)",
  "featured": "boolean (optional)"
}
```

### Field Definitions

#### `url` (string, required)
- **Purpose**: The primary URL of the tool/service
- **UI Usage**: Used for navigation when users click on tools
- **Database**: Indexed for uniqueness
- **Example**: `"https://aetherbrain.ai"`

#### `name` (string, required)
- **Purpose**: The display name of the tool
- **UI Usage**: Primary title shown on ToolCard and ToolPage
- **Database**: Searchable field with dedicated search index
- **Example**: `"Aether Brain"`

#### `tagline` (string, required)
- **Purpose**: Short, catchy description (subtitle)
- **UI Usage**: Displayed as subtitle on tool cards and pages
- **Database**: Not indexed for search
- **Example**: `"Research Assistant"`

#### `summary` (string, required)
- **Purpose**: Detailed description of the tool (500+ words recommended)
- **UI Usage**: Full description shown on individual tool pages
- **Database**: Not directly searchable
- **Example**: Long-form content describing features and benefits

#### `descriptor` (string, required)
- **Purpose**: Descriptive statement for search optimization and internal categorization
- **UI Usage**: Used in search indexes but not displayed to users
- **Database**: Has dedicated search index (`search_content`)
- **Format**: Can be a single word or descriptive phrase that captures the tool's essence
- **Example**: `"Research assistant for academic papers"`, `"Design collaboration platform"`, `"Productivity automation tool"`
- **Note**: Should be optimized for search discoverability rather than display

#### `category` (string, optional)
- **Purpose**: **PRIMARY UI FIELD** for user-facing organization
- **UI Usage**: 
  - CategoryFilter component for filtering
  - Displayed on ToolCard and ToolPage
  - Used in search filters
- **Database**: Multiple indexes (`by_category`, search filters)
- **Example**: `"Research"`, `"Design"`, `"Development"`
- **Note**: This is what users see and interact with

#### `tags` (array of strings, optional)
- **Purpose**: Searchable keywords for discovery
- **UI Usage**: Used in search functionality
- **Database**: Dedicated search index (`search_tags`)
- **Example**: `["research", "academic", "productivity", "collaboration"]`

#### `screenshot` (string, required)
- **Purpose**: URL to tool's screenshot/preview image
- **UI Usage**: Displayed on tool cards and pages
- **Database**: Not indexed
- **Example**: `"https://trendi-tools.b-cdn.net/Aether%20Brain.png"`

#### `rating` (number or null, optional)
- **Purpose**: User rating (future feature)
- **UI Usage**: Not currently implemented in UI
- **Database**: Not indexed
- **Example**: `4.5` or `null`

#### `featured` (boolean, optional)
- **Purpose**: Mark tools as featured for special display
- **UI Usage**: Used in FeaturedTools component
- **Database**: Indexed (`by_featured`) and searchable
- **Example**: `true` or `false`

## Database Schema (Convex)

The schema is defined in `/convex/schema.ts`:

```typescript
tools: defineTable({
  url: v.string(),
  descriptor: v.string(),
  name: v.string(),
  screenshot: v.string(),
  summary: v.string(),
  tagline: v.string(),
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  rating: v.optional(v.number()),
  featured: v.optional(v.boolean()),
})
```

### Database Indexes

1. **`by_category`**: Enables fast filtering by category
2. **`by_featured`**: Enables fast queries for featured tools
3. **`by_url`**: Ensures URL uniqueness and fast lookups
4. **`search_tools`**: Full-text search on tool names
5. **`search_content`**: Full-text search on descriptors
6. **`search_tags`**: Full-text search on tags

## Making Schema Changes

### 1. Database Schema Changes

**File**: `/convex/schema.ts`

```typescript
// To add a new field:
tools: defineTable({
  // ... existing fields
  newField: v.optional(v.string()), // or required: v.string()
})
```

**Important**: 
- Use `v.optional()` for new fields to avoid breaking existing data
- Consider adding indexes if the field will be searched/filtered
- Deploy schema changes: `npx convex deploy`

### 2. Data Processing Scripts

**Files to update**:
- `/scripts/process-tools.js` - Main tool processing script
- `/scripts/csv-to-json.js` - CSV conversion

**Example addition**:
```javascript
// In enrichment scripts, add new field processing:
const toolData = {
  // ... existing fields
  newField: processNewField(rawData),
};
```

### 3. UI Components

**Files to update**:
- `/src/components/ToolCard.tsx` - Tool card display
- `/src/components/ToolPage.tsx` - Individual tool page
- `/src/components/SearchEngine.tsx` - Search functionality
- `/src/components/CategoryFilter.tsx` - Category filtering

**Example UI update**:
```tsx
// In ToolCard.tsx:
<div className="new-field">
  {tool.newField}
</div>
```

### 4. TypeScript Types

If using TypeScript interfaces, update tool type definitions in relevant files.

## Data Flow

1. **Raw Data** → CSV files in `/data/`
2. **Processing** → Enrichment scripts in `/scripts/`
3. **Storage** → Convex database via upload scripts
4. **Display** → React components in `/src/components/`

## Best Practices

### Field Naming
- Use camelCase for consistency
- Keep names descriptive but concise
- Avoid abbreviations unless widely understood

### Data Validation
- Always validate required fields in processing scripts
- Use appropriate data types in schema
- Handle null/undefined values gracefully

### Performance
- Add indexes for frequently queried fields
- Consider field size limits for large text content
- Use optional fields for new additions

### UI Consistency
- Follow existing component patterns
- Maintain responsive design principles
- Test new fields across different screen sizes

## Common Operations

### Adding a New Tool
1. Add tool data to CSV or create JSON file
2. Run processing script: `node scripts/process-tools.js`
3. Upload to database: `node scripts/upload-tools.js`

### Updating Existing Tools
1. Modify data in source files
2. Re-run enrichment if needed
3. Re-upload to database

### Schema Migration
1. Update `/convex/schema.ts`
2. Deploy: `npx convex deploy`
3. Update processing scripts
4. Update UI components
5. Test thoroughly

## Troubleshooting

### Common Issues
- **Schema mismatch**: Ensure all required fields are present
- **Index errors**: Check that indexed fields exist and have correct types
- **UI errors**: Verify component props match schema structure
- **Search issues**: Confirm search indexes are properly configured

### Debugging
- Check Convex dashboard for schema validation errors
- Use browser dev tools to inspect component props
- Review enrichment script logs for processing errors
- Test with small data samples before full deployment