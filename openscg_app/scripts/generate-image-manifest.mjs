import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'science-hub');
const MASTER_STUDIES_PATH = path.join(PUBLIC_DIR, 'master_studies.json');
const OUTPUT_PATH = path.join(PUBLIC_DIR, 'images.json');

async function generateImageManifest() {
  try {
    console.log('Generating image manifest...');
    const data = await fs.readFile(MASTER_STUDIES_PATH, 'utf8');
    const studies = JSON.parse(data);

    const allImages = [];

    for (const study of studies) {
      if (study.images && Array.isArray(study.images)) {
        for (const img of study.images) {
          // Construct absolute path to check existence
          // img.path is relative to public, e.g., /science-hub/images/S001/S001_p3_i1.jpeg
          const absolutePath = path.join(__dirname, '..', 'public', img.path.startsWith('/') ? img.path.slice(1) : img.path);
          
          if (existsSync(absolutePath)) {
            allImages.push({
              ...img,
              studyId: study.id,
              slug: study.slug,
              studyTitle: study.title,
              studyYear: study.year,
              cluster: study.cluster
            });
          } else {
            console.warn(`Skipping missing image: ${img.path} (Study: ${study.id})`);
          }
        }
      }
    }

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allImages, null, 2));
    console.log(`Successfully generated manifest with ${allImages.length} images at ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error generating image manifest:', error);
    process.exit(1);
  }
}

generateImageManifest();
