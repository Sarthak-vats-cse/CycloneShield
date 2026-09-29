import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY missing in environment variables' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Forces Gemini to respond strictly in clean JSON format
          generationConfig: {
            responseMimeType: 'application/json',
          },
          contents: [
            {
              parts: [
                {
                  text: `Analyze this cyclone telemetry and generate structured mitigation actions as JSON matching this schema: 
                  advisories: Array<{ id: string, sector: string, action: string, risk_level: 'CRITICAL'|'HIGH'|'MODERATE'|'LOW' }>.
                  
                  Data: ${JSON.stringify(payload)}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Gemini API call failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to query Gemini API' }, { status: 500 });
  }
}
