const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: "2025-09-03",
});

const CHUNK_SIZE = 100;
const MAX_RICH_TEXT = 2000;
const NOTION_CODE_LANGUAGES = new Set([
  "abap", "abc", "agda", "arduino", "ascii art", "assembly", "bash", "basic", "bnf", "c", "c#",
  "c++", "clojure", "coffeescript", "coq", "css", "dart", "dhall", "diff", "docker", "ebnf",
  "elixir", "elm", "erlang", "f#", "flow", "fortran", "gherkin", "glsl", "go", "graphql",
  "groovy", "haskell", "hcl", "html", "idris", "java", "javascript", "json", "julia", "kotlin",
  "latex", "less", "lisp", "livescript", "llvm ir", "lua", "makefile", "markdown", "markup",
  "matlab", "mathematica", "mermaid", "nix", "notion formula", "objective-c", "ocaml", "pascal",
  "perl", "php", "plain text", "powershell", "prolog", "protobuf", "purescript", "python", "r",
  "racket", "reason", "ruby", "rust", "sass", "scala", "scheme", "scss", "shell", "smalltalk",
  "solidity", "sql", "swift", "toml", "typescript", "vb.net", "verilog", "vhdl", "visual basic",
  "webassembly", "xml", "yaml", "java/c/c++/c#",
]);
const CODE_LANGUAGE_ALIASES = {
  "": "plain text",
  plaintext: "plain text",
  text: "plain text",
  txt: "plain text",
  csharp: "c#",
  cs: "c#",
  cpp: "c++",
  "cxx": "c++",
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "shell",
  zsh: "shell",
  psm1: "powershell",
  ps1: "powershell",
  yml: "yaml",
  md: "markdown",
  objc: "objective-c",
};

const propNames = {
  title: process.env.NOTION_PROP_TITLE || "Name",
  date: process.env.NOTION_PROP_DATE || "Date",
  tags: process.env.NOTION_PROP_TAGS || "Tags",
  categories: process.env.NOTION_PROP_CATEGORIES || "Categories",
  published: process.env.NOTION_PROP_PUBLISHED || "Published",
  slug: process.env.NOTION_PROP_SLUG || "Slug",
  sourcePath: process.env.NOTION_PROP_SOURCE_PATH || "Source Path",
};

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [String(value)];
};

const normalizeDate = (value, fallback) => {
  const raw = String(value || fallback || "").trim();
  if (!raw) return new Date().toISOString().slice(0, 10);
  return raw.slice(0, 10);
};

const splitRichText = (text) => {
  const chunks = [];
  let current = String(text || "");
  while (current.length > MAX_RICH_TEXT) {
    chunks.push(current.slice(0, MAX_RICH_TEXT));
    current = current.slice(MAX_RICH_TEXT);
  }
  if (current.length > 0) chunks.push(current);
  return chunks.length > 0 ? chunks : [""];
};

const textToRichText = (text) =>
  splitRichText(text).map((chunk) => ({
    type: "text",
    text: { content: chunk },
  }));

const normalizeCodeLanguage = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  const candidate = CODE_LANGUAGE_ALIASES[normalized] || normalized || "plain text";
  return NOTION_CODE_LANGUAGES.has(candidate) ? candidate : "plain text";
};

const toExternalAssetUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const siteBase = (process.env.SITE_BASE_URL || "").replace(/\/+$/, "");
  if (siteBase && url.startsWith("/")) {
    return `${siteBase}${url}`;
  }

  const rawBase = (process.env.RAW_BASE_URL || "").replace(/\/+$/, "");
  if (rawBase && url.startsWith("/")) {
    return `${rawBase}${url}`;
  }

  return null;
};

