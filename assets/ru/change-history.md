---
title: 1. История изменений
section: 1
ignore-section-number: true
summary: 'Что менялось в роботе и документации от версии к версии: новые параметры портфеля, методы C++ и WebSocket API.'
---

# История изменений

## 2026-11-10 <Badge text="Несовместимые изменения" type="warning" vertical="super" />

- Добавлена возможность настраивать расписание торговли портфеля отдельно для каждого дня недели, в связи с этим:
    * Удален параметр портфеля [TradingDays](params-description.md#p.trading_days);
    * Добавлен столбец [Trading days](params-description.md#p.trading_days) в таблицу с расписанием [Timetable](params-description.md#p.use_tt) портфеля;
    * Удален пункт `Group TradingDays` в меню [Actions](getting-started.md#portfolio_actions) виджета [Portfolios table](interface.md#portfolios_table).
- Добавлена возможность настраивать расписание рассчета значений [индикаторов](c-api.md#indicators-docs) отдельно для каждого дня недели, в связи с этим:
    * В C++ интерфейс в объект [`interval`](c-api.md#cpp-interval) добавлен новый конструктор, учитывающий дни недели;
    * В C++ интерфейс в объект [`schedule`](c-api.md#cpp-schedule) добавлен новый перегруженный метод `is_in`, учитывающий день недели.
- **В связи с удалением параметра портфеля [TradingDays](params-description.md#p.trading_days) и с добавлением его в каждый интервал в таблице с расписанием [Timetable](params-description.md#p.use_tt) портфеля:**
    * **Если данный параметр как-то использовался через [WebSocket API](api.md), необходимо изменить реализацию клиентского кода, т.к. изменения в роботе НЕ сохраняют обратную совместимость;**
    * **Текущие настройки ВСЕХ портфелей также НЕ сохраняют обратную совместимость, во все интервалы в расписании в качестве значения [Trading days](params-description.md#p.trading_days) по умолчанию будут
        проставлены все дни недели, пользователям придется самим изменить дни на нужные для всех интервалов всех портфелей.**

### Как перейти

#### WebSocket API

Поле `trading_days` убрано из объекта портфеля и добавлено в каждый элемент массива `timetable`. Формат значения не изменился: битовая маска дней недели (`bitmask_select`), `1` - воскресенье, `2` - понедельник, `4` - вторник, `8` - среда, `16` - четверг, `32` - пятница, `64` - суббота, значение по умолчанию `127` (все дни), описание полей смотрите в [api.md](api.md) и в [Timetable](params-description.md#p.trading_days).

На уровне портфеля:

<table>
<tr>
<th>Было</th>
<th>Стало</th>
</tr>
<tr>
<td>

```js
{
  "trading_days": 127,
  "name": "qwe",
  "decimals": 4,
  "securities": { … },
  "timetable": [ … ],
  // …
}
```

</td>
<td>

```js
{
  "name": "qwe",
  "decimals": 4,
  "securities": { … },
  "timetable": [ … ],
  // …
}
```

</td>
</tr>
</table>

На уровне расписания (`timetable`):

<table>
<tr>
<th>Было</th>
<th>Стало</th>
</tr>
<tr>
<td>

```json
{
  "begin": 36000,
  "end": 67200,
  "a_sell": 2,
  "a_buy": 2,
  "auto_close": false,
  "auto_to_market": false,
  "auto_to0": 2,
  "save_history": false
}
```

</td>
<td>

```json
{
  "trading_days": 127,
  "begin": 36000,
  "end": 67200,
  "a_sell": 2,
  "a_buy": 2,
  "auto_close": false,
  "auto_to_market": false,
  "auto_to0": 2,
  "save_history": false
}
```

</td>
</tr>
</table>

Если клиент читал или записывал `trading_days` портфеля, теперь нужно:

- читать `trading_days` из каждого интервала `timetable` портфеля, а не из самого портфеля;
- записывать `trading_days` в каждый интервал `timetable`: поле обязательное (например, понедельник-пятница это `2 + 4 + 8 + 16 + 32 = 62`); допустимый диапазон от `0` до `127`, `0` - пустая маска, ни одного дня недели;
- не передавать `trading_days` на уровне портфеля: запрос с этим полем будет отклонён с ошибкой.

##### Существующие портфели

У всех существующих портфелей во всех интервалах `timetable` значение `trading_days` будет `127` (все дни недели). Прежнее значение портфеля не переносится, пользователям нужно самим задать [Trading days](params-description.md#p.trading_days) для каждого интервала.

#### C++

В [`interval`](c-api.md#cpp-interval) добавлен конструктор с битовой маской дней недели:

```cpp
interval(int trading_days, day_time b, day_time e)
```

Должны выполняться условия `b < e` и $1 \le trading\_days \le 127$, иначе будет выброшено `std::invalid_argument`. Прежний `interval(day_time b, day_time e)` работает как раньше и задает все дни недели.

В [`schedule`](c-api.md#cpp-schedule) добавлен перегруженный метод `is_in`:

```cpp
bool is_in(int wd, const day_time& dt) const
```

`wd` - день недели, $0 \le wd \le 6$ (`0` - воскресенье, `1` - понедельник и т.д.); как и `is_in(const day_time& dt)`, метод возвращает `true`, если расписание пусто.

## 2026-10-20

- Добавлен нередактируемый параметр портфеля [Pos0](params-description.md#p.pos0);
- В C++ интерфейс добавлен метод [lot_qty()](c-api.md#lot-qty) для объекта финансового инструмента;
- В C++ интерфейсе изменено поведение и описание метода [lot_round()](c-api.md#lot-round) для объекта финансового инструмента.

## 2026-09-29

- В C++ интерфейс добавлен объект [`ring_deque`, который умеет сохранять и загружать свои значения при перезапуске робота](c-api.html#ring-deque)
- В связи с добавлением в C++ интерфейс коллекций, размещаемых в `shared_memory`, раздел `Индикаторы и математическая статистика` переименован в [`Индикаторы, математическая статистика и коллекции`](c-api.md#indicators-docs)

## 2026-09-14

- В [WebSocket API](api.md) добавлен лимит в 8 одинаковых подписок на одну вебсокет сессию;
- Добавлен параметр портфеля [Calculation method](params-description.md#p.calc_method), отвечающий за новый метод расчета раздвижки, в связи с этим обновлены формулы расчета
[Sell/Buy](params-description.md#p.sell), [Price_s/Price_b](params-description.md#p.price_s), [Equal prices](params-description.md#p.equal_prices).

## 2026-08-21

- Добавлены параметры портфеля [Shift mode](params-description.md#p.shift_mode), [Shift formula](params-description.md#p.shift_formula), [X](params-description.md#p.x), [v_side](params-description.md#p.v_side),
    отвечающие за новые алгоритмы подвижки цен [Lim_sell](params-description.md#p.lim_s) и [Lim_buy](params-description.md#p.lim_b);
- В C++ интерфейс добавлены [методы портфеля](c-api.md#portfolio-field-access) для доступа и редактирования [Shift mode](params-description.md#p.shift_mode), [X](params-description.md#p.x), [v_side](params-description.md#p.v_side);
- В C++ интерфейс добавлен метод [deal()](c-api.md#__last_deal__) для объекта портфеля.

## 2026-08-04

- В C++ интерфейс добавлена функция [`void log_show(const std::string&)`](c-api.md#cpp-log-show)
- В C++ интерфейс добавлена [возможность сохранения и загрузки значений индикаторов при перезапуске робота](c-api.html#sokhranenie-znachenii-indikatorov-mezhdu-perezapuskami-robota)

## 2026-03-05

- Добавлены поля `Sell/Buy` и `Lim_S/Lim_B` в виджетах [Finres history](interface.md#finres_history) и [Finres for today](interface.md#finres_for_today). Поле `Buy/Sell` также переименовано в `Direction` в обоих виджетах.

## 2026-02-27

- Внесены изменения в разделе описания [API-ключей](creating-connection.md#tc.BINANCE.ws_id) для подключения к [BINANCE](creating-connection.md#BINANCE)

## 2026-01-27

- Добавлена возможность ограничения доступа к платформе за счёт разрешения доступа только для ip-адресов из [белого списка](getting-started.md#ip_wl).

## 2026-01-16

- Отключена проверка статусов инструментов для следующих подключений: [SPB](creating-connection.md#spb), [OREX](creating-connection.md#orex), [IMEX](creating-connection.md#imex), [ITS](creating-connection.md#its).

## 2026-01-14

- В настройках подключения [EXANTE](creating-connection.md#exante) добавлено поле с [кодами типов инструментов](creating-connection.md#tc.EXANTE.cfi_codes).

## 2025-10-21

- Внесены изменения в подключение [Ctrader](creating-connection.md#ctrader).

## 2025-09-26

- Добавлен [дневной лимит виртуальных сделок](params-description.md#virt_tr_daily_limit), совершенных роботом.

## 2025-09-22

- Во всех [уведомлениях](params-description.md#notifications-params) знак сравнения изменен на строгий (теперь везде "строго больше");
- Для всех [уведомлений](params-description.md#notifications-params) добавлена возможность остановить торговлю.

## 2025-07-22

- Добавлен нередактируемый параметр портфеля [Is trading](params-description.md#p.is_trading);
- Добавлен новый статус торговых и маркет-дата подключений "отключено по времени";
- В связи с предыдущим пунктом обновлено описание интерфейсов виджетов [Robots table](interface.md#robots_table), [Data connections](interface.md#data_connections), [Trade connections](interface.md#trade_connections).

## 2025-07-15

- Добавлен отдельный [пункт](introduction.md#requirements) с подробным описанием системных требований. Вопрос о системных требованиях в [Часто задаваемых вопросах](faq.md) теперь ссылается на этот пункт.

## 2025-06-22

- Хранение исторических данных по сделкам, финансовым результатам и логам теперь осуществляется в течение 6 месяцев.

## 2025-06-19

- В интерфейс сайта добавлена возможность [изменения торговых интервалов расписания сразу по нескольким портфелям](getting-started.md#portfolio_actions.timetable)

## 2025-06-04

- В C++ интерфейс добавлена константа [`NULL_VALUE`](c-api.md#__null_value__) для индикации отсутствия значения на [графиках в WebSocket API](api.md#portfolio-history)
- В [WebSocket API](api.md#portfolio-history) добавлена информация про "отсутствующие значения", которые не будут отображаться в вебинтерфейсе на графиках

## 2025-06-02

- В C++ интерфейс для объекта [портфеля](c-api.md#portfolio-field-access) добавлены методы `bool is_sell_ok()`, `bool is_buy_ok()`,
    `bool is_price_s_ok()`, `bool is_price_b_ok()` для проверки валидности текущих значений полей `Sell`, `Buy`, `Price_s`, `Price_b`;

## 2025-05-29

- Добавлена информация о том, что все строки в [C++ интерфейсе](c-api.md) и в [WebSocket API](api.md) должны являться валидными `UTF-8` строками, а все лимиты на длины строк указаны в байтах;
- В описание C++ интерфейса добавлен [рекомендуемый способ отладки пользовательских формул](c-api.md#cpp-debug);
- В описание C++ интерфейса добавлены [рекомендации по фильтрации биржевых данных](c-api.md#md-filter).

## 2025-05-16

- В WebSocket API в методах `portfolio_fin_res.*` в объектах списка `trs` поле `t` заменено на `dt`.

## 2025-04-08

- В C++ интерфейс для объекта [портфеля](c-api.md#portfolio-field-access) добавлены методы `std::string color()` и `void set_color(const std::string& v)` для получения и изменения поля "Color" портфеля;
- В C++ интерфейсе во всех сеттерах для полей типа `std::string` тип аргумента изменен на `const std::string&`.

## 2025-02-10

- Добавлена возможность [двухфакторной аутентификации](getting-started.md#two-factor-authentication) на сайте.

## 2025-02-06

- Уменьшен [Rate limit подключений](api.md#conn_rate_limit).

## 2024-11-21

- Добавлена соответствующая пометка для параметров, которые отображаются с учетом `lot_size` (это [Curpos](params-description.md#s.pos), [Count](params-description.md#s.count), [Market volume](params-description.md#p.mkt_volume), [Return first](params-description.md#p.return_first)).
- В формулы для расчета [Opened](params-description.md#p.opened), [Commision sum](params-description.md#p.opened_comission), [Fin res](params-description.md#p.fin_res), [Fin res wo C](params-description.md#p.fin_res_wo_c) добавлен `lot_size` соответствующего финансового инструмента.

## 2024-11-01

- В C++ интерфейс добавлены [массивы указателей на методы](c-api.md#user-fields) для доступа и редактирования "пользовательских полей".

## 2024-10-30

- В C++ интерфейс для всех [объектов для расчета индикаторов](c-api.md#indicators-docs) добавлены методы `shift(double)`, `empty()`, `size()`;
- В C++ интерфейс добавлен индикатор [RSI](c-api.md#indicators-rsi);
- В C++ интерфейс добавлены [объекты таймеры](c-api.md#timers).

## 2024-10-17

- В C++ интерфейс для всех [объектов для расчета индикаторов](c-api.md#indicators-docs) добавлен метод `clear()`.

## 2024-09-26

- Из C++ интерфейса удален метод `set_fin_res()` объекта портфеля;
- Из C++ интерфейса удален метод `set_fin_res_wo_c()` объекта портфеля.

## 2024-09-24

- [v_min/v_max](params-description.md#p.v_min) портфеля теперь измеряются в штуках портфелей.

## 2024-09-16

- В настройки расписания портфеля добавлен параметр [TradingDays](params-description.md#p.trading_days);
- В C++ интерфейс добавлен метод [mid_price()](c-api.md#market-data-access) для объекта финансового инструмента;
- В C++ интерфейс добавлены [объекты для расчета различных индикаторов](c-api.md#indicators-docs).

## 2024-06-26

- Удален параметр портфеля `Timetable only stop`.

## 2024-06-20

- Изменена и расширена логика работы параметра портфеля [Timetable](params-description.md#p.use_tt).

## 2024-05-13

- В параметры портфеля добавлен параметр [Threshold](params-description.md#p.threshold);
- Параметр [Only maker](params-description.md#p.maker) теперь является параметром портфеля, а не параметром финансового инструмента портфеля;
- Некоторые параметры портфеля/финансового инструмента, непосредственно влияющие на выставление [Is first](params-description.md#is-first) финансового инструмента портфеля и/или доступные только для [Is first](params-description.md#is-first) финансового инструмента портфеля
перемещены в отдельную группу настроек портфеля `FIRST LEG SETTINGS`.

## 2024-05-02

- В C++ интерфейс добавлена функция [tgr_notify()](c-api.md#__tgr_notify__) для отправки уведомлений в telegram.

## 2024-04-19

- Добавлена информация о пользователе, создавшем портфель, в WebSocket API в [подписку на список доступных портфелей](api.md#portfolio-list-subscription).

## 2023-12-13

- Из C++ интерфейса удален метод `extra()` объекта портфеля;
- Из C++ интерфейса удалена структура `dict_double`;
- Из WebSocket API удалено поле портфеля `__extra`;
- В C++ интерфейс для объекта [портфеля](c-api.md#portfolio-field-access) добавлены методы `uf0(), ..., uf19()` и методы `set_uf0(), ..., set_uf19()` для получения и изменения "пользовательских полей";
- В C++ интерфейс добавлена структура `user_value`;
- В C++ API добавлена возможность итерирования по финансовым инструментам портфеля (методы объекта [портфеля](c-api.md#portfolio-field-access) `restart_sec_iter()`, `has_next_sec()`, `next_sec()`);
- В WebSocket API добавлены поля портфеля `uf0, ..., uf19`.

## 2022-06-22

- В FIX подключениях к фондовому и валютному рынкам Московской биржи снято ограничение на число заявок, выставляемых за торговую сессию, связанное с длинными клиентскими кодами;
- Подключения к Binance переведены на потоки раздачи стаканов с меньшей "нарезкой".

## 2022-06-15

- В C++ интерфейс добавлены методы [min_step()](c-api.md#market-data-access) и [lot_round()](c-api.md#market-data-access) для объекта финансового инструмента;
- В C++ интерфейс добавлены методы [funding_rate()](c-api.md#market-data-access) и [funding_time()](c-api.md#market-data-access) для объекта финансового инструмента (для некоторых бирж).

## 2022-02-03

- Добавлена возможность подключения к бирже Deribit с быстрой маркетдатой. Для этого потребуется пересоздать торговое подключение к Deribit;
- Изменено поведение всех маркетдата подключений требующих авторизацию (Exante FIX, LMAX FIX, Bequant FIX, Deribit). Все эти маркетдата подключения добавляются вместе с соответствующим торговым подключением, а потому включаться и отключаться они тоже будут только вместе с торговым подключением;
- В C++ интерфейс добавлен метод [extra()](c-api.md#portfolio-field-access) для объекта портфеля;
- В C++ интерфейс добавлена возможность вывода сообщений в лог ([функции log_*](c-api.md#option-functions));
- В меню "Action" на главной странице робота добавлена функция To0;
- В WebSocket API добавлено поле портфеля [__extra](api.md) для возможности сохранения пользовательских настроек.
