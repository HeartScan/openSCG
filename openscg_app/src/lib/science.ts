import fs from 'fs/promises';
import path from 'path';
import { Study, StudyImage } from '@/types/science';
import matter from 'gray-matter';

const SCIENCE_HUB_DIR = path.join(process.cwd(), 'public', 'science-hub');

export async function getMasterStudies(): Promise<Study[]> {
  const filePath = path.join(SCIENCE_HUB_DIR, 'master_studies.json');
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

export async function getStudyById(id: string): Promise<Study | undefined> {
  const studies = await getMasterStudies();
  return studies.find(s => s.id === id);
}

export async function getStudyBySlug(slug: string): Promise<Study | undefined> {
  const studies = await getMasterStudies();
  return studies.find(s => s.slug === slug);
}

export async function getStudyContent(id: string): Promise<{ content: string; data: Record<string, unknown> }> {
  const filePath = path.join(SCIENCE_HUB_DIR, 'studies', `${id}.md`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const { content, data } = matter(raw);
    return { content, data };
  } catch (error) {
    console.error(`Error reading study content for ${id}:`, error);
    return { content: '', data: {} };
  }
}

export async function getStudyImages(id: string): Promise<StudyImage[]> {
  try {
    const filePath = path.join(SCIENCE_HUB_DIR, 'images.json');
    const content = await fs.readFile(filePath, 'utf8');
    const allImages = JSON.parse(content);
    return allImages.filter((img: StudyImage & { studyId: string }) => img.studyId === id);
  } catch (error) {
    console.error(`Error reading images for study ${id}:`, error);
    return [];
  }
}

export async function getSynthesisContent(slug: string): Promise<{ content: string; data: Record<string, unknown> }> {
  const filePath = path.join(SCIENCE_HUB_DIR, 'synthesis', `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const { content, data } = matter(raw);
    return { content, data };
  } catch (error) {
    console.error(`Error reading synthesis content for ${slug}:`, error);
    return { content: '', data: {} };
  }
}

export async function getSynthesisSlugs(): Promise<string[]> {
  const synthesisDir = path.join(SCIENCE_HUB_DIR, 'synthesis');
  try {
    const files = await fs.readdir(synthesisDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error reading synthesis directory:', error);
    return [];
  }
}