const markdownToBlocks = (markdown) => {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  const paragraphBuffer = [];
  const quoteBuffer = [];
  let inCodeBlock = false;
  let codeLang = "plain text";
  let codeLines = [];

  const flushParagraph = () => {
    const joined = paragraphBuffer.join("\n").trim();
    paragraphBuffer.length = 0;
    if (!joined) return;
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: textToRichText(joined) },
    });
  };

  const flushQuote = () => {
    const joined = quoteBuffer.join("\n").trim();
    quoteBuffer.length = 0;
    if (!joined) return;
    blocks.push({
      object: "block",
      type: "quote",
      quote: { rich_text: textToRichText(joined) },
    });
  };

  const flushCode = () => {
    const code = codeLines.join("\n");
    codeLines = [];
    blocks.push({
      object: "block",
      type: "code",
      code: {
        rich_text: textToRichText(code),
        language: codeLang,
      },
    });
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (inCodeBlock) {
      if (/^```/.test(line.trim())) {
        flushCode();
        inCodeBlock = false;
        codeLang = "plain text";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const codeOpen = line.match(/^```([\w+-]*)\s*$/);
    if (codeOpen) {
      flushParagraph();
      flushQuote();
      inCodeBlock = true;
      codeLang = normalizeCodeLanguage(codeOpen[1]);
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushParagraph();
      flushQuote();
      continue;
    }

    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph();
      flushQuote();
      const caption = image[1] || "image";
      const target = toExternalAssetUrl(image[2]);
      if (target) {
        blocks.push({
          object: "block",
          type: "image",
          image: {
            type: "external",
            external: { url: target },
            caption: textToRichText(caption),
          },
        });
      } else {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: textToRichText(line.trim()) },
        });
      }
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushQuote();
      const level = heading[1].length;
      const type = `heading_${level}`;
      blocks.push({
        object: "block",
        type,
        [type]: { rich_text: textToRichText(heading[2].trim()) },
      });
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      flushParagraph();
      flushQuote();
      blocks.push({ object: "block", type: "divider", divider: {} });
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      quoteBuffer.push(quote[1]);
      continue;
    }

    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      flushQuote();
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: textToRichText(numbered[1].trim()) },
      });
      continue;
    }

    const bulleted = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bulleted) {
      flushParagraph();
      flushQuote();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: textToRichText(bulleted[1].trim()) },
      });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushQuote();
  if (inCodeBlock) flushCode();

  return blocks;
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

const getPropertyMeta = (schema, propertyName, expectedTypes = []) => {
  const prop = schema[propertyName];
  if (!prop) return null;
  if (expectedTypes.length === 0 || expectedTypes.includes(prop.type)) return prop;
  return null;
};

const findExistingPage = async (dataSourceId, schema, post) => {
  const slugMeta = getPropertyMeta(schema, propNames.slug, ["rich_text"]);
  if (slugMeta) {
    const bySlug = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 10,
      filter: {
        property: propNames.slug,
        rich_text: { contains: post.slug },
      },
    });
    if (bySlug.results.length > 0) return bySlug.results[0];
  }

  const titleMeta = getPropertyMeta(schema, propNames.title, ["title"]);
  const dateMeta = getPropertyMeta(schema, propNames.date, ["date"]);
  if (titleMeta && dateMeta) {
    const byTitleAndDate = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 10,
      filter: {
        and: [
          { property: propNames.title, title: { contains: post.title } },
          { property: propNames.date, date: { equals: post.date } },
        ],
      },
    });
    if (byTitleAndDate.results.length > 0) return byTitleAndDate.results[0];
  }

  return null;
};

