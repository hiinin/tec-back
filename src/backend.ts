import express, { Request, Response } from 'express';
 import { sequelize } from './database';
 import { criarBoletoERegistrar } from '../Funções/Boleto';

 const app = express();
 const port = 3000;
 app.use(express.json());

 async function syncDatabase() {
    try {
      await sequelize.sync({ force: false }); // A opção force: false não irá apagar os dados existentes
      console.log('Banco de dados sincronizado com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar o banco de dados:', error);
    }
  }
  
  syncDatabase();

 sequelize
 .authenticate()
 .then(() => {
 console.log('Conexão com o banco de dados estabelecida com sucesso.');
 })
 .catch((err) => {
 console.error('Erro ao conectar ao banco de dados:', err);
 });


 app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    });


// Função para agendar a criação de boletos a cada 5 minutos
function agendarCriacaoDeBoletos() {
    // Definindo o intervalo de tempo (5 minutos em milissegundos)
    const intervaloDeTempo = 5 * 60 * 1000;
  
    // Chama a função de criar boleto e registrar no banco a cada 5 minutos
    setInterval(() => {
      console.log('Iniciando a criação do boleto...');
      criarBoletoERegistrar();  // Certifique-se de chamar a função correta
    }, intervaloDeTempo);
  }
  
  // Iniciar o agendamento
  agendarCriacaoDeBoletos();  