import express from 'express';
import fs from 'node:fs/promises';

const app = express();
const port = 3000;
const filePath = './gifts.json';

// Встроенный парсер для данных формы
app.use(express.urlencoded({ extended: true }));

/**
 * Сохраняет данные в JSON файл.
 * @param {Object} data - Данные для сохранения.
 */
async function saveData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData);
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
  }
}

/**
 * Загружает данные из JSON файла.
 * @returns {Promise<Object>} - Объект с данными.
 */
async function loadData() {
  try {
    await fs.access(filePath); // Проверяем существование файла
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Если файла нет, создаем пустой объект
      await saveData({});
      return {};
    } else {
      console.error('Ошибка при чтении данных:', error);
      return {};
    }
  }
}

// Обработка POST-запроса
app.post('/api/gift', async (req, res) => {
  const id = Date.now(); // Простой способ сгенерировать уникальный ID
  const gifts = await loadData();
  gifts[id] = req.body;

  await saveData(gifts);
  res.send({ message: 'Подарок успешно зарегистрирован', id });
});

// Обработка GET-запроса
app.get('/api/gift/:id', async (req, res) => {
  const gifts = await loadData();
  const gift = gifts[req.params.id];

  if (gift) {
    res.send(gift);
  } else {
    res.status(404).send({ message: 'Подарок не найден' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
