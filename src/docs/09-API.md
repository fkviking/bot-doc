# 9. API



## 9.1. Введение

Кроме использования стандартного web-интерфейса для управления своими роботами предусмотрен доступ с помощью WebScoket API, используются текстовые сообщения в формате JSON. Такой вариант подходит для разработки собственного графического интерфейса управления роботами, а так же для сбора статистики.



## 9.2. Общие положения

Первым делом вы должны отправить сообщение с авторизацией. Если авторизация успешна - то можете дальше слать другие доступные сообщения, если не успешна - сервер закроет соединение.

Все сообщения, которые вы получаете, содержат поле ts - это время отправки сообщения в наносекундах в формате epoch.

Каждые 30 секунд сервер отправляет PING сообщение клиенту, если в течение 15-ти секунд сервер не получит от клиента PONG или любое другое сообщение, свзяь будет разорвана.

Максимальный допустимый размер входящего сообщения составляет 4МБ, при превышении данного лимита свзяь будет разорвана.

Вы можете отправить не более 20-ти сообщений в секунду, при превышении лимита связь будет разорвана.



## 9.3. Куда подключаться

Подключение по WebSocket, адрес wss://bot.fkviking.com/ws



## 9.4. Авторизация

Запрос
```
{"type":"authorization_key", "data":{"key":"API_KEY", "email":"YOUR_EMAIL"}}
```
key - API ключ пользователя
email - адрес электронной почты пользователя

Ответ при успешной авторизации
```
{"type":"authorization","data":{"code":0},"ts":1624516437000000123}
```

Пример ошибки авторизации
```
{"type": "text", "data": {"style": "error", "title": "Error", "text": "Wrong email"},"ts":1624516437000000123}
```