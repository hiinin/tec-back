'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registros', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nome_banco: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tempo: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      erro: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      disparado_em: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      statusBanco: {
        type: Sequelize.ENUM('online', 'offline'),
        allowNull: false,
        defaultValue: 'offline',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registros');
    await queryInterface.removeColumn('registros', 'statusBanco');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_registros_statusBanco";');
    await queryInterface.dropTable('registros');
  },
};
