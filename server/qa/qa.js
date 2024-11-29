require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
const sequelize = new Sequelize(process.env.pgurl);

app.use(express.json());

// const test = async () => {
//   try {
//     const [data] = await sequelize.query(`SELECT json_agg(json_build_object(id,  json_build_object('body', body))) from answers WHERE question_id=1`);
//     console.log(data[0].json_agg);
//   } catch (err) {
//     console.log('fail', err);
//   }
// };
// test();
app.get(`/${process.env.LOADER_IO}/`, (req, res) => {
  res.send(`${process.env.LOADER_IO}`);
});

app.get('/qa/questions', async (req, res) => {
  // TODO format data and date better
  try {
    const first = Number(new Date())
    let { product_id, page, count } = req.query;
    if (!count) {
      count = 5;
    }
    if (!page) {
      page = 0;
    } else {
      page = (page - 1) * count;
    }
    const [questions] = await sequelize.query(`SELECT * FROM questions WHERE product_id=${product_id} AND reported=0 LIMIT ${count} OFFSET ${page}`);
    const getAnswer = async (j) => {
      const [answers] = await sequelize.query(`SELECT id, body, date, answerer_name, helpfulness FROM answers WHERE question_id=${questions[j].question_id} AND reported=0`);
      const [photos] = await sequelize.query(`SELECT photos.url, answer_id FROM photos INNER JOIN answers ON photos.answer_id=answers.id WHERE question_id=${questions[j].question_id}`);
      photos.forEach((photo) => {
        for (let i = 0; i < answers.length; i += 1) {
          if (answers[i].id === photo.answer_id) {
            if (answers[i].photos) {
              answers[i].photos.push(photo.url);
            } else {
              answers[i].photos = [photo.url];
            }
          }
        }
      });
      const newDate = await new Date(+questions[j].question_date).toISOString();
      questions[j].question_date = newDate;
      questions[j].answers = {};
      answers.forEach((answer, i) => {
        const date = new Date(+answer.date).toISOString();
        answers[i].date = date;
        const result = {
          id: answer.id,
          body: answer.body,
          date: answer.date,
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpfulness,
          photos: answer.photos || [],
        };
        questions[j].answers[answer.id] = result;
      });
      questions[j].reported = false;
      questions[j].email = undefined;
    };
    const arr = [...Array(questions.length)].map((_, index) => getAnswer(index));
    await Promise.all(arr);
    const result = { product_id, results: questions };
    console.log('end', Number(new Date()) - first)
    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
});
// TODO GET /qa/questions params(*product_id, page=1, count=5)

// TODO GET /qa/questions/:question_id/answers params(*question_id) queryparams(page=1, count=5)
app.get('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    const { question_id } = req.params;
    let { page, count } = req.query;
    if (!count) {
      count = 5;
    }
    if (!page) {
      page = 0;
    } else {
      page = (page - 1) * count;
    }
    const [answers] = await sequelize.query(`SELECT * FROM answers WHERE question_id=${question_id} AND reported=0 LIMIT ${count} OFFSET ${page}`);
    const [photos] = await sequelize.query(`SELECT photos.url FROM photos INNER JOIN answers ON photos.answer_id=answers.id WHERE question_id=${question_id}`);
    photos.forEach((photo) => {
      for (let i = 0; i < answers.length; i += 1) {
        if (answers[i].id === photo.answer_id) {
          if (answers[i].photos) {
            answers[i].photos.push(photo.url);
          } else {
            answers[i].photos = [photo.url];
          }
        }
      }
    });
    res.status(200).send(answers);
  } catch (err) {
    res.status(500).send(err);
  }
});

// TODO POST /qa/questions params(body, name, email, product_id)
app.post('/qa/questions', async (req, res) => {
  try {
    const {
      body, name, email, product_id,
    } = req.body;
    await sequelize.query(`INSERT INTO questions (product_id, question_body, question_date, asker_name, email, reported, question_helpfulness) VALUES (${product_id}, '${body}', DEFAULT, '${name}', '${email}', 0, 0)`);
    res.status(201).send();
  } catch (err) {
    res.status(404).send(err);
  }
});
// ? need to test below this
// TODO POST/qa/questions/:question_id/answers param(question_id) body(body, name, email, photos)
app.post('/qa/questions/:question_id/answers', async (req, res) => {
  try {
    const {
      body, name, email, photos,
    } = req.body;
    const { question_id } = req.params;
    const id = await sequelize.query(`INSERT INTO answers VALUES (DEFAULT, ${question_id}, '${body}', '0', '${name}', '${email}', 0, 0) RETURNING id`);
    if (photos) {
      photos.forEach(async (photo) => {
        await sequelize.query(`INSERT INTO photos VALUES (DEFAULT, ${id[0][0].id}, '${photo}')`);
      });
    }
    res.status(201).send();
  } catch (err) {
    res.status(404).send(err);
  }
});

// TODO PUT /qa/questions/:question_id/helpful param(question_id)
app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  try {
    const { question_id } = req.params;
    const [helpful] = await sequelize.query(`SELECT question_helpfulness FROM questions WHERE question_id = ${question_id}`);
    await sequelize.query(`UPDATE questions SET question_helpfulness = ${helpful[0].question_helpfulness + 1} WHERE question_id=${question_id}`);
    res.status(202).send();
  } catch (err) {
    res.status(404).send(err);
  }
});

// TODO PUT /qa/questions/:question_id/report param(question_id)
app.put('/qa/questions/:question_id/report', async (req, res) => {
  try {
    const { question_id } = req.params;
    await sequelize.query(`UPDATE questions SET reported = 1 WHERE question_id=${question_id}`);
    res.status(202).send();
  } catch (err) {
    res.status(404).send(err);
  }
});

// TODO PUT /qa/answers/:answer_id/helpful param(answer_id)
app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
  try {
    const { answer_id } = req.params;
    const [helpful] = await sequelize.query(`SELECT helpfulness FROM answers WHERE id = ${answer_id}`);
    await sequelize.query(`UPDATE answers SET helpfulness = ${helpful[0].helpfulness + 1} WHERE id=${answer_id}`);
    res.status(202).send();
  } catch (err) {
    res.status(404).send(err);
  }
});

// TODO PUT /qa/answers/:answer_id/report param(answer_id)
app.put('/qa/answers/:answer_id/report', async (req, res) => {
  try {
    const { answer_id } = req.params;
    await sequelize.query(`UPDATE answers SET reported = 1 WHERE id=${answer_id}`);
    res.status(202).send();
  } catch (err) {
    res.status(404).send(err);
  }
});

// ALTER TABLE `answers` ADD FOREIGN KEY (question) REFERENCES `Questions` (`question_id`);
// ALTER TABLE `answers` ADD FOREIGN KEY (photos) REFERENCES `answers_photos` (`id`);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
