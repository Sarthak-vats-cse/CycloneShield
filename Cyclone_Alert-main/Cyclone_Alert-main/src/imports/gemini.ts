export async function getGeminiAdvisory(cyclonePayload: Record<string, any>) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cyclonePayload),
  });

  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  return res.json();
}
