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
    
    // 노션 태그랑 일치해야 됨.
    const title = props.Name?.title?.[0]?.plain_text || "Untitled";
    const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
    const tags = props.Tags?.multi_select?.map(t => t.name) || [];
    const categories = props.Categories?.multi_select?.map(t => t.name) || [];
    
    const safeTitle = title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣\-_]/g, '');
    const fileName = `${date}-${safeTitle}.md`;
    const filePath = path.join("_posts", fileName);

    console.log(`Processing: ${title}`);

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const content = mdString.parent || "";

    const frontmatter = `---\nlayout: post\ntitle: "${title}"\ndate: ${date} 00:00:00 +0900\ncategories: [${categories.join(", ")}]\ntags: [${tags.join(", ")}]\n---\n\n`

    fs.writeFileSync(filePath, frontmatter + content, 'utf8');
    console.log(`Synced: ${fileName} (Description added)`);
  }
}

fetchNotionPosts().catch(console.error);