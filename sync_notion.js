const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: "2025-09-03",
});
const n2m = new NotionToMarkdown({ notionClient: notion });

// Helper function to download a file
const downloadFile = (url, targetPath) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);
    https
      .get(url, (response) => {
        if (response.statusCode >= 400) {
          return reject(
            new Error(`Failed to download file: ${response.statusCode}`)
          );
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(targetPath, () => reject(err));
      });
  });

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

  const postsDir = "_posts";
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
  }

  const assetsImgDir = "assets/img/posts";
  if (!fs.existsSync(assetsImgDir)) {
    fs.mkdirSync(assetsImgDir, { recursive: true });
  }

  for (const page of response.results) {
    const props = page.properties;

    const title = props.Name?.title?.[0]?.plain_text || "Untitled";
    const date =
      props.Date?.date?.start || new Date().toISOString().split("T")[0];
    const tags = props.Tags?.multi_select?.map((t) => t.name) || [];
    const categories = props.Categories?.multi_select?.map((t) => t.name) || [];

    const safeTitle = title
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9가-힣\-_]/g, "");
    const postFileName = `${date}-${safeTitle}.md`;
    const postFilePath = path.join(postsDir, postFileName);

    const imageDirName = `${date}-${safeTitle}`;
    const imagesDirPath = path.join(assetsImgDir, imageDirName);
    
    if (!fs.existsSync(imagesDirPath)) {
      fs.mkdirSync(imagesDirPath, { recursive: true });
    }

    console.log(`Processing: ${title}`);

    n2m.setCustomTransformer("image", async (block) => {
      const { image } = block;
      const imageUrl = image.type === "external" ? image.external.url : image.file.url;
      const caption = image.caption[0]?.plain_text || "image";

      try {
        const fileExtension = path.extname(new URL(imageUrl).pathname);
        const imageName = `${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
        const imagePath = path.join(imagesDirPath, imageName);
        const relativeImagePath = `/assets/img/posts/${imageDirName}/${imageName}`;

        await downloadFile(imageUrl, imagePath);
        console.log(`Downloaded image: ${imageName}`);
        return `![${caption}](${relativeImagePath})`;
      } catch (error) {
        console.error(`Failed to download image from ${imageUrl}:`, error);
        return `![Failed to download image: ${caption}](${imageUrl})`;
      }
    });

    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const content = mdString.parent || "";

    const frontmatter = `---
layout: post
title: "${title}"
date: ${date} 00:00:00 +0900
categories: [${categories.join(", ")}]
tags: [${tags.join(", ")}]
---

`;

    fs.writeFileSync(postFilePath, frontmatter + content, "utf8");
    console.log(`Synced: ${postFileName}`);
  }
}

fetchNotionPosts().catch(console.error);