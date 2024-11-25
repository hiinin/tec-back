import express, { Request, Response } from 'express';
import { sequelize } from '../backend/database';
import cors from 'cors';  // Importe o CORS
import { criarBoletosParaTodosOsBancos } from '../../Funções/Boleto';
import { Registro } from '../../models/Registros';

const app = express();
const port = 5000;

// Ativando o CORS
app.use(cors());  // Permite todas as origens (opção mais simples)

// Ou se você quiser restringir a origens específicas, use algo como:
app.use(cors({
  origin: 'http://localhost:3000',  // URL do seu frontend React
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rota para listar todos os registros
app.get('/registros', async (req: Request, res: Response) => {
  try {
    const registros = await Registro.findAll();
    res.json(registros); // Retorna os registros em formato JSON
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ message: 'Erro ao buscar registros.' });
  }
});

app.use(express.json());

// Rota para listar registros de um banco específico
app.get('/registros/:nomeBanco', async (req: Request, res: Response) => {
  try {
    const { nomeBanco } = req.params;

    const registros = await Registro.findAll({
      where: { nome_banco: nomeBanco },
    });

    if (registros.length === 0) {
      res.status(404).json({
        message: `Nenhum registro encontrado para o banco: ${nomeBanco}`,
      });
      return;
    }

    res.json(registros);
  } catch (error) {
    console.error('Erro ao buscar registros do banco:', error);
    res.status(500).json({
      message: 'Erro ao buscar registros do banco.',
    });
  }
});

// Sincronização e inicialização do banco de dados
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso!');
    agendarCriacaoDeBoletos();
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
}

// Função para agendar a criação de boletos
function agendarCriacaoDeBoletos() {
  const intervaloDeTempo = 60 * 60 * 1000; // 5 minutos

  setInterval(() => {
    console.log('Iniciando a criação do boleto...');
    criarBoletosParaTodosOsBancos();
  }, intervaloDeTempo);
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Teste de conexão com o banco de dados
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    syncDatabase();
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });
