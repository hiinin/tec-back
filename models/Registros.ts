import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../src/database';
import { Banco } from '../models/Banco'; // Importa o modelo Banco

// Definição do modelo Registro
export class Registro extends Model {
  public id!: number;
  public id_banco!: number;
  public tempo!: number; // tempo em milissegundos
  public codigo!: string; 
  public erro!: string | null;
  public disparado_em!: Date;

  // Atributos virtuais
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
    id_banco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Banco, // Referência ao modelo Banco
        key: 'id',    // Chave primária do modelo Banco
      },
    },
    tempo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    erro: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    disparado_em: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize, // Instância do Sequelize
    tableName: 'registros', // Nome da tabela no banco de dados
    modelName: 'Registro',
  }
);

// Definição do relacionamento entre Banco e Registro (relacionamento 1:N)
Banco.hasMany(Registro, { foreignKey: 'id_banco' });
Registro.belongsTo(Banco, { foreignKey: 'id_banco' });
