# 5. **Описание параметров**

## 5.1. **Параметры транзакционных подключений**

___

При добавлении нового транзакционного подключения необходимо заполнить ряд полей. Количество и тип полей зависят от биржи/рынка, к которым выполняется подключение. Далее дано описание полей для поддерживаемых бирж и рынков.

### **5.1.1. Московская биржа: фьючерсы и опционы**

В настоящее время для подключения к рынку фьючерсов и опционов Московской биржи используются только подключения по протоколу TWIME, проколы FIX и Plaza II не поддерживаются.

#### **5.1.1.1 Name**

Поле для задания имени подключения. Это значение пользователь задаёт для своего удобства, чтобы потом в списке транзакционных подключений ему было проще ориентироваться. Разрешенные символы: `_ a-z A-Z 0-9`

#### **5.1.1.2 Conn type**

Тип подключения. Поддерживаются варианты TWIME и TWIME_on_moves. Второй тип подключения является экспериментальным. В нём в одно подключение по факту добавляется несколько подключений. Заявки выставляются заранее по краям стакана. А при появлении приказа на выставление заявки, заранее выставленные заявки переставляются на заданную цену с заданным объёмом. Не используйте режим TWIME_on_moves, если вы не осведомлены о работе подключения в данном режиме. Для получения дополнительной информации о данном режиме вы можете обратиться в поддержку.

#### **5.1.1.3. TWIME server**

Адрес TWIME-сервера биржи, к которому будет выполняться подключение.

#### **5.1.1.4. TWIME credentials**

Credentials предоставляются брокером.

#### **5.1.1.5. Number of movable orders**

Количество заявок, которые робот будет держать по краям стакана, чтобы при необходимости использовать для переставлений. Этот параметр задает количество заявок на инструмент. В случае, если все заявки в данный момент использованы, то робот будет бросать по алгоритму Round robin.

#### **5.1.1.6. Min steps to pull**

Отступ от цен, на которых стоят заявки для перемещения по краям стакана, при достижении которого лучшей ценой, эти заявки снимаются чтобы избежать их исполнения. Если все же они исполнятся, то сделки по ним не будут учтены в алгоритме, и произойдет расхождение позиции в роботе и на бирже.

#### **5.1.1.7. Trading account(s)**

Торговый счёт, его можно найти в привязанном к счёту терминале или запросить у брокера.

![Alt](../00-img/5-1-1-7.png)

#### **5.1.1.8. TWIME comment**

Уникальный идентификатор для всех заявок для данного подключения, задаётся пользователем для собственного удобства (если не используется, оставляйте пустым).

#### **5.1.1.9. Round robin**

Включение и выключение режима `Round robin` для данного подключения.
Подробнее о Round robin - [здесь нужна ссылка 5-3-24]().

#### **5.1.1.10. Max trans**

Лимит транзакций в секунду. В анкете у вас указана производительность логина в единицах производительности, где 1 единица равна 30 транзакциям в секунду.

#### **5.1.1.11. Reserved trans**

Количество зарезервированных транзакций в секунду для заявок на удаление. Использование данного параметра уменьшает количество выставлений заявки, доступных за одну секунду, но позволяет увеличить вероятность того, что робот успеет отдернуть (снять) заявку при уходе цен.

#### **5.1.1.12. Move order**

Разрешить или запретить использование приказов на переставление (изменение) заявки для данного подключения.

#### **5.1.1.13. Bind IP**

IP-адрес, с которого будет проходить подключение к бирже. Если у вас указан IP в договоре, то указывайте. Если не указан, оставьте значение `Automatic`.

### **5.1.2. Московская биржа: фондовый и валютный рынки**

В настоящее время для подключения к фондовому и валютному рынкам Московской биржи используются только подключения по протоколу FIX, другие протоколы не поддерживаются.

#### **5.1.2.1. Name**

Поле для задания имени подключения. Это значение пользователь задаёт для своего удобства, чтобы потом в списке транзакционных подключений ему было проще ориентироваться. Разрешенные символы: `_ a-z A-Z 0-9`

#### **5.1.2.2. Conn type**

Тип подключения. Поддерживаются варианты FIX и FIX_on_moves. Второй тип подключения является экспериментальным. нём в одно подключение по факту добавляется несколько подключений. Заявки выставляются заранее по краям стакана. А при появлении приказа на выставление заявки, заранее выставленные заявки переставляются на заданную цену с заданным объёмом. Не используйте режим TWIME_on_moves, если вы не осведомлены о работе подключения в данном режиме. Для получения дополнительной информации о данном режиме вы можете обратиться в поддержку.

#### **5.1.2.3. Server**

Адрес FIX-сервера биржи, к которому будет выполняться подключение.

#### **5.1.2.4. SenderCompID**

Значение данного параметра предоставляется брокером.

#### **5.1.2.5. Password**

Пароль для данного FIX-подключения. Если не меняли, то используйте стандартный, указанный в поле для ввода.

#### **5.1.2.6. Trading account(s)**

Торговый счёт, предоставляется брокером, так же можно посмотреть в терминале.

![Alt](../00-img/5-1-2-6.png)

#### **5.1.2.7. Round robin**

