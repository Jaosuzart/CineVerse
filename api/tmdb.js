export default async function handler(req, res) {
  const { path, ...restParams } = req.query; 
  
  const apiKey = process.env.TMDB_KEY;
  const baseUrl = 'https://api.themoviedb.org/3';

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: 'pt-BR',
    ...restParams
  });

  try {
    const response = await fetch(`${baseUrl}${path}?${searchParams.toString()}`);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro de comunicação com o TMDB' });
  }
}