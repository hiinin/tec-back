import express, { Request, Response } from 'express';
import { sequelize } from './database';
import { criarBoletosParaTodosOsBancos } from '../Funções/Boleto';
import { Registro } from '../models/Registros'; // Verifique a importação do modelo

const app = express();
const port = 3000;
app.use(express.json());

async function syncDatabase() {
  try {
    // Sincronizando os modelos com o banco de dados
    await sequelize.sync({ force: true }); // force: false não apaga dados existentes
    console.log('Banco de dados sincronizado com sucesso!');
    // Depois de sincronizar o banco, agendar a criação de boletos
    agendarCriacaoDeBoletos();
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    syncDatabase();
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

// Função para agendar a criação de boletos a cada 5 minutos
function agendarCriacaoDeBoletos() {
  const intervaloDeTempo = 5 * 60 * 1000; // 5 minutos em milissegundos

  setInterval(() => {
    console.log('Iniciando a criação do boleto...');
    criarBoletosParaTodosOsBancos();
  }, intervaloDeTempo);
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
