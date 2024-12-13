import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Простой набор вопросов для викторины
const questions = [
  { question: "Столица России?", answer: "москва" },
  { question: "Самая длинная река в мире?", answer: "нил" },
  { question: "Сколько планет в Солнечной системе?", answer: "8" },
];

// Хранение состояния игры для каждого пользователя
const userSessions = {};

app.post('/alice', (req, res) => {
  const { session, request, version } = req.body;
  const userId = session.user_id;
  let userSession = userSessions[userId] || { score: 0, currentQuestion: -1 };

  let text, tts;
  const buttons = [];

  if (request.command === "start" || request.command === "помощь") {
    text = "Добро пожаловать в викторину! Я буду задавать вопросы, а вы отвечайте. Готовы начать?";
    tts = text;
    buttons.push({ title: "Начать", hide: true });
  } else if (request.command === "начать" || request.command === "да" || request.command === "следующий вопрос") {
    userSession.currentQuestion++;
    if (userSession.currentQuestion < questions.length) {
      const question = questions[userSession.currentQuestion];
      text = `Вопрос ${userSession.currentQuestion + 1}: ${question.question}`;
      tts = text;
    } else {
      text = `Викторина завершена! Ваш счет: ${userSession.score} из ${questions.length}.`;
      tts = text;
      userSession = { score: 0, currentQuestion: -1 };
    }
  } else {
    // Проверяем ответ пользователя
    const currentQuestion = questions[userSession.currentQuestion];
    if (currentQuestion && request.command.toLowerCase() === currentQuestion.answer) {
      userSession.score++;
      text = "Правильно! ";
      tts = text;
    } else {
      text = `Неправильно. Правильный ответ: ${currentQuestion.answer}. `;
      tts = text;
    }
    text += "Скажите 'следующий вопрос' для продолжения.";
    tts += "Скажите 'следующий вопрос' для продолжения.";
    buttons.push({ title: "Следующий вопрос", hide: true });
  }

  userSessions[userId] = userSession;

  res.json({
    version,
    session,
    response: {
      text,
      tts,
      end_session: false,
      buttons
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});