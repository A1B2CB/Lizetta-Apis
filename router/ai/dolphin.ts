import { Request, Response } from 'express';
import axios from 'axios';

export default async function handler(req: Request, res: Response) {
  const { text, template = 'logical' } = req.query;

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' wajib diisi."
    });
  }

  try {
    const { data } = await axios.post('https://chat.dphn.ai/api/chat', {
      messages: [{ role: 'user', content: String(text) }],
      model: 'dolphinserver:24B',
      template: template
    }, {
      headers: {
        'Origin': 'https://chat.dphn.ai',
        'Referer': 'https://chat.dphn.ai/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
      }
    });

    const result = data
      .split('\n\n')
      .filter((line: string) => line.startsWith('data: {'))
      .map((line: string) => {
        try {
          const raw = line.replace('data: ', '').trim();
          const json = JSON.parse(raw);
          return json.choices[0]?.delta?.content || '';
        } catch {
          return '';
        }
      })
      .join('');

    if (!result) throw new Error('No response');

    res.json({
      status: true,
      creator: "Taiga",
      result: result.trim()
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message || "Gagal memproses permintaan."
    });
  }
}
