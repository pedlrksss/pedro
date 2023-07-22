// client.js
// Importar o módulo Axios para fazer solicitações HTTP
const axios = require('axios');

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

  // Limpar o formulário de login e mostrar recomendações
  usernameInput.value = '';
  mostrarRecomendacoes();
}

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

  // Criar o objeto com os dados da recomendação
  var recomendacao = {
    user_id: localStorage.getItem('username'),
    filme: filme,
    tipoMidia: tipoMidia,
    posterPath: posterPath,
    id: id,
    trailerId: trailerId
  };

  // Enviar os dados da recomendação para o servidor usando o módulo Axios
  axios.post('/adicionarRecomendacao', recomendacao)
    .then(response => {
      console.log(response.data.message);
      // Limpar campo de entrada e atualizar a lista de recomendações
      filmeInput.value = '';
      mostrarRecomendacoesDoServidor();
    })
    .catch(error => {
      console.error('Erro ao enviar recomendação para o servidor:', error);
    });
}


function mostrarRecomendacoesDoServidor() {
  fetch('/obterRecomendacoes') // Substitua '/obterRecomendacoes' pela rota correta do servidor para obter as recomendações
    .then(response => response.json())
    .then(data => {
      // Limpar a lista de recomendações
      var listaRecomendacoes = document.getElementById('recomendacoes');
      listaRecomendacoes.innerHTML = '';

      var moviesGrid = document.createElement('div');
      moviesGrid.classList.add('movies-grid');

      data.forEach(function (item, index) {
        var filme = item.filme;
        var tipoMidia = item.tipoMidia;

        var movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        // Exibe "Movie" em azul para filmes e "TV" em verde para séries
        var movieType = document.createElement('p');
        movieType.textContent = tipoMidia === 'movie' ? 'Filme' : 'Serie';
        movieType.classList.add('movie-type', tipoMidia);
        movieItem.appendChild(movieType);

        if (item.posterPath) {
          var img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w185' + item.posterPath;
          img.alt = filme;
          img.classList.add('movie-poster');
          movieItem.appendChild(img);
        }

        if (item.trailerId) {
          var trailerIframe = document.createElement('iframe');
          trailerIframe.src = `https://www.youtube.com/embed/${item.trailerId}`;
          trailerIframe.allowFullscreen = true;
          trailerIframe.classList.add('trailer-iframe');
          movieItem.appendChild(trailerIframe);
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

        movieItem.appendChild(shareButton);
        movieItem.appendChild(btnExcluir);
        moviesGrid.appendChild(movieItem);
      });

      listaRecomendacoes.appendChild(moviesGrid);
    })
    .catch(error => {
      console.error('Erro ao obter recomendações do servidor:', error);
    });
}
// Chamar a função mostrarRecomendacoesDoServidor() assim que a página for carregada
document.addEventListener('DOMContentLoaded', function () {
  mostrarRecomendacoesDoServidor();
});

