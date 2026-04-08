import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  const results: { name: string; content: string; type: string }[] = [];

  for (const file of files) {
    const text = await file.text();
    // Truncate large files to avoid token overflow
    const truncated = text.length > 80000 ? text.slice(0, 80000) + '\n\n[...truncated]' : text;
    results.push({ name: file.name, content: truncated, type: file.type });
  }

  const summary = results.map(f =>
    `### File: ${f.name}\n\`\`\`\n${f.content}\n\`\`\``
  ).join('\n\n');

  return Response.json({ summary, files: results });
}
