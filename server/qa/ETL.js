require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.pgurl);
// TODO combine the sql and js files

const ETL = async () => {
  const questionNum = await sequelize.query('SELECT MAX(question_id) FROM questions');
  await sequelize.query(`ALTER SEQUENCE questions_question_id_seq RESTART WITH ${questionNum[0][0].max + 1}`);
  const answerNum = await sequelize.query('SELECT MAX(id) FROM answers');
  await sequelize.query(`ALTER SEQUENCE answers_id_seq RESTART WITH ${answerNum[0][0].max + 1}`);
  const photoNum = await sequelize.query('SELECT MAX(id) FROM photos');
  await sequelize.query(`ALTER SEQUENCE photos_id_seq RESTART WITH ${photoNum[0][0].max + 1}`);
  await sequelize.query('CREATE INDEX aindex ON questions (product_id)');
  await sequelize.query('CREATE INDEX rindex ON questions (reported)');
  await sequelize.query('CREATE INDEX bindex ON answers (question_id)');
  await sequelize.query('CREATE INDEX paindex ON photos (answer_id)');
};
ETL();