Включение и выключение режима `Round robin` для данного подключения.
Подробнее о Round robin - [здесь нужна ссылка 5-3-24]().

#### **5.1.2.8. Client code**

Код клиента можно посмотреть в привязанном к счёту терминале (нажать F7 и открыть таблицу "Позиции по деньгам") или запросить у брокера.

![Alt](../00-img/5-1-2-8.png)

#### **5.1.2.9. Firm level account**

Указание на то, что ваш аккаунт является аккаунтом уровня фирмы. Неверное задание данного параметра приводит к ошибкам снятия и переставления заявок.

#### **5.1.2.10. Number of movable orders**

Количество заявок, которые робот будет держать по краям стакана, чтобы при необходимости использовать для переставлений. Этот параметр задает количество заявок на инструмент. В случае, если все заявки в данный момент использованы, то робот будет бросать по алгоритму Round robin.

#### **5.1.2.11. Min steps to pull**

Отступ от цен, на которых стоят заявки для перемещения по краям стакана, при достижении которого лучшей ценой, эти заявки снимаются чтобы избежать их исполнения. Если все же они исполнятся, то сделки по ним не будут учтены в алгоритме, и произойдет расхождение позиции в роботе и на бирже.

#### **5.1.2.12. Bind IP**

IP-адрес, с которого будет проходить подключение к бирже. Если у вас указан IP в договоре, то указывайте. Если не указан, оставьте значение `Automatic`.

### **5.1.3. Санкт-Петербургская биржа**

#### **5.1.3.1. Name**

Поле для задания имени подключения. Это значение пользователь задаёт для своего удобства, чтобы потом в списке транзакционных подключений ему было проще ориентироваться. Разрешенные символы: `_ a-z A-Z 0-9`

#### **5.1.3.2. Server**

Адреса для подключения к серверу биржи.

#### **5.1.3.3. Login**

Логин для доступа к бирже, берется из договора с биржей.

#### **5.1.3.4. Password**

Пароль для доступа к бирже, берется из договора с биржей.

#### **5.1.3.5. Memder ID**

Идентификатор участника торгов, берется из договора с биржей.

#### **5.1.3.6. Trading account(s)**

Идентификатор торгово-клирингового счёта участника, берется у брокера. Можете добавить несколько через запятую.

#### **5.1.3.7. Client ID**

Идентификатор клиентского кода, берется из договора с биржей.

#### **5.1.3.8. Bind IP**

IP-адрес, с которого будет проходить подключение к бирже. Если у вас указан IP в договоре, то указывайте. Если не указан, оставьте значение `Automatic`.

### **5.1.4. Криптовалютные биржи**

На большинстве криптовалютных бирж для подключения достаточно одной или нескольких пар ключей (API Keys). Пара ключей - это публичный и секретный ключи. На разных биржах они могут называться немного по-разному. Сгенерировать пару ключей обычно можно самостоятельно на сайте биржи. Раздел управления ключами чаще всего можно найти в Настройки - Безопасность - API. На некоторых биржах у пар ключей есть понятие разрешений/привилегий, при создании ключей не забывайте указывать ключам разрешение на выполнение торговых операций.

#### **5.1.4.1. Name**

Поле для задания имени подключения. Это значение пользователь задаёт для своего удобства, чтобы потом в списке подключений ему было проще ориентироваться.

#### **5.1.4.2. API Key/API/ID/Access Key/Public Key/Key**

Публичный API-ключ для доступа к бирже, берется на бирже. Находится чаще всего в Настройки - Безопасность - API.

#### **5.1.4.3. API key secret/Secret/Access Secret/Private Key/Secret Key**

Секретный API-ключ для доступа к бирже, берется на бирже. Находится чаще всего в Настройки - Безопасность - API.

#### **5.1.4.4. Bind IP**

IP-адрес, с которого будет проходить подключение к бирже. Можете оставить Automatic или, при необходимости, установите определенный IP для подключения.

#### **5.1.4.5. Margin account**

Указатель на то, что ваш аккаунт является маржинальным. Применяется не на всех криптобиржах.

#### **5.1.4.6. Passphrase**

Фраза-пароль для доступа к бирже, применяется только для Kukoin.

#### **5.1.4.7. Flood timeout**

В данном параметре указывается время, которое мы будем выжидать и не выставлять заявки после получения ошибки REASON_FLOOD (только для биржи Cex.io).

#### **5.1.4.8. User ID**

Это ID пользователя (только для биржи Cex.io).

#### **5.1.4.9. COD**

Cancel on disconnect - включить механизм снятия заявок при разрыве связи (только для биржи Cex.io).

#### **5.1.4.10. Create fast data connection**

Поставьте данный флаг, если хотите создать быстрое маркетдата подключение с той же парой ключей (только для биржи Deribit).

#### **5.1.4.11. Subaccount**

В данном поле указывается имя субаккаунта. Если суббакаунты не используются, то поле нужно оставить пустым.

#### **5.1.4.12. Single ADDING order**

Для каждой бумаги разрешить только одну заявку в статусе ADDING, при попытке выставления еще одной заявки возвращать ошибку выставления. (Только для биржи Cex.io).