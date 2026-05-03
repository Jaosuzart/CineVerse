# 🎬 CineVerse – Filmes & Séries

Projeto de estudo desenvolvido com **jQuery**, **Axios** e **AJAX** consumindo a API pública **TMDB** (The Movie Database).

---

## 🚀 Como rodar

1. Clone/copie os arquivos para sua pasta do servidor local (ex: `c:/wamp64/www/Recursos_js_ajax/Projeto-Ajax/`)
2. **Obtenha uma chave gratuita da TMDB:**
   - Crie uma conta em → https://www.themoviedb.org/
   - Vá em **Conta → Configurações → API → Solicitar API Key**
   - Copie sua `API Key (v3 auth)`
3. Abra o arquivo `js/api.js` e substitua a linha:
   ```js
   const TMDB_KEY = '0b1a2c3d4e5f67890a1b2c3d4e5f6789';
   ```
   pela sua chave real.
4. Acesse via servidor local: `http://localhost/Recursos_js_ajax/Projeto-Ajax/`

> ⚠️ **Não abra o arquivo diretamente pelo sistema de arquivos** (`file://`), pois o navegador pode bloquear requisições CORS. Use sempre um servidor HTTP (WAMP, XAMPP, Live Server, etc.)

---

## 📂 Estrutura de arquivos

```
Projeto-Ajax/
│
├── index.html        # Estrutura semântica com Bootstrap 5
│
└── js/
    ├── api.js        # Camada de API – Axios + jQuery.ajax()
    ├── ui.js         # Renderização – jQuery DOM manipulation
    └── app.js        # Controlador – estado, eventos, orquestração
```

---

## 🛠️ Tecnologias usadas

| Tecnologia | Uso no projeto |
|---|---|
| **Bootstrap 5** | Layout, componentes, modal, badges, paginação |
| **Bootstrap Icons** | Ícones sem necessidade de Font Awesome |
| **jQuery 3.7** | Manipulação DOM, eventos, `.ajax()`, `.Deferred()` |
| **Axios 1.6** | Requisições HTTP com `axios.create()`, `axios.all()`, interceptors |
| **TMDB API** | Dados de filmes, séries, elenco, trailers |

---

## 📚 Conceitos jQuery & Axios demonstrados

### jQuery
- `$(document).ready()` – inicialização segura
- Seleção e manipulação com `$()`, `.html()`, `.text()`, `.append()`
- Eventos: `.on()`, `.trigger()`, event delegation
- AJAX nativo: `$.ajax()` retornando `jQuery.Deferred()`
- Animações: `.fadeIn()`, `.fadeOut()`, `.animate()`
- Dados no DOM: `.data()`
- Iteração: `$.each()`

### Axios
- `axios.create()` – instância pré-configurada
- `interceptors.response` – tratamento centralizado de erros
- `axios.all()` / `axios.spread()` – chamadas paralelas
- `.then()` / `.catch()` – tratamento de Promise
- Parâmetros globais com `params` no `create()`

---

## ✨ Funcionalidades

- [x] Listagem de filmes populares
- [x] Listagem de séries populares
- [x] Trending da semana (filmes + séries)
- [x] Hero banner rotativo com auto-slide
- [x] Busca por título (filmes + séries simultâneos)
- [x] Filtro por gênero
- [x] Ordenação (popularidade, nota, data, bilheteria)
- [x] Modal de detalhes com elenco, trailers e similares
- [x] Paginação
- [x] Watchlist com `localStorage`
- [x] Skeleton loading
- [x] Toast de notificações
- [x] HTML 100% semântico (`header`, `main`, `section`, `article`, `nav`, `footer`, `figure`, `figcaption`)
