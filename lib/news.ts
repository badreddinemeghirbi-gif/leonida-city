import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Reads content/news/*.md at BUILD time. To publish an article you
 * write a markdown file and push — nothing else.
 */

const DIR = path.join(process.cwd(), 'content', 'news');

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  updated?: string;
  tag: string;
  cover?: string;
  html: string;
  readingMinutes: number;
};

function readOne(file: string): Article | null {
  if (!file.endsWith('.md')) return null;

  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const { data, content } = matter(raw);
  if (data.draft === true) return null;

  const words = content.split(/\s+/).length;

  return {
    slug: file.replace(/\.md$/, ''),
    title: data.title ?? file.replace(/\.md$/, ''),
    excerpt: data.excerpt ?? content.slice(0, 160).replace(/[#*_>`]/g, '') + '…',
    date: data.date ?? '1970-01-01',
    updated: data.updated,
    tag: data.tag ?? 'News',
    cover: data.cover,
    html: marked.parse(content, { async: false }) as string,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

export function getArticles(): Article[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .map(readOne)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | null {
  return getArticles().find((a) => a.slug === slug) ?? null;
}
