# Change Log

## 2026-08-21

- Added portfolio parameters [Shift mode](params-description.md#p.shift_mode), [Shift formula](params-description.md#p.shift_formula), [X](params-description.md#p.x), [v_side](params-description.md#p.v_side),
    responsible for new algorithms of [Lim_sell](params-description.md#p.lim_s) and [Lim_buy](params-description.md#p.lim_b) price moving;
- Added [portfolio methods](c-api.md#portfolio-field-access) to C++ interface for accessing and editing [Shift mode](params-description.md#p.shift_mode), [X](params-description.md#p.x), [v_side](params-description.md#p.v_side);
- Added [deal()](c-api.md#__last_deal__) method to C++ interface for portfolio object.

## 2026-08-04

- Added [`void log_show(const std::string&)`](c-api.md#cpp-log-show) function to C++ interface
- Added [ability to save and load indicator values on robot restart](c-api.md#sokhranenie-znachenii-indikatorov-mezhdu-perezapuskami-robota) to C++ interface

## 2026-03-05

- The `Sell/Buy` and `Lim_S/Lim_B` fields have been added to the [Finres history](interface.md#finres_history) and [Finres for today](interface.md#finres_for_today) widgets. The `Buy/Sell` field has been renamed to `Direction` in both widgets.

## 2026-02-27

- Changes have been made to the description of [API keys](creating-connection.md#tc.binance.ws_id) for connecting to [BINANCE](creating-connection.md#binance)

## 2026-01-27

- Added the ability to restrict access to the platform by allowing access only to IP addresses from the [whitelist](getting-started.md#ip_wl).

## 2026-01-16

- Disabled checking of security statuses for the next connections: [SPB](creating-connection.md#spb), [OREX](creating-connection.md#orex), [IMEX](creating-connection.md#imex), and [ITS](creating-connection.md#its) connections.

## 2026-01-14

- A field with [instrument type codes](creating-connection.md#exante) has been added to the [EXANTE](creating-connection.md#exante) connection settings.

## 2025-10-21

- Changes have been made to the [Ctrader](creating-connection.md#ctrader) connection.

## 2025-09-26

- Added [daily limit of virtual trades](params-description.md#virt_tr_daily_limit) executed by the robot.

## 2025-09-22

- In all [notifications](params-description.md#notifications-params), comparison operator has been changed to strict ("strictly greater" everywhere);
- Added the ability to stop trading from any [notification](params-description.md#notifications-params).

## 2025-07-22

- Added a non-editable portfolio parameter [Is trading](params-description.md#p.is_trading);
- Added a new status for trade and market data connections: "disabled by time";
- Updated widget interface descriptions [Robots table](interface.md#robots_table), [Data connections](interface.md#data_connections), [Trade connections](interface.mdtrade_connections) accordingly.

## 2025-07-15

- Added a dedicated [section](introduction.md#requirements) with detailed system requirements.  
  The FAQ question on system requirements [FAQ](faq.md) now refers to this section.

## 2025-06-22

- Storage of historical data for trades, financial results, and logs is now retained for 6 months.

## 2025-06-19

- Added ability to [edit trading schedule intervals for multiple portfolios at once](getting-started.md#portfolio_actions.timetable) in the web interface.

## 2025-06-04

- Added constant [`NULL_VALUE`](c-api.md#__null_value__) to the C++ API for indicating missing values in [WebSocket API charts](api.md#portfolio-history);
- Updated [WebSocket API](api.md#portfolio-history) documentation to describe "missing values" that are not displayed in charts.

## 2025-06-02

- Added C++ API methods `bool is_sell_ok()`, `bool is_buy_ok()`,  
  `bool is_price_s_ok()`, `bool is_price_b_ok()` in the [portfolio object](c-api.md#portfolio-field-access) for validating current field values `Sell`, `Buy`, `Price_s`, `Price_b`.

## 2025-05-29

- Clarified that all strings in the [C++ API](c-api.md) and [WebSocket API](api.md) must be valid `UTF-8`, and length limits are specified in bytes;
- Added [recommended debugging approach for user formulas](c-api.md#cpp-debug) to the C++ API documentation;
- Added [market data filtering recommendations](c-api.md#md-filter) to the C++ API documentation.

## 2025-05-16

- In the WebSocket API, the field `t` in objects of the `trs` list in `portfolio_fin_res.*` methods was replaced with `dt`.

## 2025-04-08

- Added methods `std::string color()` and `void set_color(const std::string& v)` to the [portfolio object](c-api.md#portfolio-field-access) in the C++ API;
- Updated C++ API setters for `std::string` fields to accept arguments by reference (`const std::string&`).

## 2025-02-10

- Added [two-factor authentication](getting-started.md#two-factor-authentication) support on the website.

## 2025-02-06

- Reduced [connection rate limit](api.md#conn_rate_limit).

## 2024-11-21

- Added notes for parameters affected by `lot_size`: [Curpos](params-description.md#s.pos), [Count](params-description.md#s.count), [Market volume](params-description.md#p.mkt_volume), [Return first](params-description.md#p.return_first).
- Updated formulas for [Opened](params-description.md#p.opened), [Commission sum](params-description.md#p.opened_comission), [Fin res](params-description.md#p.fin_res), [Fin res wo C](params-description.md#p.fin_res_wo_c) to include the instrument’s `lot_size`.

## 2024-11-01

- Added [user field pointer arrays](c-api.md#user-fields) to the C++ API for accessing and editing "user fields".

## 2024-10-30

- Added methods `shift(double)`, `empty()`, `size()` for all [indicator objects](c-api.md#indicators-docs) in the C++ API;
- Added [RSI indicator](c-api.md#indicators-rsi) to the C++ API;
- Added [timer objects](c-api.md#timers) to the C++ API.

## 2024-10-17

- Added `clear()` method for all [indicator objects](c-api.md#indicators-docs) in the C++ API.

## 2024-09-26

- Removed `set_fin_res()` and `set_fin_res_wo_c()` methods from the portfolio object in the C++ API.

## 2024-09-24

- Portfolio parameters [v_min/v_max](params-description.md#p.v_min) are now measured in portfolio units.

## 2024-09-16

- Added [TradingDays](params-description.md#p.trading_days) parameter to portfolio schedule settings;
- Added method [mid_price()](c-api.md#market-data-access) for security objects in the C++ API;
- Added [indicator calculation objects](c-api.md#indicators-docs) to the C++ API.

## 2024-06-26

- Removed portfolio parameter `Timetable only stop`.

## 2024-06-20

- Changed and expanded logic of the portfolio parameter [Timetable](params-description.md#p.use_tt).

## 2024-05-13

- Added portfolio parameter [Threshold](params-description.md#p.threshold);
- [Only maker](params-description.md#p.maker) is now a portfolio parameter instead of a security parameter;
- Certain parameters directly affecting the placement of [Is first](params-description.md#is-first) instruments and/or available only for [Is first](params-description.md#is-first) instruments moved into a separate portfolio section `FIRST LEG SETTINGS`.

## 2024-05-02

- Added [tgr_notify()](c-api.md#__tgr_notify__) function for sending notifications to Telegram in the C++ API.

## 2024-04-19

- Added portfolio creator information in the WebSocket API [subscription to available portfolios](api.md#portfolio-list-subscription).

## 2023-12-13

- Removed `extra()` method from the portfolio object in the C++ API;
- Removed `dict_double` structure from the C++ API;
- Removed `__extra` field from portfolios in the WebSocket API;
- Added methods `uf0(), ..., uf19()` and `set_uf0(), ..., set_uf19()` for "user fields" to the [portfolio object](c-api.md#portfolio-field-access) in the C++ API;
- Added `user_value` structure to the C++ API;
- Added iteration over portfolio instruments in the C++ API (`restart_sec_iter()`, `has_next_sec()`, `next_sec()`);
- Added fields `uf0, ..., uf19` to portfolios in the WebSocket API.

## 2022-06-22

- Removed order-per-session limits in FIX connections to the Moscow Exchange equity and FX markets (previously caused by long client codes);
- Binance connections switched to more granular order book feeds.

## 2022-06-15

- Added methods [min_step()](c-api.md#market-data-access) and [lot_round()](c-api.md#market-data-access) for security objects in the C++ API;
- Added methods [funding_rate()](c-api.md#market-data-access) and [funding_time()](c-api.md#market-data-access) for security objects in the C++ API (for some exchanges).

## 2022-02-03

- Added support for Deribit connections with fast market data (requires re-creating the trade connection to Deribit);
- Changed behavior of all market data connections requiring authorization (Exante FIX, LMAX FIX, Bequant FIX, Deribit). Such market data connections are now always tied to the corresponding trade connection and can only be enabled/disabled together;
- Added `extra()` method to the portfolio object in the C++ API;
- Added log output support in the C++ API ([log_* functions](c-api.md#option-functions));
- Added "To0" action on the main page menu;
- Added portfolio field [__extra](api.md) to the WebSocket API for storing custom user settings.
