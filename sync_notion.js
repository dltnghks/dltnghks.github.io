const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const notion = new Client({ 
    auth: process.env.NOTION_API_KEY,
    notionVersion: "2025-09-03"
});
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchNotionPosts() {
  const dataSourceId = process.env.NOTION_DATABASE_ID;
  
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
    const props = page.properties;
    
    // 속성 이름에 주의하세요! (Tag vs Tags)
    const title = props.Name?.title?.[0]?.plain_text || "Untitled";
    const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
    const tags = props.Tag?.multi_select?.map(t => t.name) || []; // 'Tag'로 수정됨
    
    // 한글 제목도 파일명에 쓸 수 있도록 허용 (공백은 -로)
    const safeTitle = title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣\-\_]/g, '');
    const fileName = `${date}-${safeTitle}.md`;
    const filePath = path.join("_posts", fileName);

    console.log(`Processing: ${title}`);

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    
    // 본문 내용 추출 (parent 속성이 문자열을 담고 있음)
    const content = mdString.parent || "";

    const frontmatter = `---
layout: post
title: "${title}"
date: ${date} 00:00:00 +0900
categories: [Notion]
tags: [${tags.join(", ")}]
---

`;

    fs.writeFileSync(filePath, frontmatter + content, 'utf8');
    console.log(`Synced: ${fileName}`);
  }
}

fetchNotionPosts().catch(console.error);
