import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../src/database'; // Certifique-se de que o caminho está correto

// Definição do modelo Registro
export class Registro extends Model {
  public id!: number;
  public nome_banco!: string;  // Nome do banco ao invés de id_banco
  public tempo!: number; // Tempo de resposta
  public erro!: string | null; // Erro (se houver)
  public codigo!: string; // Código do boleto
  public disparado_em!: Date; // Data em que o boleto foi disparado

  // Atributos virtuais (opcionais)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Registro.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_banco: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tempo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    erro: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    disparado_em: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize, // A instância do Sequelize
    tableName: 'registros', // Nome da tabela no banco de dados
    modelName: 'Registro',
  }
);