const buildProperties = (schema, post) => {
  const properties = {};

  const titleMeta = getPropertyMeta(schema, propNames.title, ["title"]);
  if (!titleMeta) {
    throw new Error(`Notion title property '${propNames.title}' was not found.`);
  }
  properties[propNames.title] = {
    title: [{ type: "text", text: { content: post.title } }],
  };

  const dateMeta = getPropertyMeta(schema, propNames.date, ["date"]);
  if (dateMeta) {
    properties[propNames.date] = { date: { start: post.date } };
  }

  const tagsMeta = getPropertyMeta(schema, propNames.tags, ["multi_select"]);
  if (tagsMeta) {
    properties[propNames.tags] = {
      multi_select: post.tags.map((name) => ({ name })),
    };
  }

  const categoriesMeta = getPropertyMeta(schema, propNames.categories, ["multi_select"]);
  if (categoriesMeta) {
    properties[propNames.categories] = {
      multi_select: post.categories.map((name) => ({ name })),
    };
  }

  const publishedMeta = getPropertyMeta(schema, propNames.published, ["checkbox"]);
  if (publishedMeta) {
    properties[propNames.published] = { checkbox: true };
  }

  const slugMeta = getPropertyMeta(schema, propNames.slug, ["rich_text"]);
  if (slugMeta) {
    properties[propNames.slug] = { rich_text: textToRichText(post.slug) };
  }

  const sourceMeta = getPropertyMeta(schema, propNames.sourcePath, ["rich_text"]);
  if (sourceMeta) {
    properties[propNames.sourcePath] = { rich_text: textToRichText(post.relativePath) };
  }

  return properties;
};

const listLocalPosts = (postsDir) => {
  return fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(postsDir, name))
    .sort();
};

const parsePost = (filePath, rootDir) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const base = path.basename(filePath, ".md");
  const fallbackTitle = base.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-/g, " ");
  const title = String(parsed.data.title || fallbackTitle).trim();
  const date = normalizeDate(parsed.data.date, base.slice(0, 10));
  const tags = normalizeArray(parsed.data.tags);
  const categories = normalizeArray(parsed.data.categories);

  return {
    filePath,
    relativePath: path.relative(rootDir, filePath).replace(/\\/g, "/"),
    slug: base,
    title,
    date,
    tags,
    categories,
    content: parsed.content.trim(),
  };
};

const clearChildren = async (pageId) => {
  let startCursor = undefined;
  let hasMore = true;
  const ids = [];

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: startCursor,
      page_size: 100,
    });
    ids.push(...response.results.map((b) => b.id));
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }

  for (const id of ids) {
    await notion.blocks.delete({ block_id: id });
  }
};

const appendChildren = async (pageId, blocks) => {
  const payload = blocks.length > 0 ? blocks : [{ object: "block", type: "paragraph", paragraph: { rich_text: textToRichText(" ") } }];
  for (const children of chunk(payload, CHUNK_SIZE)) {
    await notion.blocks.children.append({
      block_id: pageId,
      children,
    });
  }
};

async function syncLocalPostsToNotion() {
  const postsDir = path.resolve(process.cwd(), "_posts");
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }

  const postPaths = listLocalPosts(postsDir);
  console.log(`Found ${postPaths.length} local posts.`);
  if (postPaths.length === 0) {
    console.log("No markdown posts found. Skipping Notion sync.");
    return;
  }

  const dataSourceId = process.env.NOTION_DATABASE_ID;
  if (!process.env.NOTION_API_KEY || !dataSourceId) {
    throw new Error("NOTION_API_KEY and NOTION_DATABASE_ID must be set.");
  }

  const dataSource = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const schema = dataSource.properties || {};

  for (const filePath of postPaths) {
    const post = parsePost(filePath, process.cwd());
    const blocks = markdownToBlocks(post.content);
    const properties = buildProperties(schema, post);
    const existingPage = await findExistingPage(dataSourceId, schema, post);

    if (existingPage) {
      await notion.pages.update({
        page_id: existingPage.id,
        properties,
      });
      await clearChildren(existingPage.id);
      await appendChildren(existingPage.id, blocks);
      console.log(`Updated Notion page for ${post.slug}`);
    } else {
      const created = await notion.pages.create({
        parent: { data_source_id: dataSourceId },
        properties,
      });
      await appendChildren(created.id, blocks);
      console.log(`Created Notion page for ${post.slug}`);
    }
  }
}

syncLocalPostsToNotion().catch((error) => {
  console.error(error);
  process.exit(1);
});
