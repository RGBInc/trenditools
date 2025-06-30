import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedTools = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if tools already exist
    const existingTools = await ctx.db.query("tools").take(1);
    if (existingTools.length > 0) {
      return "Tools already seeded";
    }

    const sampleTools = [
      {
        name: "Figma",
        url: "https://figma.com",
        tagline: "The collaborative interface design tool",
        summary: "Design, prototype, and collaborate in real-time with your team",
        descriptor: "Figma is a web-based design tool that allows teams to collaborate on interface design, prototyping, and design systems. Perfect for UI/UX designers, product teams, and developers working together.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Design",
        tags: ["design", "collaboration", "prototyping", "ui", "ux"],
        rating: 4.8,
        featured: true,
      },
      {
        name: "Notion",
        url: "https://notion.so",
        tagline: "All-in-one workspace for notes, docs, and collaboration",
        summary: "Write, plan, share, and get organized with Notion's connected workspace",
        descriptor: "Notion combines notes, docs, wikis, and project management in one tool. Create databases, write documents, manage tasks, and collaborate with your team in a flexible, customizable workspace.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Productivity",
        tags: ["productivity", "notes", "collaboration", "database", "workspace"],
        rating: 4.6,
        featured: true,
      },
      {
        name: "Canva",
        url: "https://canva.com",
        tagline: "Design anything, publish anywhere",
        summary: "Create stunning graphics, presentations, and social media content",
        descriptor: "Canva is a graphic design platform that makes it easy to create professional designs. With thousands of templates, photos, and graphics, anyone can create beautiful content for social media, presentations, and marketing materials.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Design",
        tags: ["design", "graphics", "templates", "social media", "marketing"],
        rating: 4.7,
        featured: true,
      },
      {
        name: "Slack",
        url: "https://slack.com",
        tagline: "Where work happens",
        summary: "Team communication and collaboration platform",
        descriptor: "Slack brings team communication together in one place. Organize conversations in channels, share files, integrate with other tools, and keep your team connected whether you're in the office or working remotely.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Communication",
        tags: ["communication", "team", "collaboration", "messaging", "remote work"],
        rating: 4.5,
        featured: false,
      },
      {
        name: "Trello",
        url: "https://trello.com",
        tagline: "Organize anything, together",
        summary: "Visual project management with boards, lists, and cards",
        descriptor: "Trello uses boards, lists, and cards to help you organize and prioritize your projects. Whether you're managing a team or organizing your personal tasks, Trello's visual approach makes it easy to see what needs to be done.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Productivity",
        tags: ["project management", "organization", "kanban", "collaboration", "tasks"],
        rating: 4.4,
        featured: false,
      },
      {
        name: "Zoom",
        url: "https://zoom.us",
        tagline: "Video communications for everyone",
        summary: "Video conferencing, webinars, and online meetings",
        descriptor: "Zoom provides video conferencing, online meetings, and webinar solutions. Connect with colleagues, clients, and friends through high-quality video calls, screen sharing, and collaboration features.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Communication",
        tags: ["video conferencing", "meetings", "webinars", "remote work", "communication"],
        rating: 4.3,
        featured: false,
      },
      {
        name: "Adobe Creative Cloud",
        url: "https://adobe.com/creativecloud",
        tagline: "Creativity for all",
        summary: "Complete suite of creative applications and services",
        descriptor: "Adobe Creative Cloud includes industry-standard applications like Photoshop, Illustrator, InDesign, and Premiere Pro. Perfect for graphic designers, photographers, video editors, and creative professionals.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Design",
        tags: ["design", "photo editing", "video editing", "creative", "professional"],
        rating: 4.6,
        featured: true,
      },
      {
        name: "GitHub",
        url: "https://github.com",
        tagline: "Where the world builds software",
        summary: "Code hosting, version control, and collaboration for developers",
        descriptor: "GitHub is a development platform that lets you host and review code, manage projects, and build software alongside millions of other developers. Essential for version control and open source collaboration.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Development",
        tags: ["development", "version control", "collaboration", "code", "open source"],
        rating: 4.8,
        featured: true,
      },
      {
        name: "Airtable",
        url: "https://airtable.com",
        tagline: "Part spreadsheet, part database, totally flexible",
        summary: "Organize work your way with flexible database and spreadsheet hybrid",
        descriptor: "Airtable combines the simplicity of a spreadsheet with the power of a database. Create custom workflows, track projects, manage content, and organize any type of information with rich field types and powerful views.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Productivity",
        tags: ["database", "spreadsheet", "organization", "workflow", "collaboration"],
        rating: 4.5,
        featured: false,
      },
      {
        name: "Loom",
        url: "https://loom.com",
        tagline: "Record and share video messages instantly",
        summary: "Screen and camera recording for async communication",
        descriptor: "Loom makes it easy to record your screen, camera, or both to create shareable video messages. Perfect for tutorials, feedback, presentations, and asynchronous communication with your team.",
        screenshot: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
        category: "Communication",
        tags: ["screen recording", "video", "communication", "tutorials", "async"],
        rating: 4.6,
        featured: false,
      },
    ];

    for (const tool of sampleTools) {
      await ctx.db.insert("tools", tool);
    }

    return `Seeded ${sampleTools.length} tools successfully!`;
  },
});
