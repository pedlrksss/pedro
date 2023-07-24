document.getElementById('btnGerarFilmeAleatorio').addEventListener('click', gerarFilmeAleatorio);
// Função para obter o poster do filme ou série usando a API do TMDb
async function obterDadosMidia(tipoMidia, nomeMidia) {
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb
var baseUrl = 'https://api.themoviedb.org/3/search/';
var queryUrl = `${baseUrl}${tipoMidia}?api_key=${apiKey}&query=${encodeURIComponent(nomeMidia)}&language=pt-BR`;

// Faz a chamada para obter os dados do filme em português (pt-BR)
fetch(queryUrl)
  .then(response => response.json())
  .then(data => {
    // Processar os dados em português (pt-BR) aqui
    console.log(data);
  })

  try {
    var response = await fetch(queryUrl);
    var data = await response.json();
    if (data.results && data.results.length > 0) {
      return {
        id: data.results[0].id,
        posterPath: data.results[0].poster_path
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter informações do filme ou série:', error);
    return null;
  }
}

async function obterTrailer(tipoMidia, id) {
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb
  var baseUrl = `https://api.themoviedb.org/3/${tipoMidia}/${id}/videos?api_key=${apiKey}`;

  try {
    var response = await fetch(baseUrl);
    var data = await response.json();
    if (data.results && data.results.length > 0) {
      // Retornar o ID do vídeo do YouTube (ou de outra plataforma) do primeiro trailer disponível
      return data.results[0].key;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter informações do trailer:', error);
    return null;
  }
}

async function gerarFilmeAleatorio() {
  var tipoMidia = document.getElementById('tipoMidia').value; // Obtém o tipo de mídia selecionado (filme ou série)
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb
  
  try {
    // Obtenha o gênero selecionado pelo usuário
    var generoFilme = document.getElementById('generoFilme').value;
    var ano = document.getElementById('ano').value.trim(); // Obtém o ano ou intervalo de anos selecionado

    // Defina um valor aleatório para a página (máximo de 1000 páginas para evitar possíveis problemas com limites da API)
    var paginaAleatoria = Math.floor(Math.random() * 1000) + 1;

    // Crie a URL com o gênero selecionado
    var baseUrl = 'https://api.themoviedb.org/3/discover/';
    var queryUrl = `${baseUrl}${tipoMidia}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${paginaAleatoria}&with_genres=${generoFilme}`;
    // Verifica se foi inserido um ano ou intervalo de anos
    if (ano) {
      // Verifica se foi inserido um intervalo de anos
      if (ano.includes('-')) {
        var intervaloAnos = ano.split('-');
        var anoInicial = intervaloAnos[0];
        var anoFinal = intervaloAnos[1];
        queryUrl += `&release_date.gte=${anoInicial}-01-01&release_date.lte=${anoFinal}-12-31`;
      } else {
        // Caso tenha sido inserido apenas um ano
        queryUrl += `&primary_release_year=${ano}`;
      }
    }

    // Faz uma chamada para obter uma lista aleatória de filmes ou séries, usando a página aleatória, o gênero selecionado e o ano ou intervalo de anos
    var response = await fetch(queryUrl);
    var data = await response.json();
    

    if (data.results && data.results.length > 0) {
    // Escolhe aleatoriamente um filme ou série da lista
    var filmeAleatorio = data.results[Math.floor(Math.random() * data.results.length)];

    // Obter o ID, o poster e a sinopse do filme ou série aleatória
    var { id, poster_path: posterPath, overview: sinopse } = filmeAleatorio; // Verifique se a API do TMDb retorna a sinopse com o nome 'overview'.

    // Verificar se o filme ou série já está na lista de recomendações
    var recomendacoes = localStorage.getItem('recomendacoes');
    recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

      if (recomendacoes.some(item => item.id === id)) {
        console.log('Filme ou série já adicionado à lista de recomendações. Tentando novamente...');
        gerarFilmeAleatorio(); // Tentar gerar outro filme ou série aleatória
        return;
      }

      // Obter o ID do trailer do filme ou série aleatória
      var trailerId = await obterTrailer(tipoMidia, id);

      // Salvando a recomendação no armazenamento local, incluindo o ID e o trailer
    recomendacoes.push({ filme: filmeAleatorio.title, posterUrl: posterPath, tipoMidia, id, trailerId, sinopse });
      localStorage.setItem('recomendacoes', JSON.stringify(recomendacoes));

      // Atualizar a lista de recomendações
      mostrarRecomendacoes();
    } else {
      console.log('Nenhum filme ou série encontrado. Tentando novamente...');
      gerarFilmeAleatorio(); // Tentar gerar outro filme ou série aleatória
    }
  } catch (error) {
    console.error('Erro ao obter filme ou série aleatória:', error);
  }
}


// Função para obter uma série aleatória
async function gerarSerieAleatoria() {
  var tipoMidia = 'tv'; // Especificando 'tv' para série
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb

  try {
    // Obtenha o gênero selecionado pelo usuário
    var generoSerie = obterGeneroFilme(); // Usando a função para obter o gênero selecionado
    var ano = document.getElementById('ano').value.trim(); // Obtém o ano ou intervalo de anos selecionado


    // Defina um valor aleatório para a página (máximo de 1000 páginas para evitar possíveis problemas com limites da API)
    var paginaAleatoria = Math.floor(Math.random() * 1000) + 1;

    // Crie a URL com o gênero selecionado
    var baseUrl = 'https://api.themoviedb.org/3/discover/';
    var queryUrl = `${baseUrl}${tipoMidia}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${paginaAleatoria}&with_genres=${generoSerie}`;
    // Verifica se foi inserido um ano ou intervalo de anos
    if (ano) {
      // Verifica se foi inserido um intervalo de anos
      if (ano.includes('-')) {
        var intervaloAnos = ano.split('-');
        var anoInicial = intervaloAnos[0];
        var anoFinal = intervaloAnos[1];
        queryUrl += `&first_air_date.gte=${anoInicial}-01-01&first_air_date.lte=${anoFinal}-12-31`;
      } else {
        // Caso tenha sido inserido apenas um ano
        queryUrl += `&first_air_date_year=${ano}`;
      }
    }
     // Faz uma chamada para obter uma lista aleatória de séries, usando a página aleatória, o gênero selecionado e o ano ou intervalo de anos
    var response = await fetch(queryUrl);
    var data = await response.json();

    if (data.results && data.results.length > 0) {
      // Escolhe aleatoriamente uma série da lista
      var serieAleatoria = data.results[Math.floor(Math.random() * data.results.length)];

      // Obter o ID e o poster da série aleatória
      var { id, poster_path: posterPath } = serieAleatoria;

      // Verificar se a série já está na lista de recomendações
      var recomendacoes = localStorage.getItem('recomendacoes');
      recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

      if (recomendacoes.some(item => item.id === id)) {
        console.log('Série já adicionada à lista de recomendações. Tentando novamente...');
        gerarSerieAleatoria(); // Tentar gerar outra série aleatória
        return;
      }

      // Obter o ID do trailer da série aleatória
      var trailerId = await obterTrailer(tipoMidia, id);

      // Salvando a recomendação no armazenamento local, incluindo o ID e o trailer
      recomendacoes.push({ filme: serieAleatoria.name, posterUrl: posterPath, tipoMidia, id, trailerId });
      localStorage.setItem('recomendacoes', JSON.stringify(recomendacoes));

      // Atualizar a lista de recomendações
      mostrarRecomendacoes();
    } else {
      console.log('Nenhuma série encontrada. Tentando novamente...');
      gerarSerieAleatoria(); // Tentar gerar outra série aleatória
    }
  } catch (error) {
    console.error('Erro ao obter série aleatória:', error);
  }
}


// Adicione os eventos de clique nos botões
document.getElementById('btnTendenciaHoje').addEventListener('click', mostrarTendenciaHoje);
document.getElementById('btnTendenciaSemana').addEventListener('click', mostrarTendenciaSemana);

// Função para exibir filmes em tendência de hoje
async function mostrarTendenciaHoje() {
  var tipoMidia = 'movie'; // Especificando 'movie' para filmes
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb

  try {
    // Crie a URL para buscar os filmes em tendência de hoje
    var baseUrl = 'https://api.themoviedb.org/3/trending/';
    var queryUrl = `${baseUrl}${tipoMidia}/day?api_key=${apiKey}&language=en-US`;

    // Faz uma chamada para obter uma lista de filmes em tendência de hoje
    var response = await fetch(queryUrl);
    var data = await response.json();

    // Atualizar a lista de recomendações com os filmes em tendência de hoje
    atualizarListaRecomendacoes(data.results);
  } catch (error) {
    console.error('Erro ao obter filmes em tendência de hoje:', error);
  }
}

// Função para exibir filmes em tendência da semana
async function mostrarTendenciaSemana() {
  var tipoMidia = 'movie'; // Especificando 'movie' para filmes
  var apiKey = '2040040352cfe52696ade7e1f96634fa'; // Substitua pela sua chave de API do TMDb

  try {
    // Crie a URL para buscar os filmes em tendência da semana
    var baseUrl = 'https://api.themoviedb.org/3/trending/';
    var queryUrl = `${baseUrl}${tipoMidia}/week?api_key=${apiKey}&language=en-US`;

    // Faz uma chamada para obter uma lista de filmes em tendência da semana
    var response = await fetch(queryUrl);
    var data = await response.json();

    // Atualizar a lista de recomendações com os filmes em tendência da semana
    atualizarListaRecomendacoes(data.results);
  } catch (error) {
    console.error('Erro ao obter filmes em tendência da semana:', error);
  }
}

// Função para atualizar a lista de recomendações na tela
function atualizarListaRecomendacoes(recomendacoes) {
  var listaRecomendacoes = document.getElementById('recomendacoes');
  listaRecomendacoes.innerHTML = '';

  var moviesGrid = document.createElement('div');
  moviesGrid.classList.add('movies-grid');

  recomendacoes.forEach(function (item) {
    var filme = item.title;
    var tipoMidia = 'movie';

    var movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');

    // Exibe "Movie" em azul para filmes e "TV" em verde para séries
    var movieType = document.createElement('p');
    movieType.textContent = tipoMidia === 'movie' ? 'Filme' : 'Serie';
    movieType.classList.add('movie-type', tipoMidia);
    movieItem.appendChild(movieType);
    if (item.poster_path) {
      var img = document.createElement('img');
      img.src = 'https://image.tmdb.org/t/p/w185' + item.poster_path;
      img.alt = filme;
      img.classList.add('movie-poster');
      movieItem.appendChild(img);
    }
    var serieName = document.createElement('p');
    serieName.textContent = filme;
    serieName.classList.add('serie-name'); // Adicionando a classe .serie-name
    movieItem.appendChild(serieName);

    var btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'X';
    btnExcluir.classList.add('excluir-button');
    btnExcluir.onclick = function () {
      excluirRecomendacao(index);
    };

    var shareButton = document.createElement('i');
    shareButton.classList.add('fa', 'fa-share-alt'); // Adicione a classe de ícone que preferir (por exemplo, font-awesome)
    shareButton.onclick = function () {
      compartilharRecomendacao(item);
    };

    var btnVerTrailer = document.createElement('button');
    btnVerTrailer.textContent = 'Ver Trailer';
    btnVerTrailer.classList.add('ver-trailer-button');
    btnVerTrailer.onclick = function () {
      exibirTrailer(item);
    };

    // Adicionar o botão "Ver Trailer" antes do botão de exclusão
    movieItem.appendChild(btnVerTrailer);
    
    movieItem.appendChild(shareButton);
    movieItem.appendChild(btnExcluir);
    moviesGrid.appendChild(movieItem);
  });

  listaRecomendacoes.appendChild(moviesGrid);
}

// Função para obter o gênero selecionado pelo usuário
function obterGeneroFilme() {
  var generoFilme = document.getElementById('generoFilme').value;
  return generoFilme;
}

function fazerLogin() {
  var usernameInput = document.getElementById('username');
  var username = usernameInput.value.trim();

  // Verificar se o nome de usuário não está vazio
  if (!username) {
    alert('Digite um nome de usuário válido.');
    return;
  }

  // Salvar o nome de usuário no armazenamento local
  localStorage.setItem('username', username);
  localStorage.setItem('isLoggedIn', 'true');

  // Limpar o formulário de login
  usernameInput.value = '';

  // Esconder o formulário de login e exibir as recomendações
  document.getElementById('loginForm').style.display = 'none';
  mostrarRecomendacoes();

  // Atualizar o texto da classe "logo" com o nome de usuário
  document.getElementById('logo').textContent = 'Usuário: ' + username;
}

function ordenarRecomendacoes() {
  var recomendacoes = localStorage.getItem('recomendacoes');
  recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

  // Separar as recomendações em dois arrays: filmes e séries
  var filmes = [];
  var series = [];
  recomendacoes.forEach(function (item) {
    if (item.tipoMidia === 'movie') {
      filmes.push(item);
    } else if (item.tipoMidia === 'tv') {
      series.push(item);
    }
  });

  // Ordenar os filmes e as séries por ordem alfabética do título
  filmes.sort((a, b) => {
    var tituloA = a.filme.toUpperCase();
    var tituloB = b.filme.toUpperCase();
    if (tituloA < tituloB) return -1;
    if (tituloA > tituloB) return 1;
    return 0;
  });

  series.sort((a, b) => {
    var tituloA = a.filme.toUpperCase();
    var tituloB = b.filme.toUpperCase();
    if (tituloA < tituloB) return -1;
    if (tituloA > tituloB) return 1;
    return 0;
  });

  // Mesclar os arrays ordenados novamente em uma única lista
  var recomendacoesOrdenadas = [...filmes, ...series];

  // Salvar a lista ordenada de recomendações no armazenamento local
  localStorage.setItem('recomendacoes', JSON.stringify(recomendacoesOrdenadas));

  // Atualizar a lista de recomendações na tela
  mostrarRecomendacoes();
}

// Função para adicionar uma recomendação de filme ou série
async function adicionarRecomendacao() {
  var filmeInput = document.getElementById('movieInput');
  var filme = filmeInput.value.trim();
  if (filme === '') {
    alert('Digite o nome do filme ou série antes de recomendar.');
    return;
  }

  // Especificamos o tipo de mídia como 'movie' para filmes e 'tv' para séries
  var tipoMidia = document.getElementById('tipoMidia').value;

  // Obter o ID e o poster do filme ou série
  var { id, posterPath } = await obterDadosMidia(tipoMidia, filme);

  // Obter o ID do trailer do filme ou série
  var trailerId = await obterTrailer(tipoMidia, id);

  // Salvando a recomendação no armazenamento local, incluindo o ID e o trailer
  var recomendacoes = localStorage.getItem('recomendacoes');
  recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];
  recomendacoes.push({ filme, posterUrl: posterPath, tipoMidia, id, trailerId });
  localStorage.setItem('recomendacoes', JSON.stringify(recomendacoes));

  // Limpar campo de entrada e atualizar a lista de recomendações
  filmeInput.value = '';
  mostrarRecomendacoes();
}

function exibirTrailer(item) {
  var trailerContainer = document.createElement('div');
  trailerContainer.classList.add('trailer-container');

  var trailerIframe = document.createElement('iframe');
  trailerIframe.src = `https://www.youtube.com/embed/${item.trailerId}`;
  trailerIframe.allowFullscreen = true;
  trailerIframe.classList.add('trailer-iframe');

  var btnFechar = document.createElement('button');
  btnFechar.textContent = 'Fechar Trailer';
  btnFechar.classList.add('fechar-trailer-button');
  btnFechar.onclick = function () {
    trailerContainer.remove();
  };

  trailerContainer.appendChild(trailerIframe);
  trailerContainer.appendChild(btnFechar);

  document.body.appendChild(trailerContainer);
}

// Função para exibir as recomendações de filmes e séries
function mostrarRecomendacoes() {
    var isLoggedIn = localStorage.getItem('isLoggedIn');

  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Usuário não autenticado, mostrar formulário de login
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('recomendacoes').innerHTML = ''; // Limpar a lista de recomendações
    return;
  }

  var recomendacoes = localStorage.getItem('recomendacoes');
  recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

  var listaRecomendacoes = document.getElementById('recomendacoes');
  listaRecomendacoes.innerHTML = '';

  var moviesGrid = document.createElement('div');
  moviesGrid.classList.add('movies-grid');

  recomendacoes.forEach(function (item, index) {
    var filme = item.filme;
    var tipoMidia = item.tipoMidia;

    var movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');

    // Exibe "Movie" em azul para filmes e "TV" em verde para séries
    var movieType = document.createElement('p');
    movieType.textContent = tipoMidia === 'movie' ? 'Filme' : 'Serie';
    movieType.classList.add('movie-type', tipoMidia);
    movieItem.appendChild(movieType);
    if (item.posterUrl) {
      var img = document.createElement('img');
      img.src = 'https://image.tmdb.org/t/p/w185' + item.posterUrl;
      img.alt = filme;
      img.classList.add('movie-poster');
      movieItem.appendChild(img);
    }
    var serieName = document.createElement('p');
    serieName.textContent = filme;
    serieName.classList.add('serie-name'); // Adicionando a classe .serie-name
    movieItem.appendChild(serieName);

    var btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'X';
    btnExcluir.classList.add('excluir-button');
    btnExcluir.onclick = function () {
      excluirRecomendacao(index);
    };

    var shareButton = document.createElement('i');
    shareButton.classList.add('fa', 'fa-share-alt'); // Adicione a classe de ícone que preferir (por exemplo, font-awesome)
    shareButton.onclick = function () {
      compartilharRecomendacao(item);
    };

    var btnVerTrailer = document.createElement('button');
    btnVerTrailer.textContent = 'Ver Trailer';
    btnVerTrailer.classList.add('ver-trailer-button');
    btnVerTrailer.onclick = function () {
      exibirTrailer(item);
    };
    
    var btnSinopse = document.createElement('button');
    btnSinopse.textContent = 'Sinopse';
    btnSinopse.classList.add('sinopse-button');
    btnSinopse.onclick = function () {
      exibirSinopse(item);
    };

    movieItem.appendChild(btnSinopse);
    movieItem.appendChild(btnExcluir);
    moviesGrid.appendChild(movieItem);
    // Adicionar o botão "Ver Trailer" antes do botão de exclusão
    movieItem.appendChild(btnVerTrailer);
    
    movieItem.appendChild(shareButton);
    movieItem.appendChild(btnExcluir);
    moviesGrid.appendChild(movieItem);
  });

  listaRecomendacoes.appendChild(moviesGrid);
}

function ordenarRecomendacoes() {
  var recomendacoes = localStorage.getItem('recomendacoes');
  recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

  // Ordenar a lista de recomendações por ordem alfabética do título (filme ou série)
  recomendacoes.sort((a, b) => {
    var tituloA = a.filme.toUpperCase();
    var tituloB = b.filme.toUpperCase();
    if (tituloA < tituloB) return -1;
    if (tituloA > tituloB) return 1;
    return 0;
  });

  // Salvar a lista ordenada de recomendações no armazenamento local
  localStorage.setItem('recomendacoes', JSON.stringify(recomendacoes));

  // Atualizar a lista de recomendações na tela
  mostrarRecomendacoes();
}



// Função para excluir uma recomendação
function excluirRecomendacao(index) {
  var recomendacoes = localStorage.getItem('recomendacoes');
  recomendacoes = recomendacoes ? JSON.parse(recomendacoes) : [];

  if (index >= 0 && index < recomendacoes.length) {
    recomendacoes.splice(index, 1);
    localStorage.setItem('recomendacoes', JSON.stringify(recomendacoes));
    mostrarRecomendacoes(); // Adicione esta linha para atualizar a lista após a exclusão
  }
}

// Função para exibir a sinopse do filme ou série
function exibirSinopse(item) {
  var sinopseContainer = document.createElement('div');
  sinopseContainer.classList.add('sinopse-container');

  var sinopseText = document.createElement('p');
  sinopseText.textContent = item.sinopse; // Supondo que a sinopse esteja no objeto 'item', verifique se os dados possuem a propriedade 'sinopse' corretamente.
  sinopseText.classList.add('sinopse-text');

  var btnFechar = document.createElement('button');
  btnFechar.textContent = 'Fechar Sinopse';
  btnFechar.classList.add('fechar-sinopse-button');
  btnFechar.onclick = function () {
    sinopseContainer.remove();
  };

  sinopseContainer.appendChild(sinopseText);
  sinopseContainer.appendChild(btnFechar);

  document.body.appendChild(sinopseContainer);
}
// Rota para adicionar uma recomendação
app.post('/adicionarRecomendacao', (req, res) => {
  const recomendacao = req.body;

  // Aqui você deve implementar o código para inserir a recomendação no banco de dados
  // Por exemplo:
  connection.query('INSERT INTO recomendacoes SET ?', recomendacao, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar recomendação:', err);
      res.status(500).json({ message: 'Erro ao adicionar recomendação' });
    } else {
      console.log('Recomendação adicionada com sucesso!');
      res.status(200).json({ message: 'Recomendação adicionada com sucesso!' });
    }
  });
});

// Rota para obter as recomendações do banco de dados
app.get('/obterRecomendacoes', (req, res) => {
  // Aqui você deve implementar o código para buscar as recomendações do banco de dados
  // Por exemplo:
  connection.query('SELECT * FROM recomendacoes', (err, rows) => {
    if (err) {
      console.error('Erro ao obter recomendações:', err);
      res.status(500).json({ message: 'Erro ao obter recomendações' });
    } else {
      console.log('Recomendações obtidas com sucesso!');
      res.status(200).json(rows);
    }
  });
});


// Chamando a função para mostrar as recomendações existentes ao carregar a página
mostrarRecomendacoes();
