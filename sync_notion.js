const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 2025-09-03 버전을 명시적으로 사용
const notion = new Client({ 
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2025-09-03" 
});
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchNotionPosts() {
  const dataSourceId = process.env.NOTION_DATABASE_ID;
  
  // 최신 API에서는 dataSources.query를 사용합니다.
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
  });

  if (!fs.existsSync("_posts")) {
    fs.mkdirSync("_posts");
  }

  for (const page of response.results) {
    // 2025-09-03 버전에서는 페이지 속성 구조가 달라졌을 수 있으므로 안전하게 가져옵니다.
    const props = page.properties;
    const title = props.Name?.title[0]?.plain_text || "Untitled";
    const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
    const tags = props.Tags?.multi_select.map(t => t.name) || [];
    
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

fetchNotionPosts().catch(err => {
    console.error("Error during sync:", err.message);
    if (err.body) console.error("Details:", err.body);
});