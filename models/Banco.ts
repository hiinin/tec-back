import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../src/database'; // Aqui você vai importar a instância do seu banco de dados Sequelize

// Definição do modelo Banco
export class Banco extends Model {
  public id!: number;
  public nome!: string;
  public estado!: string; // Agora estado é um string comum
  public erro!: string | null;
  
  // Atributos virtuais (opcionais)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Banco.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [['online', 'offline']], // Validando se o valor está em 'online' ou 'offline'
      },
    },
    erro: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize, // A instância do Sequelize
    tableName: 'bancos', // Nome da tabela no banco de dados
    modelName: 'Banco',
  }
);
