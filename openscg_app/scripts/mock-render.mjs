import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'renders');

async function mockRender() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:italic,wght@700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .drop-cap::first-letter {
            float: left;
            font-size: 5rem;
            line-height: 1;
            font-weight: 900;
            margin-right: 0.75rem;
            color: #0f172a;
        }
        .grid-bg {
            background-image: radial-gradient(#000 1px, transparent 1px);
            background-size: 24px 24px;
        }
    </style>
</head>
<body class="bg-slate-50/50 min-h-screen pb-24">
    <!-- Study Header -->
    <div class="bg-white border-b border-slate-200 relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none grid-bg"></div>
        <div class="container mx-auto px-4 py-12 relative max-w-6xl">
            <div class="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-10">
                Back to Evidence Hub
            </div>
            
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div class="max-w-4xl">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-lg">
                            Case Study S017
                        </div>
                        <div class="h-px w-8 bg-slate-200"></div>
                        <span class="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">1992 Release</span>
                    </div>
                    
                    <h1 class="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95]">
                        Salerno 1992: Exercise SCG for CAD detection
                    </h1>
                    
                    <div class="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span class="text-lg italic font-serif">Salerno DM, Zanetti J. et al.</span>
                        </div>
                    </div>
                </div>
                
                <div class="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl uppercase tracking-widest text-xs">
                    Access Original Paper
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-6xl">
        <div class="grid lg:grid-cols-12 gap-12">
            <div class="lg:col-span-8">
                <div class="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-full bg-blue-600/5"></div>
                    
                    <article class="prose prose-slate max-w-none">
                        <h2 class="text-3xl font-black tracking-tighter text-slate-900 mt-0 mb-8 pb-6 border-b-2 border-slate-50">Quick Conclusion</h2>
                        <blockquote class="border-l-4 border-blue-600 bg-slate-50 p-8 rounded-3xl not-italic font-black text-slate-900 text-xl mb-12">
                            S017 is a landmark historical validation. It provides the empirical proof that mechanical heart vibrations are more sensitive indicators of reduced blood flow (ischemia) than electrical changes.
                        </blockquote>

                        <h3 class="text-xl text-blue-600 uppercase tracking-[0.1em] font-black mb-6">Key Accuracy Metrics</h3>
                        <div class="overflow-hidden rounded-3xl border border-slate-100 shadow-xl mb-12">
                            <table class="w-full text-left border-collapse m-0">
                                <thead>
                                    <tr class="bg-slate-900">
                                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-white">Metric</th>
                                        <th class="p-6 text-[10px] font-black uppercase tracking-widest text-white">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="p-6 border-b border-slate-50 font-bold text-slate-900">SCG Accuracy Boost</td>
                                        <td class="p-6 border-b border-slate-50 font-black text-blue-600">+16 pp over ECG</td>
                                    </tr>
                                    <tr>
                                        <td class="p-6 font-bold text-slate-900">Sensitivity</td>
                                        <td class="p-6 font-black text-blue-600">Significant improvement</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p class="drop-cap text-slate-600 leading-relaxed font-medium text-lg mb-8">
                            The study supports the use of exercise-based SCG to significantly improve the detection of coronary artery disease compared to traditional ECG treadmill tests. It proves that SCG can catch cases of ischemia that the electrical signal (ECG) might miss, providing a 16% boost in overall diagnostic accuracy. This was achieved by monitoring the mechanical vibrations of the heart during stress, which often precede electrical abnormalities.
                        </p>

                        <div class="block my-12 group">
                            <div class="relative block overflow-hidden rounded-[2rem] shadow-2xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center text-slate-300 font-black text-4xl uppercase tracking-widest">
                                [ STUDY FIGURE PLACEHOLDER ]
                            </div>
                            <div class="block mt-4 text-center text-sm font-bold italic text-slate-400 px-8">
                                Figure 1: Comparative analysis of mechanical vs electrical responses during graded exercise.
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            <div class="lg:col-span-4">
                <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-12">
                    <div class="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
                        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            (i)
                        </div>
                        <div>
                            <h3 class="text-sm font-black uppercase tracking-[0.2em]">Study Snapshot</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Summary</p>
                        </div>
                    </div>

                    <div class="space-y-10">
                        <div class="flex gap-5">
                            <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 text-blue-600 font-black text-lg">N</div>
                            <div>
                                <h4 class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Sample Size</h4>
                                <p class="text-2xl text-white font-black tracking-tighter">129 <span class="text-xs uppercase text-slate-500 ml-1">Subjects</span></p>
                            </div>
                        </div>
                        
                        <div class="flex gap-5 text-emerald-400">
                             <div>
                                <h4 class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Confidence</h4>
                                <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest bg-blue-600 text-white shadow-lg">SUPPORTING</span>
                            </div>
                        </div>

                        <div class="pt-10 border-t border-white/10 mt-10">
                           <p class="text-slate-400 font-medium leading-relaxed italic text-sm border-l-2 border-blue-600 pl-4">
                            "Validated the potential of mechanical heart vibrations as a more sensitive indicator of ischemia."
                           </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  try {
    if (!await fs.access(OUTPUT_DIR).catch(() => false)) {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
    }

    console.log(`Launching browser for mock render...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const outputPath = path.join(OUTPUT_DIR, `mock_professional_render.png`);
    await page.screenshot({ path: outputPath, fullPage: true });

    console.log(`Rendered professional layout mock to ${outputPath}`);
    await browser.close();
  } catch (error) {
    console.error('Error during mock rendering:', error);
  }
}

mockRender();
