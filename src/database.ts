import { Sequelize } from 'sequelize';
 export const sequelize = new Sequelize('tecnosped', 'tecnosped', 'tecnosped', {
 host: 'localhost',
 dialect: 'postgres',
 });