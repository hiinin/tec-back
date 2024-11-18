"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registro = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../src/database"); // Certifique-se de que o caminho está correto
// Definição do modelo Registro
class Registro extends sequelize_1.Model {
}
exports.Registro = Registro;
Registro.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome_banco: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    tempo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    erro: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    disparado_em: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    statusBanco: {
        type: sequelize_1.DataTypes.ENUM('online', 'offline'), // Valores permitidos
        allowNull: false,
        defaultValue: 'offline', // Valor padrão
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'registros',
    schema: 'public', // Adiciona o esquema, se necessário
    modelName: 'Registro',
});
