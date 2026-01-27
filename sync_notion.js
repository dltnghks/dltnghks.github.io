const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchNotionPosts() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
  });

  for (const page of response.results) {
    const title = page.properties.Name.title[0]?.plain_text || "Untitled";
    const date = page.properties.Date?.date?.start || new Date().toISOString().split('T')[0];
    const tags = page.properties.Tags?.multi_select.map(t => t.name) || [];
    
    // Create valid filename: YYYY-MM-DD-title.md
    const safeTitle = title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '-').toLowerCase();
    const fileName = `${date}-${safeTitle}.md`;
    const filePath = path.join("_posts", fileName);

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);

    const frontmatter = `---
layout: post
title: "${title}"
date: ${date} 00:00:00 +0900
categories: [Notion]
tags: [${tags.join(", ")}]
---

`;

    fs.writeFileSync(filePath, frontmatter + mdString.parent);
    console.log(`Synced: ${fileName}`);
  }
}

fetchNotionPosts().catch(console.error);
