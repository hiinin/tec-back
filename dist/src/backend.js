"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const Boleto_1 = require("../Fun\u00E7\u00F5es/Boleto");
const Registros_1 = require("../models/Registros");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
// Rota para listar todos os registros
app.get('/registros', async (req, res) => {
    try {
        const registros = await Registros_1.Registro.findAll();
        return res.json(registros);
    }
    catch (error) {
        console.error('Erro ao buscar registros:', error);
        return res.status(500).json({ message: 'Erro ao buscar registros.' });
    }
});
// Rota para listar registros de um banco específico
app.get('/registros/:nomeBanco', async (req, res) => {
    try {
        const { nomeBanco } = req.params;
        const registros = await Registros_1.Registro.findAll({
            where: { nome_banco: nomeBanco },
        });
        if (registros.length === 0) {
            return res.status(404).json({
                message: `Nenhum registro encontrado para o banco: ${nomeBanco}`,
            });
        }
        return res.json(registros);
    }
    catch (error) {
        console.error('Erro ao buscar registros do banco:', error);
        return res.status(500).json({
            message: 'Erro ao buscar registros do banco.',
        });
    }
});
// Sincronização e inicialização do banco de dados
async function syncDatabase() {
    try {
        await database_1.sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado com sucesso!');
        agendarCriacaoDeBoletos();
    }
    catch (error) {
        console.error('Erro ao sincronizar o banco de dados:', error);
    }
}
// Teste de conexão com o banco de dados
database_1.sequelize
    .authenticate()
    .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    syncDatabase();
})
    .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
});
// Função para agendar a criação de boletos
function agendarCriacaoDeBoletos() {
    const intervaloDeTempo = 5 * 60 * 1000; // 5 minutos
    setInterval(() => {
        console.log('Iniciando a criação do boleto...');
        (0, Boleto_1.criarBoletosParaTodosOsBancos)();
    }, intervaloDeTempo);
}
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
