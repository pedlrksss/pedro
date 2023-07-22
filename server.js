// server.js
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;


// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'pedro', // Substitua pelo nome de usuário do MySQL
  password: 'wc909010', // Substitua pela senha do MySQL
  database: 'pedro' // Substitua pelo nome do banco de dados que você criou
});

// Middleware para interpretar o corpo das solicitações como JSON
app.use(express.json());

// Rota para adicionar uma recomendação
app.post('/adicionarRecomendacao', (req, res) => {
  const { user_id, filme, tipoMidia, posterPath, id, trailerId } = req.body;

  const sql = 'INSERT INTO recomendacoes (user_id, filme, tipo_midia, poster_path, movie_id, trailer_id) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [user_id, filme, tipoMidia, posterPath, id, trailerId];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar recomendação ao banco de dados:', err);
      res.status(500).json({ error: 'Erro ao adicionar recomendação ao banco de dados.' });
    } else {
      console.log('Recomendação adicionada ao banco de dados com sucesso!');
      res.status(200).json({ message: 'Recomendação adicionada com sucesso.' });
    }
  });
});


// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}.`);
});

