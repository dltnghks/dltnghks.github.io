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
    
    const title = props.Name?.title?.[0]?.plain_text || "Untitled";
    const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];
    const tags = props.Tag?.multi_select?.map(t => t.name) || [];
    
    const safeTitle = title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣\-_]/g, '');
    const fileName = `${date}-${safeTitle}.md`;
    const filePath = path.join("_posts", fileName);

    console.log(`Processing: ${title}`);

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const content = mdString.parent || "";

    // --- 핵심 수정: 본문 내용을 description으로 변환 ---
    // 마크다운 문법 제거 후 순수 텍스트만 추출
    let plainText = content
      .replace(/^#+\s+/gm, '') // 헤더 제거
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // 볼드 제거
      .replace(/(\*|_)(.*?)\1/g, '$2') // 이탤릭 제거
      .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 태그 제거
      .replace(/\^([^\]]+)\]\(.*?\)/g, '$1') // 링크 텍스트만 남김
      .replace(/\n/g, ' ') // 줄바꿈 -> 공백
      .replace(/\s+/g, ' ') // 다중 공백 -> 하나로
      .trim();

    // 150자 정도로 자르기 (미리보기에 적당한 길이)
    const description = plainText.length > 150 
      ? plainText.substring(0, 150) + "..." 
      : plainText;

    const frontmatter = `---\nlayout: post\ntitle: "${title}"\ndate: ${date} 00:00:00 +0900\ncategories: [Notion]\ntags: [${tags.join(", ")}]\ndescription: "${description.replace(/"/g, '\\"')}"\n---`

    fs.writeFileSync(filePath, frontmatter + content, 'utf8');
    console.log(`Synced: ${fileName} (Description added)`);
  }
}

fetchNotionPosts().catch(console.error);