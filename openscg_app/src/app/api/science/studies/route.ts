import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'science-hub', 'index.json');
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error serving science research index:', error);
    return NextResponse.json({ error: 'Failed to load research data' }, { status: 500 });
  }
}
