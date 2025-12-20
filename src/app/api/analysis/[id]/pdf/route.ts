import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow public access to analysis for PDF generation
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Parse JSON fields
    const environmentalImpact = typeof analysis.environmentalImpact === 'string' 
      ? JSON.parse(analysis.environmentalImpact || '[]') 
      : (Array.isArray(analysis.environmentalImpact) ? analysis.environmentalImpact : []);
    
    const harms = typeof analysis.harms === 'string' 
      ? JSON.parse(analysis.harms || '[]') 
      : (Array.isArray(analysis.harms) ? analysis.harms : []);
    
    const disposal = typeof analysis.disposal === 'string' 
      ? JSON.parse(analysis.disposal || '[]') 
      : (Array.isArray(analysis.disposal) ? analysis.disposal : []);
    
    const alternatives = typeof analysis.alternatives === 'string' 
      ? JSON.parse(analysis.alternatives || '[]') 
      : (Array.isArray(analysis.alternatives) ? analysis.alternatives : []);
    
    const recommendations = typeof analysis.recommendations === 'string' 
      ? JSON.parse(analysis.recommendations || '{}') 
      : (analysis.recommendations || {});

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ecoverse Analysis Report - ${analysis.label}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Montserrat', Arial, sans-serif;
      background: #0c0c0c;
      color: #ffffff;
      padding: 40px;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 40px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #ffffff;
    }
    .header p {
      color: #9ca3af;
      font-size: 14px;
    }
    .image-section {
      text-align: center;
      margin-bottom: 30px;
    }
    .image-section img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .info-item label {
      display: block;
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 15px;
      color: #ffffff;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .list-item {
      padding: 10px 0;
      padding-left: 20px;
      position: relative;
      color: #d1d5db;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    .list-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #ffffff;
      font-weight: bold;
    }
    .recommendations {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    .recommendation-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid rgba(255, 255, 255, 0.3);
    }
    .recommendation-item h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 5px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .recommendation-item p {
      font-size: 14px;
      color: #d1d5db;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .metadata {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;
      color: #9ca3af;
    }
    @media print {
      body {
        background: white;
        color: black;
      }
      .container {
        background: white;
        border: 1px solid #e5e7eb;
      }
      .section-title {
        color: #111827;
        border-bottom-color: #e5e7eb;
      }
      .list-item {
        color: #374151;
      }
      .list-item::before {
        color: #111827;
      }
      .info-item {
        background: #f9fafb;
        border-color: #e5e7eb;
      }
      .info-item label {
        color: #6b7280;
      }
      .info-item value {
        color: #111827;
      }
      .recommendation-item {
        background: #f9fafb;
        border-left-color: #d1d5db;
      }
      .recommendation-item h4 {
        color: #111827;
      }
      .recommendation-item p {
        color: #374151;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Environmental Analysis Report</h1>
      <p>Ecoverse - ${new Date().toLocaleDateString()}</p>
    </div>

    ${analysis.imageUrl ? `
    <div class="image-section">
      <img src="${analysis.imageUrl}" alt="${analysis.label}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); word-wrap: break-word; overflow-wrap: break-word;" />
    </div>
    ` : ''}

    <div class="info-grid">
      <div class="info-item">
        <label>Item</label>
        <value>${analysis.label || 'Unknown'}</value>
      </div>
      <div class="info-item">
        <label>Material Type</label>
        <value>${analysis.type || 'Unknown'}</value>
      </div>
      <div class="info-item">
        <label>Category</label>
        <value>${analysis.category || 'Uncategorized'}</value>
      </div>
      <div class="info-item">
        <label>Degradability</label>
        <value>${analysis.degradability || 'Not specified'}</value>
      </div>
    </div>

    ${environmentalImpact.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Environmental Impact</h2>
      ${environmentalImpact.map((impact: string) => `<div class="list-item">${impact}</div>`).join('')}
    </div>
    ` : ''}

    ${harms.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Health Risks</h2>
      ${harms.map((harm: string) => `<div class="list-item">${harm}</div>`).join('')}
    </div>
    ` : ''}

    ${disposal.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Disposal Instructions</h2>
      ${disposal.map((instruction: string) => `<div class="list-item">${instruction}</div>`).join('')}
    </div>
    ` : ''}

    ${alternatives.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Eco-Friendly Alternatives</h2>
      ${alternatives.map((alternative: string) => `<div class="list-item">${alternative}</div>`).join('')}
    </div>
    ` : ''}

    ${recommendations && typeof recommendations === 'object' && Object.keys(recommendations).length > 0 ? `
    <div class="section">
      <h2 class="section-title">Recommendations</h2>
      <div class="recommendations">
        ${recommendations.reduce ? `
        <div class="recommendation-item">
          <h4>Reduce</h4>
          <p>${recommendations.reduce}</p>
        </div>
        ` : ''}
        ${recommendations.reuse ? `
        <div class="recommendation-item">
          <h4>Reuse</h4>
          <p>${recommendations.reuse}</p>
        </div>
        ` : ''}
        ${recommendations.recycle ? `
        <div class="recommendation-item">
          <h4>Recycle</h4>
          <p>${recommendations.recycle}</p>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${analysis.potentialForReuse ? `
    <div class="section">
      <h2 class="section-title">Reuse Potential</h2>
      <p style="color: #d1d5db; font-size: 14px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${analysis.potentialForReuse}</p>
    </div>
    ` : ''}

    <div class="metadata">
      <div>
        <strong>Generated by:</strong> ${analysis.user?.name || analysis.user?.email || 'Anonymous'}
      </div>
      <div>
        <strong>Date:</strong> ${new Date(analysis.createdAt).toLocaleDateString()}
      </div>
    </div>

    <div class="footer">
      <p>Powered by Ecoverse - Environmental Analysis Platform</p>
      <p style="margin-top: 5px; font-size: 10px;">This report was generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Return HTML that can be printed as PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="ecoverse-analysis-${analysis.id}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

