# Chirpy Starter

[![Gem Version](https://img.shields.io/gem/v/jekyll-theme-chirpy)][gem]&nbsp;
[![GitHub license](https://img.shields.io/github/license/cotes2020/chirpy-starter.svg?color=blue)][mit]

When installing the [**Chirpy**][chirpy] theme through [RubyGems.org][gem], Jekyll can only read files in the folders
`_data`, `_layouts`, `_includes`, `_sass` and `assets`, as well as a small part of options of the `_config.yml` file
from the theme's gem. If you have ever installed this theme gem, you can use the command
`bundle info --path jekyll-theme-chirpy` to locate these files.

The Jekyll team claims that this is to leave the ball in the user’s court, but this also results in users not being
able to enjoy the out-of-the-box experience when using feature-rich themes.

To fully use all the features of **Chirpy**, you need to copy the other critical files from the theme's gem to your
Jekyll site. The following is a list of targets:

```shell
.
├── _config.yml
├── _plugins
├── _tabs
└── index.html
```

To save you time, and also in case you lose some files while copying, we extract those files/configurations of the
latest version of the **Chirpy** theme and the [CD][CD] workflow to here, so that you can start writing in minutes.

## Usage

Check out the [theme's docs](https://github.com/cotes2020/jekyll-theme-chirpy/wiki).

## Notion Sync (Local Posts -> Notion)

This repository syncs local markdown posts in `_posts` to a Notion data source.

1. Write posts locally (for example with Obsidian) in `_posts/*.md`.
2. Push to `main` (including pushes from another repository workflow).
3. GitHub Actions (`Sync Posts To Notion`) runs `npm run sync:notion` and uploads posts to Notion.

### Required secrets

- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`

### Optional variables

- `SITE_BASE_URL` (for turning `/assets/...` image paths into absolute URLs)
- `NOTION_PROP_TITLE`, `NOTION_PROP_DATE`, `NOTION_PROP_TAGS`, `NOTION_PROP_CATEGORIES`, `NOTION_PROP_PUBLISHED`, `NOTION_PROP_SLUG`, `NOTION_PROP_SOURCE_PATH`

Default Notion property names are:

- Title: `Name` (required)
- Date: `Date`
- Tags: `Tags`
- Categories: `Categories`
- Published: `Published`
- Slug: `Slug`
- Source Path: `Source Path`

## Contributing

This repository is automatically updated with new releases from the theme repository. If you encounter any issues or want to contribute to its improvement, please visit the [theme repository][chirpy] to provide feedback.

## License

This work is published under [MIT][mit] License.

[gem]: https://rubygems.org/gems/jekyll-theme-chirpy
[chirpy]: https://github.com/cotes2020/jekyll-theme-chirpy/
[CD]: https://en.wikipedia.org/wiki/Continuous_deployment
[mit]: https://github.com/cotes2020/chirpy-starter/blob/master/LICENSE
