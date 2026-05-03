module.exports = async function handler(req, res) {
  const { path, ...restParams } = req.query; 
  
  const apiKey = process.env.TMDB_KEY;

  if (!apiKey) {
    console.error("ERRO: TMDB_KEY não encontrada nas variáveis de ambiente.");
    return res.status(500).json({ error: 'Configuração de API ausente no servidor.' });
  }

  const baseUrl = 'https://api.themoviedb.org/3';
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    language: 'pt-BR',
    ...restParams
  });

  const urlFinal = `${baseUrl}${path}?${searchParams.toString()}`;

  try {
    const response = await fetch(urlFinal);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Erro interno no proxy da Vercel:", error);
    res.status(500).json({ error: 'Erro de comunicação com o TMDB' });
  }
};