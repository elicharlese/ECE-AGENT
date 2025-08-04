// Simple Node.js API endpoint for Vercel
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    res.status(200).json({ 
      message: 'API is working!',
      path: req.url,
      method: req.method
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
