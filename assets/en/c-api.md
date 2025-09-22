---
title: 10. Formulas in C++
section: 10
---

# Formulas in C++ <Anchor :ids="['cpp']" />

In addition to the standard portfolio settings, there is an optional category of portfolio and instrument settings that allows writing short code fragments in C++. Such fragments are referred to as formulas.  

Wherever there is a choice between using a constant or a formula as a value, the default is a constant (for example, the `ratio` parameter can be specified as a constant [Ratio](params-description.md#s.ratio) or as formulas [Ratio buy formula](params-description.md#s.ratio_b_formula) and [Ratio sell formula](params-description.md#s.ratio_s_formula)).  

Formulas provide a powerful mechanism that significantly increases the variety of strategies that can be implemented with the robot. However, using this mechanism requires certain programming skills. It is recommended to first test portfolios that use formulas in virtual trading mode.  

The following sections describe formula capabilities, how to write and debug them, the restrictions applied to formula code, and general recommendations.


## Formula Editor

Formulas in C++ can be edited in the `Formulas` tab of the portfolio settings window, opened by clicking the <img src="@images/icons/settings_black.svg" width="16" height="16"/> icon.

Formulas can be written either for the portfolio or for individual instruments.

- For the portfolio: [Trade formula](params-description.md#p.trade_formula), [Extra field#1](params-description.md#p.ext_field1_), [Extra field#2](params-description.md#p.ext_field2_).
- For instruments: [Count formula](params-description.md#s.count_formula), [Ratio buy formula](params-description.md#s.ratio_b_formula), [Ratio sell formula](params-description.md#s.ratio_s_formula).

The editor provides a test execution option for the selected formula (`Test` button). In this case, the `-DDEBUG` flag is added at compilation, and a temporary copy of the portfolio is created at formula evaluation. **However, if the formula modifies portfolio fields and a portfolio with the same name exists, changes will apply to that portfolio.**

When `Test` is pressed:
1. The formula is compiled.
2. It is executed on current market data and current portfolio parameters.

Successful compilation and execution on one dataset does **not** guarantee correct execution on other datasets. It is the user’s responsibility to ensure proper formula behavior across all possible portfolio parameters and market data. Common errors in formulas that may cause the robot to crash are described [here](#errors).

Both enabled and disabled formulas can be edited.
 

## Basic Principles of Writing Formulas

- Formulas are written in C++ (C++17 standard). C++ is an unsafe language — incorrect code can cause the robot to crash. You are fully responsible for ensuring the correctness of your code.
- You only write the body of the corresponding functions. Every function must return a value of type `double`.
- Including additional header files, even from the standard library, is not allowed.
- Any operations involving the file system or networking (e.g., opening sockets) are strictly prohibited. If you need to obtain external data, use the [WebSocket API](api.md#api).
- The main trading algorithm is single-threaded. Formulas are executed in the same thread, and their execution blocks the rest of the algorithm. Formulas must not contain long-running operations. They must also not rely on loops waiting for changes in parameters (either from the user or from the algorithm), as no portfolio parameter calculations or updates occur during formula execution.
- The following characters and tokens are not allowed: `\001`, `#nl`, `#tab`.
- The maximum length for each formula field in a portfolio is `12000` bytes (this value can be checked in the [portfolio template](api.html#get_template_id)).  
  This size is a balance between overall platform performance and enough room for typical user code.  
  If you hit the limit:
  - Remove comments (especially those containing non-ASCII characters).
  - Shorten variable names.  
  If space is still insufficient, keep in mind that formulas are intended for small algorithm extensions. For more advanced customization, use the [WebSocket API](api.html#api).
- All strings in formula code must be valid `UTF-8`. All length limits for string fields (portfolios, instruments, etc.) are defined in this documentation and in templates. Limits are specified in bytes.
- In the robot, quantities in orders, trades, and positions are always integers. This design avoids issues with floating-point operations. In the C++ API, quantities and positions are also integers for the same reason.  
  To convert between integers and the fractional values shown on exchange websites (for exchanges that allow fractional quantities), the affected objects include a `lot_size` field:  
  - To convert from integer to fractional: `value * lot_size`  
  - To convert from fractional to integer: `value / lot_size`  
  Portfolio and instrument parameters that use `lot_size` are explicitly marked in their descriptions.
- Exception handling is recommended when writing formulas. If a method described below may throw an exception, its description specifies which exception. Other functions, such as string-related operations, may also throw exceptions. Exception handling allows you to control code behavior in edge cases, reduces logged errors, and lowers the risk of non-ignorable error messages.
- You can access any portfolio, any instrument in a portfolio, and any exchange instrument that is included in at least one of your portfolios.
- You can modify certain portfolio and instrument fields. Changing these values may disrupt the built-in algorithm. To handle emergencies, the portfolio actions menu includes an option to stop all trading and disable all formula calculations: [Stop formulas](getting-started.md#portfolio_actions.stop_formulas).
- A portfolio (`portfolio` structure) includes the `data()` method, which provides access to a dictionary for storing values between formula calls. **These values are not available in the API and are not persisted when the robot is stopped.**
- A portfolio (`portfolio` structure) includes the methods `uf0(), ..., uf19()` and `set_uf0(), ..., set_uf19()`. These provide access to user fields not used by the built-in algorithm. They are intended for user-defined logic. Values of these fields are available through the API and behave like regular portfolio fields but are reserved for user use.


**Important!** If a field value for a financial instrument has not yet been received from the exchange, or if the exchange does not provide this value for the instrument, the result will be `0`.  
For example, on an empty order book you may receive `0` as the bid or ask price. Always check values against zero in situations where it is critical (e.g., division, or calculating the midpoint between bid and ask).  
To distinguish between a true zero bid/ask and a missing price, check the bid/ask volume.

**Important!** Do not rely on undocumented behavior of the robot. Any undocumented functionality may change without notice.

**Important!** If formulas modify portfolio parameters that are also modified by the algorithm, this may lead to unexpected behavior.


## Recommendations for Filtering Market Data <Anchor :ids="['md-filter']" />

- When using best bid/ask prices of instruments, always verify that [these prices actually exist](#bid-offer-check) (i.e., both price and volume must be non-zero).
- When using order books, verify that [the order book is available for the instrument](#order-book-check). It is also recommended to check each side of the order book for emptiness.
- When using best bid/ask prices and/or order books, verify that the best bid price is strictly lower than the best ask price.  
  (On some exchanges, it is possible for the best bid to be greater than or equal to the best ask. However, in such cases it is unclear how trading logic should behave, and you may end up selling cheaper than you are buying.)
- To ensure market data is up-to-date, verify that the [market data connection is in the `online` state](#market-data-check).
- In some cases, verify that [the instrument is currently tradable on the exchange](#trading-status-check).


## Basic Principles of Formula Debugging <Anchor :ids="['cpp-debug']" />

- Debugging is expected to be done using `debug output`.
- Any user-defined output should be written to the log using the [appropriate functions](#cpp-debug-functions).
- Since all data between the robot and the web interface is transmitted over the network, it is recommended to send messages that are "not too large" and "not too frequent."  
  Large volumes of log data generate many messages, which are delivered to the web interface in batches. As a result, log messages may appear significantly later than the actual event.
- To limit the frequency of log writes during debugging, use a [timer](#timers). (Before production use, remove both the timer and log output.)
- Because debugging user code usually depends on market data, it is recommended to test on low-liquidity instruments. With fewer data points, results are easier to analyze.

Example: logging the portfolio fields [Lim_sell](params-description.md#p.lim_s) and [Lim_buy](params-description.md#p.lim_b) once per second:

```C
static timers::timer t(1000000000LL);
if (t.tick())
{
    portfolio p = get_portfolio();
    std::stringstream s;
    s << std::fixed << p.name() << " Lim_sell=" << p.lim_s() << ", Lim_buy=" << p.lim_b();
    log_info(s.str());
}
```

## Accessing Market Data for Financial Instruments <Anchor :ids="['Доступ-к-биржевым-данным-по-финансовым-инструментам']" />

| Function                                                | Description                                                                 |
|---------------------------------------------------------|-----------------------------------------------------------------------------|
| struct security get_security(const std::string& s)      | Returns the instrument by its [SecKey](params-description.md#s.sec_key) `s`. |
| struct security get_security(const char* s)             | Returns the instrument by its [SecKey](params-description.md#s.sec_key) `s`. |
| struct security get_security()                          | Returns the instrument corresponding to the main financial instrument of the current portfolio. |
| struct security get_security(const security_fields& sf) | Returns the instrument corresponding to the specified portfolio instrument. |

Methods of `security`:

| Method                           | Description                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| double theor_price()             | Theoretical price (available only for options).                             |
| double bid()<Anchor hide :ids="['bid-offer-check']" />                    | Best bid price (`0` if unavailable; recommended to check together with `amount_bid`). |
| double offer()                   | Best ask price (`0` if unavailable; recommended to check together with `amount_offer`). |
| double mid_price()               | Midpoint of best bid and best ask. If one side is missing, returns the other. If both are missing, throws `std::range_error`. |
| double exp_date()                | Expiration date, in epoch format.                                           |
| double strike()                  | Strike price (available only for options).                                  |
| long long amount_offer()         | Ask volume in lots.                                                         |
| long long amount_bid()           | Bid volume in lots.                                                         |
| double limit_up()                | Upper price limit allowed by the exchange.                                  |
| double limit_down()              | Lower price limit allowed by the exchange.                                  |
| int trading_status()<Anchor hide :ids="['trading-status-check']" />            | Trading status of the instrument on the exchange (bitmask, possible flags: [TRADING_CAN_PLACE](#__trading_can_place__), [TRADING_CAN_CANCEL](#__trading_can_cancel__), [example](#__sec_status_check__)). |
| int conn_online()<Anchor hide :ids="['market-data-check']" />               | Market data connection status in the robot (bitmask, possible flags: [MARKET_DATA_BESTS_ONLINE](#__market_data_bests_online__), [MARKET_DATA_OB_ONLINE](#__market_data_ob_online__), [example](#__sec_status_check__)). |
| double min_step()                | Minimum price tick size.                                                    |
| double lot_round()               | Number of financial instruments in a standard lot.                          |
| double lot_size()                | Multiplier for converting fractional volumes to integers.                   |
| double funding_rate()            | Funding rate.                                                               |
| long long funding_time()         | Time of the next funding, in epoch format.                                  |
| const spb_commons& spb_common()  | Structure with additional fields (described below).                         |
| order_book orderbook()           | Structure with methods (described below).                                   |

Fields of the `spb_commons` structure (values are non-zero only for instruments from `SPBEX`):

| Name                    | Type       | Description                                                       |
|-------------------------|------------|-------------------------------------------------------------------|
| price_last              | double     | Last trade price.                                                  |
| price_open              | double     | Opening trade price of the session.                               |
| price_close             | double     | Official closing price.                                           |
| price_high              | double     | Highest trade price.                                              |
| price_low               | double     | Lowest trade price.                                               |
| price_auction_close_prev| double     | Previous day’s auction close price.                               |
| price_halt              | double     | Price used to determine trading halts.                            |
| price_official_min_time | long long  | Time of the last update of the current minimum price.             |
| price_indicative        | double     | Indicative market price.                                          |
| price_close_prev        | double     | Official closing price of the previous day.                       |
| price_official          | double     | Official online price (current price).                            |
| price_vwap_day_prev     | double     | VWAP of the main session from the previous day.                   |
| price_vwap_day          | double     | VWAP of the main session of the current day.                      |
| price_current           | double     | Current quote.                                                    |
| price_average           | double     | Average weighted price.                                           |
| time_last               | long long  | Timestamp of the last trade.                                      |
| price_prev_period_close | double     | Last trade price of the previous day.                             |

[_Example:_](#__Example1__) Example of accessing fields of the `spb_commons` structure.

Methods of `order_book`:

| Method                 | Description                                                                                                                                                         |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bool is_available()<Anchor hide :ids="['order-book-check']" /> | Checks whether the order book for the instrument is currently available.                                                                                  |
| bool has_next_bid()    | Returns whether there is another bid in the bid list.                                                                                                               |
| bool has_next_offer()  | Returns whether there is another ask in the ask list.                                                                                                           |
| std::pair next_bid()   | Returns the current bid as a pair: price + volume. If no bid is available, throws `std::out_of_range`. Advances the pointer to the next bid in the list.            |
| std::pair next_offer() | Returns the current ask as a pair: price + volume. If no ask is available, throws `std::out_of_range`. Advances the pointer to the next ask in the list.      |

Conceptually, `order_book` acts as an iterator over two lists: bids and offers. Both lists are traversed from best price toward worse prices. You can only move forward to the next price. To access a previous value, you must store it yourself or reinitialize the `order_book`.

[_Example:_](#__Example8__) Example usage of `order_book` methods.

## Accessing and Modifying Portfolio Instrument Fields <Anchor :ids="['доступ-и-изменение-полей-инструмента-портфеля']" />

| Function                                                                               | Description                                                                                 |
|----------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| struct security_fields get_security_fields(const std::string& p, const std::string& s) | Returns the portfolio instrument with portfolio name `p` and [SecKey](params-description.md#s.sec_key) `s`. |
| struct security_fields get_security_fields()                                           | Returns the main instrument of the current portfolio.                                       |
| struct security_fields get_security_fields(const std::string& s)                       | Returns the instrument of the current portfolio with [SecKey](params-description.md#s.sec_key) `s`. |

Methods of `security_fields`:

| Method                                 | Description                                                                 |
|----------------------------------------|-----------------------------------------------------------------------------|
| order_pool orders()                    | Returns the order pool of the portfolio instrument.                         |
| long long sec_type()                   | Returns the "Exchange" of the portfolio instrument.                         |
| std::string sec_key()                  | Returns the "SecKey" of the portfolio instrument.                           |
| int put()                              | Returns the "Put" value of the portfolio instrument.                        |
| double lot_size()                      | Returns the multiplier for converting fractional volumes to integers.       |
| long long pos()                        | Returns the "Curpos" (current position) of the portfolio instrument.        |
| long long count()                      | Returns the "Count" of the portfolio instrument.                            |
| int depth_ob()                         | Returns the "Depth OB" of the portfolio instrument.                         |
| int ob_c_p_t()                         | Returns the "Calc price OB" of the portfolio instrument.                    |
| int ob_t_p_t()                         | Returns the "Trading price OB" of the portfolio instrument.                 |
| int decimals()                         | Returns the "Decimals" setting of the portfolio instrument.                 |
| double d_pg()                          | Returns the "Date pagination" value of the portfolio instrument.            |
| std::string client_code()              | Returns the "Client code" of the portfolio instrument.                      |
| bool is_first()                        | Returns the "Is first" flag of the portfolio instrument.                    |
| int on_buy()                           | Returns the "On buy" value of the portfolio instrument.                     |
| int leverage()                         | Returns the "Leverage" of the portfolio instrument.                         |
| std::string sec_board()                | Returns the "SecBoard" of the portfolio instrument.                         |
| std::string sec_code()                 | Returns the "SecCode" of the portfolio instrument.                          |
| int count_type()                       | Returns the "Count type" of the portfolio instrument.                       |
| double k()                             | Returns the "k" value of the portfolio instrument.                          |
| bool sle()                             | Returns the "SLE" flag of the portfolio instrument.                         |
| double sl()                            | Returns the "SL" (stop loss) of the portfolio instrument.                    |
| double tp()                            | Returns the "TP" (take profit) of the portfolio instrument.                  |
| double k_sl()                          | Returns the "k_sl" value of the portfolio instrument.                       |
| bool te()                              | Returns the "TE" flag of the portfolio instrument.                          |
| int timer()                            | Returns the "Timer" value of the portfolio instrument.                      |
| int ratio_sign()                       | Returns the "Ratio sign" of the portfolio instrument.                       |
| int ratio_type()                       | Returns the "Ratio type" of the portfolio instrument.                       |
| double ratio_b()                       | Returns the "Ratio" for calculating buys of the portfolio instrument.       |
| double ratio_s()                       | Returns the "Ratio" for calculating sells of the portfolio instrument.      |
| double percent_of_quantity()           | Returns the "Percent of quantity" of the portfolio instrument.              |
| double fin_res_mult()                  | Returns the "Fin res multiplier" of the portfolio instrument.               |
| int comission_sign()                   | Returns the "Commission type" of the portfolio instrument.                  |
| double comission()                     | Returns the "Commission" of the portfolio instrument.                       |
| bool mm()                              | Returns the "MM" flag of the portfolio instrument.                          |
| bool maker()                           | Returns the "Only maker" flag of the portfolio instrument.                  |
| bool move_limits()                     | Returns the "FUT move limits" of the portfolio instrument.                  |
| bool move_limits1()                    | Returns the "SPOT move limits" of the portfolio instrument.                 |
| int depth_ob()                         | Returns the "Depth OB" of the portfolio instrument.                          |
| int ob_c_p_t()                         | Returns the "Calc price OB" of the portfolio instrument.                     |
| int ob_t_p_t()                         | Returns the "Trading price OB" of the portfolio instrument.                  |
| double mc_level_to0()                  | Returns the "Level to0" of the portfolio instrument.                        |
| double mc_level_close()                | Returns the "Level close" of the portfolio instrument.                      |
| long long max_trans_musec()            | Returns the "Max trans time" of the portfolio instrument.                   |
| long long ban_period()                 | Returns the "Ban period" of the portfolio instrument.                       |
| void set_count(long long v)            | Sets the "Count" of the portfolio instrument to `v`.                        |
| void set_depth_ob(int v)               | Sets the "Depth OB" of the portfolio instrument to `v`.                     |
| void set_ob_c_p_t(int v)               | Sets the "Calc price OB" of the portfolio instrument to `v`.                |
| void set_ob_t_p_t(int v)               | Sets the "Trading price OB" of the portfolio instrument to `v`.             |
| void set_decimals(int v)               | Sets the "Decimals" of the portfolio instrument to `v`.                     |
| void set_client_code(const std::string& v) | Sets the "Client code" of the portfolio instrument to `v`.              |
| void set_on_buy(int v)                 | Sets the "On buy" of the portfolio instrument to `v`.                       |
| void set_leverage(int v)               | Sets the "Leverage" of the portfolio instrument to `v`.                     |
| void set_count_type(int v)             | Sets the "Count type" of the portfolio instrument to `v`.                   |
| void set_k(double v)                   | Sets the "k" of the portfolio instrument to `v`.                            |
| void set_sle(bool v)                   | Sets the "SLE" of the portfolio instrument to `v`.                          |
| void set_sl(double v)                  | Sets the "SL" (stop loss) of the portfolio instrument to `v`.               |
| void set_tp(double v)                  | Sets the "TP" (take profit) of the portfolio instrument to `v`.             |
| void set_k_sl(double v)                | Sets the "k_sl" of the portfolio instrument to `v`.                         |
| void set_te(bool v)                    | Sets the "TE" of the portfolio instrument to `v`.                           |
| void set_timer(int v)                  | Sets the "Timer" of the portfolio instrument to `v`.                        |
| void set_ratio_sign(int v)             | Sets the "Ratio sign" of the portfolio instrument to `v`.                   |
| void set_ratio_type(int v)             | Sets the "Ratio type" of the portfolio instrument to `v`.                   |
| void set_percent_of_quantity(double v) | Sets the "Percent of quantity" of the portfolio instrument to `v`.          |
| void set_fin_res_mult(double v)        | Sets the "Fin res multiplier" of the portfolio instrument to `v`.           |
| void set_comission_sign(int v)         | Sets the "Commission type" of the portfolio instrument to `v`.              |
| void set_comission(double v)           | Sets the "Commission" of the portfolio instrument to `v`.                   |
| void set_mm(bool v)                    | Sets the "MM" of the portfolio instrument to `v`.                           |
| void set_maker(bool v)                 | Sets the "Only maker" of the portfolio instrument to `v`.                   |
| void set_move_limits(bool v)           | Sets the "FUT move limits" of the portfolio instrument to `v`.              |
| void set_move_limits1(bool v)          | Sets the "SPOT move limits" of the portfolio instrument to `v`.             |
| void set_depth_ob(int v)               | Sets the "Depth OB" of the portfolio instrument to `v`.            |
| void set_ob_c_p_t(int v)               | Sets the "Calc price OB" of the portfolio instrument to `v`.       |
| void set_ob_t_p_t(int v)               | Sets the "Trading price OB" of the portfolio instrument to `v`.    |
| void set_mc_level_to0(double v)        | Sets the "Level to0" of the portfolio instrument to `v`.                    |
| void set_mc_level_close(double v)      | Sets the "Level close" of the portfolio instrument to `v`.                  |
| void set_max_trans_musec(long long v)  | Sets the "Max trans time" of the portfolio instrument to `v`.               |
| void set_ban_period(long long v)       | Sets the "Ban period" of the portfolio instrument to `v`.                   |

Methods of `order_pool`:

| Method             | Description                                                                                                                                   |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| bool has_next()    | Returns whether there is another order in the order list.                                                                                     |
| order_item next()  | Returns the current order (throws `std::out_of_range` if none exists) and advances the pointer to the next order in the list.                  |

Conceptually, `order_pool` acts as an iterator over the list of orders of a portfolio instrument. You can only move forward to the next order. To access a previous one, store it yourself or reinitialize the `order_pool`.

Fields of `order_item`:

| Name        | Type       | Description                |
|-------------|------------|----------------------------|
| price       | double     | Price                      |
| amount      | long long  | Quantity                   |
| amount_rest | long long  | Remaining quantity         |
| dir         | int        | Direction                  |
| status      | int        | Status                     |

`order_item` represents an order created by the robot. Possible values for `dir` and `status` are defined in constants.

[_Example:_](#__Example9__) Example usage of `order_pool` and `order_item`.

## Accessing and Modifying Portfolio Fields

| Function                                             | Description                                |
|------------------------------------------------------|--------------------------------------------|
| struct portfolio get_portfolio(const std::string& p) | Returns the portfolio with name `p`.       |
| struct portfolio get_portfolio()                     | Returns the current portfolio.             |

Methods of `portfolio`:

| Method                                                      | Description                                                                 |
|-------------------------------------------------------------|-----------------------------------------------------------------------------|
| void restart_sec_iter()                                     | Initializes the iterator. (For a single portfolio, nested iterators cannot be used. The iteration order of instruments is **not** defined.) |
| bool has_next_sec()                                         | Returns whether there are more instruments in the portfolio’s instrument list. |
| security_fields next_sec()                                  | Returns the next instrument in the portfolio. (See [iteration example](#__Example3__)). The iteration order is **not** defined and does not depend on instrument addition order or settings. |
| deal_item deal(const std::string& s)                        | Returns the trade for the instrument with SecKey `s` (available only in Trade formula, i.e., at the moment of trade execution). If no trade occurred for this instrument, both `amount` and `price` will be zero. |
| deal_item deal(const security_fields& sf)                   | Returns the trade for the instrument `sf` (available only in Trade formula). If no trade occurred for this instrument, both `amount` and `price` will be zero. |
| struct security_fields security_field(const std::string& s) | Returns the instrument of this portfolio with SecKey `s`. |
| struct security_fields security_field()                     | Returns the main instrument of the current portfolio. |
| std::map<std::string, double>& data()                       | Dictionary for storing user-defined values. **Not persisted** when the robot is stopped. |
| const user_value& uf0()                                     | Returns user-defined field #0. (User fields are not used by the built-in algorithm.) |
| ...                                                         | ...                                                                         |
| const user_value& uf19()                                    | Returns user-defined field #19. (User fields are not used by the built-in algorithm.) |
| std::string name()                                          | Returns the portfolio’s "Name".                                            |
| int decimals()                                              | Returns the portfolio’s "Decimals".                                        |
| std::string comment()                                       | Returns the portfolio’s "Comment".                                         |
| std::string color()                | Returns the portfolio’s "Color" in hex format [valid CSS color](https://www.w3schools.com/colors/default.asp). |
| bool re_sell()                      | Returns the portfolio’s "re_sell".                                                                           |
| bool re_buy()                       | Returns the portfolio’s "re_buy".                                                                            |
| bool use_tt()                       | Returns the portfolio’s "Use timetable".                                                                     |
| int portfolio_type()                | Returns the portfolio’s "Type".                                                                              |
| long long v_in_l()                  | Returns the portfolio’s "v_in_left".                                                                         |
| long long v_in_r()                  | Returns the portfolio’s "v_in_right".                                                                        |
| long long v_out_l()                 | Returns the portfolio’s "v_out_left".                                                                        |
| long long v_out_r()                 | Returns the portfolio’s "v_out_right".                                                                       |
| long long v_min()                   | Returns the portfolio’s "v_min".                                                                             |
| long long v_max()                   | Returns the portfolio’s "v_max".                                                                             |
| double k()                          | Returns the portfolio’s "K".                                                                                 |
| double k1()                         | Returns the portfolio’s "K1".                                                                                |
| double k2()                         | Returns the portfolio’s "K2".                                                                                |
| double tp()                         | Returns the portfolio’s "TP".                                                                                |
| bool equal_prices()                 | Returns the portfolio’s "Equal prices".                                                                      |
| bool always_limits_timer()          | Returns the portfolio’s "Always timer".                                                                      |
| double lim_s()                      | Returns the portfolio’s "Lim_Sell".                                                                          |
| double lim_b()                      | Returns the portfolio’s "Lim_Buy".                                                                           |
| double delta()                      | Returns the portfolio’s "Delta".                                                                             |
| double first_delta()                | Returns the portfolio’s "First delta".                                                                       |
| long long mkt_volume()              | Returns the portfolio’s "Market volume".                                                                     |
| int type_trade()                    | Returns the portfolio’s "Type trade".                                                                        |
| int price_type()                    | Returns the portfolio’s "Type price".                                                                        |
| bool simply_first()                 | Returns the portfolio’s "Simply first".                                                                      |
| bool quote()                        | Returns the portfolio’s "Quote".                                                                             |
| double percent()                    | Returns the portfolio’s "Percent".                                                                           |
| int timer()                         | Returns the portfolio’s "Limits timer".                                                                      |
| bool to0()                          | Returns the portfolio’s "To0".                                                                               |
| bool virtual_0_pos()                | Returns the portfolio’s "Virt 0 pos".                                                                        |
| double opened()                     | Returns the portfolio’s "Opened".                                                                            |
| double opened_comission()           | Returns the portfolio’s "Commission sum".                                                                    |
| double fin_res_wo_c()               | Returns the portfolio’s "Fin res wo C".                                                                      |
| double fin_res()                    | Returns the portfolio’s "Fin res".                                                                           |
| long long pos()                     | Returns the portfolio’s "Pos".                                                                               |
| int n_perc_fill()                   | Returns the portfolio’s "n_perc_fill".                                                                       |
| int max_not_hedged()                | Returns the portfolio’s "Max not hedged".                                                                    |
| double return_first()               | Returns the portfolio’s "Return first".                                                                      |
| double price_check()                | Returns the portfolio’s "Price check".                                                                       |
| int hedge_after()                   | Returns the portfolio’s "Hedge (sec)".                                                                       |
| long long overlay()                 | Returns the portfolio’s "Overlay".                                                                           |
| double ext_field1()                 | Returns the portfolio’s "Extra field#1".                                                                     |
| double ext_field2()                 | Returns the portfolio’s "Extra field#2".                                                                     |
| double sell()                       | Returns the portfolio’s "Sell".                                                                              |
| double buy()                        | Returns the portfolio’s "Buy".                                                                               |
| double price_s()                    | Returns the portfolio’s "Price_s".                                                                           |
| double price_b()                    | Returns the portfolio’s "Price_b".                                                                           |
| bool is_sell_ok()                   | Checks validity of the portfolio’s "Sell".                                                                   |
                                                                                 |
| bool is_buy_ok()                   | Checks validity of the portfolio’s "Buy".                                                     |
| bool is_price_s_ok                  | Checks validity of the portfolio’s "Price_s".                                                 |
| bool is_price_b_ok                  | Checks validity of the portfolio’s "Price_b".                                                 |
| void set_uf0(const user_value& v)   | Sets user-defined field #0. (User fields are not used by the built-in algorithm.)              |
| ...                                 | ...                                                                                           |
| void set_uf19(const user_value& v)  | Sets user-defined field #19. (User fields are not used by the built-in algorithm.)             |
| void set_decimals(int v)            | Sets the portfolio’s "Decimals" to `v`.                                                       |
| void set_comment(const std::string& v) | Sets the portfolio’s "Comment" to `v`.                                                    |
| void set_color(const std::string& v)   | Sets the portfolio’s "Color" to `v` (hex format [valid CSS color](https://www.w3schools.com/colors/default.asp)). |
| void set_re_sell(bool v)            | Sets the portfolio’s "re_sell" to `v`.                                                        |
| void set_re_buy(bool v)             | Sets the portfolio’s "re_buy" to `v`.                                                         |
| void set_use_tt(bool v)             | Sets the portfolio’s "Use timetable" to `v`.                                                  |
| void set_portfolio_type(int v)      | Sets the portfolio’s "Type" to `v`.                                                           |
| void set_v_in_l(long long v)        | Sets the portfolio’s "v_in_left" to `v`.                                                      |
| void set_v_in_r(long long v)        | Sets the portfolio’s "v_in_right" to `v`.                                                     |
| void set_v_out_l(long long v)       | Sets the portfolio’s "v_out_left" to `v`.                                                     |
| void set_v_out_r(long long v)       | Sets the portfolio’s "v_out_right" to `v`.                                                    |
| void set_v_min(long long v)         | Sets the portfolio’s "v_min" to `v`.                                                          |
| void set_v_max(long long v)         | Sets the portfolio’s "v_max" to `v`.                                                          |
| void set_k(double v)                | Sets the portfolio’s "K" to `v`.                                                              |
| void set_k1(double v)               | Sets the portfolio’s "K1" to `v`.                                                             |
| void set_k2(double v)               | Sets the portfolio’s "K2" to `v`.                                                             |
| void set_tp(double v)               | Sets the portfolio’s "TP" to `v`.                                                             |
| void set_equal_prices(bool v)       | Sets the portfolio’s "Equal prices" to `v`.                                                   |
| void set_always_limits_timer(bool v)| Sets the portfolio’s "Always timer" to `v`.                                                   |
| void set_lim_s(double v)            | Sets the portfolio’s "Lim_Sell" to `v`.                                                       |
| void set_lim_b(double v)            | Sets the portfolio’s "Lim_Buy" to `v`.                                                        |
| void set_delta(double v)            | Sets the portfolio’s "Delta" to `v`.                                                          |
| void set_first_delta(double v)      | Sets the portfolio’s "First delta" to `v`.                                                    |
| void set_mkt_volume(long long v)    | Sets the portfolio’s "Market volume" to `v`.                                                  |
| void set_type_trade(int v)          | Sets the portfolio’s "Type trade" to `v`.                                                     |
| void set_price_type(int v)          | Sets the portfolio’s "Type price" to `v`.                                                     |
| void set_simply_first(bool v)       | Sets the portfolio’s "Simply first" to `v`.                                                   |
| void set_quote(bool v)              | Sets the portfolio’s "Quote" to `v`.                                                          |
| void set_percent(double v)          | Sets the portfolio’s "Percent" to `v`.                                                        |
| void set_timer(int v)               | Sets the portfolio’s "Limits timer" to `v`.                                                   |
| void set_to0(bool v)                | Sets the portfolio’s "To0" to `v`.                                                            |
| void set_virtual_0_pos(bool v)      | Sets the portfolio’s "Virt 0 pos" to `v`.                                                     |
| void set_opened(double v)           | Sets the portfolio’s "Opened" to `v`.                                                         |
| void set_opened_comission(double v) | Sets the portfolio’s "Commission sum" to `v`.                                                 |
| void set_n_perc_fill(int v)         | Sets the portfolio’s "n_perc_fill" to `v`.                                                    |
| void set_max_not_hedged(int v)      | Sets the portfolio’s "Max not hedged" to `v`.                                                 |
| void set_return_first(double v)     | Sets the portfolio’s "Return first" to `v`.                                                   |
| void set_price_check(double v)      | Sets the portfolio’s "Price check" to `v`.                                                    |
| void set_hedge_after(int v)         | Sets the portfolio’s "Hedge (sec)" to `v`.                                                    |
| void set_overlay(long long v)       | Sets the portfolio’s "Overlay" to `v`.                                                        |

To access "user fields" by index, arrays are available: <Anchor :ids="['user-fields']"/>
```C
typedef const user_value& (portfolio::*gUF)() const;
static const gUF uf[] = {&portfolio::uf0, &portfolio::uf1, &portfolio::uf2, &portfolio::uf3, &portfolio::uf4,
                         &portfolio::uf5, &portfolio::uf6, &portfolio::uf7, &portfolio::uf8, &portfolio::uf9,
                         &portfolio::uf10, &portfolio::uf11, &portfolio::uf12, &portfolio::uf13, &portfolio::uf14,
                         &portfolio::uf15, &portfolio::uf16, &portfolio::uf17, &portfolio::uf18, &portfolio::uf19};

typedef void (portfolio::*sUF)(const user_value&);
static const sUF set_uf[] = {&portfolio::set_uf0, &portfolio::set_uf1, &portfolio::set_uf2, &portfolio::set_uf3, &portfolio::set_uf4,
                             &portfolio::set_uf5, &portfolio::set_uf6, &portfolio::set_uf7, &portfolio::set_uf8, &portfolio::set_uf9,
                             &portfolio::set_uf10, &portfolio::set_uf11, &portfolio::set_uf12, &portfolio::set_uf13, &portfolio::set_uf14,
                             &portfolio::set_uf15, &portfolio::set_uf16, &portfolio::set_uf17, &portfolio::set_uf18, &portfolio::set_uf19};
```

[_Example:_](#__Example6__) Example of accessing and modifying "user fields" by index.

Fields of `deal_item`:

| Name   | Type       | Description                                                |
|--------|------------|------------------------------------------------------------|
| price  | double     | Weighted average price of the trade.                       |
| amount | long long  | Total trade volume in lots.                                |
| dir    | int        | Trade direction: `1` – buy, `2` – sell.                    |

Constructors of `user_value`:

| Constructor                                        | Description                                                               |
|----------------------------------------------------|---------------------------------------------------------------------------|
| user_value()                                       | Creates an empty user-defined value.                                      |
| user_value(double value, const std::string& caption)| Creates a user-defined value with the specified value and caption.        |
| user_value(double value)                           | Creates a user-defined value with the specified value only.               |
| user_value(const std::string& caption)             | Creates a user-defined value with the specified caption only.             |

Methods of `user_value`:

| Method                                       | Description                                                               |
|----------------------------------------------|---------------------------------------------------------------------------|
| double value() const                         | Returns the value.                                                        |
| void set_value(double value)                 | Sets the value.                                                           |
| bool has_value() const                       | Checks whether a value is set.                                            |
| std::string caption() const                  | Returns the caption.                                                      |
| void set_caption(const std::string& caption) | Sets the caption.                                                         |
| bool has_caption() const                     | Checks whether a caption is set.                                          |
| user_value& operator=(const user_value& v)   | Copy operator. Only non-empty values are copied.                          |

[_Example:_](#__Example2__) Example usage of the `user_value` structure.

## Accessing and Modifying Positions of a Transaction Connection

| Function                                               | Description                            |
|--------------------------------------------------------|----------------------------------------|
| struct connection get_connection(const std::string& c) | Returns the connection with name `c`.  |

Methods of `connection`:

| Method                              | Description                                                                                                                    |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| sec_item sec(const std::string& s)  | Returns position information for a security on the exchange (use `SecBoard` from **5.5.1. Instrument position parameters**).    |
| coin_item sec(const std::string& s) | Returns balance information for a currency on the exchange (use `Currency` from **5.5.2. Currency position parameters**).      |
| bool is_active()                    | Returns whether the connection to the exchange is active.                                                                      |

Methods of `sec_item`:

| Method                        | Description                                |
|-------------------------------|--------------------------------------------|
| long long pos()               | Returns the "Pos" field of the security.   |
| long long robot_pos()         | Returns the "Robot pos" field of the security. |
| double mark_price()           | Returns the "Mark. price" field of the security. |
| double liq_price()            | Returns the "Liq. price" field of the security. |
| long long pos_lag()           | Returns the "Pos lag" field of the security. |
| bool pos_eq()                 | Returns the "Check equality" field of the security. |
| bool tgr()                    | Returns the "Tgr notify" field of the security. |
| void set_pos_lag(long long v) | Sets the "Pos lag" field of the security to `v`. |
| void set_pos_eq(bool v)       | Sets the "Check equality" field of the security to `v`. |
| void set_tgr(bool v)          | Sets the "Tgr notify" field of the security to `v`. |

Methods of `coin_item`:

| Method                     | Description                               |
|----------------------------|-------------------------------------------|
| double pos()               | Returns the "Pos" (or "Limit") field of the currency. |
| double robot_pos()         | Returns the "Robot pos" field of the currency. |
| double pos_lag()           | Returns the "Pos lag" field of the currency. |
| bool pos_eq()              | Returns the "Check equality" field of the currency. |
| bool tgr()                 | Returns the "Tgr notify" field of the currency. |
| void set_pos_lag(double v) | Sets the "Pos lag" field of the currency to `v`. |
| void set_pos_eq(bool v)    | Sets the "Check equality" field of the currency to `v`. |
| void set_tgr(bool v)       | Sets the "Tgr notify" field of the currency to `v`. |

## Additional Classes, Structures, Functions, and Constants

### Constants

| Name           | Type        | Value/Description                                                                 |
|----------------|-------------|-----------------------------------------------------------------------------------|
| BUY            | int         | 1, trading direction – buy.                                                       |
| SELL           | int         | 2, trading direction – sell.                                                      |
| FREE           | int         | 0, order inactive.                                                                |
| ADDING         | int         | 1, order submitted to the exchange.                                               |
| RUNNING        | int         | 2, confirmation received that the order is active.                                |
| DELETING       | int         | 4, order cancellation submitted to the exchange.                                  |
| FIRST_DELETING | int         | 5, cancellation of a quoting order submitted to the exchange.                     |
| SL_DELETING    | int         | 6, cancellation of a stop order submitted to the exchange.                        |
| MOVING         | int         | 7, modification request for an order submitted to the exchange.                   |
| ADD_ERROR      | int         | 99, order placement error.                                                        |
| TRADING_HALT   | int         | 0, order placement and cancellation disabled.                                     |
| <Anchor hide :ids="['__trading_can_place__']"/>TRADING_CAN_PLACE  | int | 1, order placement allowed.                       |
| <Anchor hide :ids="['__trading_can_cancel__']"/>TRADING_CAN_CANCEL | int | 2, order cancellation allowed.                   |
| MARKET_DATA_OFFLINE   | int   | 0, market data connection for the instrument is offline.                          |
| <Anchor hide :ids="['__market_data_bests_online__']"/>MARKET_DATA_BESTS_ONLINE | int | 1, market data connection with best bid/ask is online. |
| <Anchor hide :ids="['__market_data_ob_online__']"/>MARKET_DATA_OB_ONLINE       | int | 2, market data connection with order books is online. |
| NAME           | std::string | Name of the current portfolio.                                                     |
| <Anchor hide :ids="['__null_value__']"/>NULL_VALUE     | long long   | Empty value for numeric fields, equal to `-(1 << 53)`. |

### Functions

| Function                                                                                         | Description                                                                 |
|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| long long nanosec_date_time()                                                                   | Returns the current epoch time in nanoseconds.                              |
| struct tm global_tm()                                                                           | Returns the current global time.                                            |
| day_time get_day_time()                                                                         | Returns the current time of day.                                            |
| void log_info(const std::string& msg) <Anchor hide :ids="['cpp-debug-functions']" />            | Sends a log message with level INFO.                                        |
| void log_warn(const std::string& msg)                                                           | Sends a log message with level WARNING.                                     |
| void log_error(const std::string& msg)                                                          | Sends a log message with level ERROR.                                       |
| <Anchor :ids="['__tgr_notify__']"/> bool tgr_notify(int slot, const std::string& msg, int timeout) | Sends a log message with level NOTIFICATION and a Telegram alert. Messages must not be sent more frequently than once per `timeout` seconds (`[10, 2000000000]`). The `slot` parameter is the notification slot ID (`[0, 4]`) for which the timeout will be applied. |

### Structures

The `day_time` structure (time of day in hours, minutes, seconds): <Anchor :ids="['day_time']"/>

| Constructor                    | Description                                         |
|--------------------------------|-----------------------------------------------------|
| day_time()                     | Creates an object with time `00:00:00`.             |
| day_time(int h, int m, int s)  | Creates an object with time `h:m:s`.                |
| day_time(const day_time& dt)   | Copy constructor.                                   |

| Field | Type | Description                      |
|-------|------|----------------------------------|
| h     | int  | Hours (`0` to `23`).             |
| m     | int  | Minutes (`0` to `59`).           |
| s     | int  | Seconds (`0` to `59`).           |

| Function/Operator                                | Description                                                 |
|--------------------------------------------------|-------------------------------------------------------------|
| int to_sec() const                               | Returns the time in seconds, i.e., `h * 3600 + m * 60 + s`. |
| bool operator<(const day_time& a, const day_time& b)  | Operator `<`.                                               |
| bool operator<=(const day_time& a, const day_time& b) | Operator `<=`.                                              |
| bool operator>(const day_time& a, const day_time& b)  | Operator `>`.                                               |
| bool operator>=(const day_time& a, const day_time& b) | Operator `>=`.                                              |
| bool operator==(const day_time& a, const day_time& b) | Operator `==`.                                              |
| bool operator!=(const day_time& a, const day_time& b) | Operator `!=`.                                              |

[_Example:_](#__Example4__) Example of using the `day_time` structure.

### Classes

**Important:** All classes described below belong to the `timers` namespace.

Class `timer` (measures time intervals not shorter than the specified nanoseconds): <Anchor hide :ids="['timers']"/>

| Constructor                                                      | Description                                                                 |
|------------------------------------------------------------------|-----------------------------------------------------------------------------|
| timer(unsigned long long timeout, bool initialized = false)      | Creates an object with a timer interval of `timeout` nanoseconds. If `initialized` is true, the start time is set to the current time; otherwise, the start time is undefined and the first `timeout` will trigger immediately. |

| Function/Method | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| bool tick()     | If at least `timeout` nanoseconds have passed since the last call, returns true and updates the last call time. |

---

Class `day_timer` (measures daily intervals and triggers no earlier than at the specified time):

| Constructor                                                        | Description                                                                 |
|--------------------------------------------------------------------|-----------------------------------------------------------------------------|
| day_timer(int h, int m, int s, bool initialized = false)           | Creates an object with a trigger time set to the next day no earlier than `h:m:s`. If `initialized` is true, the start time is set to the current time; otherwise, the start time is undefined and the first timeout may trigger without a day change. |
| day_timer(int h, int m, bool initialized = false)                  | Creates an object with a trigger time set to the next day no earlier than `h:m:00`. If `initialized` is true, the start time is set to the current time; otherwise, the start time is undefined and the first timeout may trigger without a day change. |
| day_timer(const [day_time](#day_time)& dt, bool initialized = false)| Creates an object with a trigger time set to the next day no earlier than `dt`. If `initialized` is true, the start time is set to the current time; otherwise, the start time is undefined and the first timeout may trigger without a day change. |

| Function/Method | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| bool tick()     | If the day has changed and the current time is greater than or equal to the specified time, returns true and updates the stored day. |

[_Example:_](#__Example7__) Examples of using the `timer` and `day_timer` classes.

### Option Functions

#### _“Smart” Functions_

**double S_delta(const std::string& s, double rate = 0)**  
**double P_delta(const std::string& p, double rate = 0)**  
Calculates the delta of an instrument or a portfolio with refinancing rate `rate` (specified in percent).

**double S_gamma(const std::string& s, double rate = 0)**  
**double P_gamma(const std::string& p, double rate = 0)**  
Calculates the gamma of an instrument or a portfolio with refinancing rate `rate` (specified in percent).

**double S_vega(const std::string& s, double rate = 0)**  
**double P_vega(const std::string& p, double rate = 0)**  
Calculates the vega of an instrument or a portfolio with refinancing rate `rate` (specified in percent).

**double S_theta(const std::string& s, double rate = 0)**  
**double P_theta(const std::string& p, double rate = 0)**  
Calculates the theta of an instrument or a portfolio with refinancing rate `rate` (specified in percent).

**double S_iv(const std::string& s, double rate = 0)**  
**double P_iv(const std::string& p, double rate = 0)**  
Calculates the implied volatility of an option or a portfolio with refinancing rate `rate` (specified in percent).

**double S_price(const std::string& s, double rate = 0)**  
Calculates the fair price of an option with refinancing rate `rate` (specified in percent).

Arguments for the functions above:

| Name  | Description                      |
|-------|----------------------------------|
| s     | SecKey of the instrument.        |
| p     | Portfolio name.                  |
| rate  | Refinancing rate, in percent.    |


#### _“Simple” Functions_

**double C(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the fair price of a `call` option.

**double P(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the fair price of a `put` option.

**double CDELTA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the delta of a `call` option.

**double PDELTA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the delta of a `put` option.

**double CGAMMA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the gamma of a `call` option.

**double PGAMMA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the gamma of a `put` option.

**double CVEGA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the vega of a `call` option.

**double PVEGA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the vega of a `put` option.

**double CTHETA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the theta of a `call` option.

**double PTHETA(double futPrice, double strike, double expDate, double iv, double rate = 0)**  
Calculates the theta of a `put` option.

**double CIV(double futPrice, double strike, double expDate, double call, double rate = 0)**  
Calculates the implied volatility of a `call` option.

**double PIV(double futPrice, double strike, double expDate, double put, double rate = 0)**  
Calculates the implied volatility of a `put` option.

Arguments for the functions above:

| Name     | Description                                 |
|----------|---------------------------------------------|
| futPrice | Price of the underlying asset.              |
| strike   | Option strike price.                        |
| expDate  | Option expiration date in epoch format.     |
| iv       | Implied volatility.                         |
| call/put | Option price.                               |
| rate     | Refinancing rate, in percent.               |

## Indicators and Mathematical Statistics <Anchor :ids="['indicators-docs']"/>

### General Provisions

#### Specifics of Objects Used for Indicator Calculation

Indicators are calculated using objects of corresponding classes. Since objects are created inside functions, to avoid recreating and reinitializing them each time, they should always be created as `static`.  

If indicator calculation requires historical data and the current history is shorter than the specified `length`), the actual number of available historical values will be used instead.

All "formulas" in the robot are recalculated on any update to the order book of any portfolio instrument, and once per second. You can attempt to add values for indicator recalculation quite frequently. A new value will be considered and trigger a recalculation only if:  

$[\frac{t}{\mathit{timeframe}}] \times \mathit{timeframe} > t_{last}$  

where:  
- $t$ = current time,  
- $\mathit{timeframe}$ = timeframe used for the indicator,  
- $t_{last}$ = time of the last value currently used in indicator calculation.  

Effectively, the indicator is built using the "opening price" of values on the selected timeframe.  

**Important:** All indicator history is stored only in RAM. Upon robot restart, the history will be lost and must be rebuilt from scratch. Therefore, it is strongly recommended not to use long timeframes, as rebuilding the history may take considerable time. 

**Important:** All classes described below belong to the `indicators` namespace.  

[_Examples of using indicators in user code._](#__Example5__)

---

#### `TradingDays` and `schedule` for Indicators

Indicator calculations typically use prices received from the exchange. If a financial instrument trades 24/7, there are usually no issues with price data. However, for instruments with limited trading hours, it is essential to filter incoming data to avoid recalculating indicators on "zero" or "invalid" prices (e.g., during non-trading periods, auctions, or when the order book is empty).
To filter such data, indicator objects support two mechanisms:  
- `TradingDays` – filters by trading days of the week.  
- `schedule` – filters by time intervals within each day (the same schedule applies to all days).  

By default, an indicator’s `TradingDays` is linked to `TradingDays` of the portfolio in which the indicator is used. This means that if the portfolio’s `TradingDays` changes, the indicator’s `TradingDays` will also change (even if the portfolio itself does not use `TradingDays`).  

If a custom `TradingDays` is required, you can explicitly set it for the indicator. `TradingDays` is a bitmask of trading days of the week, with days numbered starting from zero. The 0th bit (counting from right to left) corresponds to Sunday:  
- Sunday = `1 << 0`  
- Monday = `1 << 1`  
- … and so on.  

By default, an indicator’s `schedule` is empty, meaning no schedule is set and no time filtering is applied.  
If `schedule` is set, it represents a list of non-overlapping time intervals. Each interval is a pair of times (start and end, both inclusive) within which the indicator will be calculated.

#### Object `indicators::interval`

**Constructors of `interval`:**

| Constructor                                | Description                                                                 |
|--------------------------------------------|-----------------------------------------------------------------------------|
| interval(day_time b, day_time e)           | Creates a time interval with start at `b` and end at `e`. The condition `b < e` must hold; otherwise, a `std::invalid_argument` exception is thrown. |

---

#### Object `indicators::schedule`

**Constructors of `schedule`:**

| Constructor                                | Description                                                                 |
|--------------------------------------------|-----------------------------------------------------------------------------|
| schedule()                                 | Creates an empty schedule.                                                  |
| schedule(std::vector&lt;interval&gt; sch)  | Creates a schedule initialized with a list of non-overlapping intervals sorted in ascending order. If intervals overlap or are unsorted, a `std::invalid_argument` exception is thrown. |
| schedule(const schedule& sch)              | Copy constructor.                                                           |

**Methods of `schedule`:**

| Method                         | Description                                                                 |
|--------------------------------|-----------------------------------------------------------------------------|
| bool is_in(const day_time& dt) const | Checks whether the specified time is within one of the schedule intervals. |

---

#### Constants

| Name        | Type | Value/Description                                                                 |
|-------------|------|-----------------------------------------------------------------------------------|
| WD_SUNDAY   | int  | `1 << 0`, Sunday.                                                                 |
| WD_MONDAY   | int  | `1 << 1`, Monday.                                                                 |
| WD_TUESDAY  | int  | `1 << 2`, Tuesday.                                                                |
| WD_WEDNESDAY| int  | `1 << 3`, Wednesday.                                                              |
| WD_THURSDAY | int  | `1 << 4`, Thursday.                                                               |
| WD_FRIDAY   | int  | `1 << 5`, Friday.                                                                 |
| WD_SATURDAY | int  | `1 << 6`, Saturday._                                                              |
| WHOLE_WEEK | int | `WD_SUNDAY | WD_MONDAY | WD_TUESDAY | WD_WEDNESDAY | WD_THURSDAY | WD_FRIDAY | WD_SATURDAY`, trade all week |
| WORK_WEEK | int | `WD_MONDAY | WD_TUESDAY | WD_WEDNESDAY | WD_THURSDAY | WD_FRIDAY`, trade Monday through Friday |

### Simple Moving Average (`SMA`)

The formula is:

$$\mathit{SMA}_t = \frac{1}{n} \sum_{i=0}^{n - 1}p_{t-i}$$

where:  
- $\mathit{SMA}_t$ — SMA value at time $t$,  
- $p_{t-i}$ — source value (e.g., price) at time $t-i$,  
- $n$ — number of source values used for calculation (`SMA`).  

---

**Constructors of `SMA`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| SMA()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| SMA(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| SMA(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `SMA`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_{i}$ values are taken. |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_{i}$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Exponential Moving Average (`EMA`)

The formula is:

$$\mathit{EMA}_t = \frac{2}{n + 1} (p_t - \mathit{EMA}_{t-1}) + \mathit{EMA}_{t-1}$$

where:  
- $\mathit{EMA}_t$ — EMA value at time $t$,  
- $\mathit{EMA}_{t-1}$ — EMA value at the previous time $t-1$,  
- $p_t$ — source value (e.g., price) at time $t$,  
- $n$ — number of source values used for calculation (`EMA`).  

---

**Constructors of `EMA`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| EMA()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| EMA(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| EMA(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `EMA`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Maximum over Interval (`Max`)

The formula is:

$$\mathit{Max}_t = \max(p_{t}, p_{t-1}, ... , p_{t-n+1})$$

where:  
- $\mathit{Max}_t$ — value of the indicator at time $t$,  
- $p_t$ — source value (e.g., price) at time $t$,  
- $p_i$ — source value at time $i$,  
- $n$ — number of source values used for calculation (`Max`).  

---

**Constructors of `Max`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| Max()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| Max(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| Max(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `Max`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Minimum over Interval (`Min`)

The formula is:

$$\mathit{Min}_t = \min(p_{t}, p_{t-1}, ... , p_{t-n+1})$$

where:  
- $\mathit{Min}_t$ — value of the indicator at time $t$,  
- $p_t$ — source value (e.g., price) at time $t$,  
- $n$ — number of source values used for calculation (`Min`).  

---

**Constructors of `Min`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| Min()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| Min(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| Min(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `Min`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Variance (`Var`)

The formula is:

$$\mathit{Var}_t = \frac{1}{n}\sum_{i=0}^{n-1}{\left( p_{t - i} - \overline{p} \right) ^2}$$

where:  
- $\mathit{Var}_t$ — value of the indicator at time $t$,  
- $\overline{p} = \frac{1}{n}\sum_{i=0}^{n-1}{p_{t - i}}$ ,  
- $p_{t-i}$ — source value (e.g., price) at time $t-i$,  
- $n$ — number of source values used for calculation (`Var`).  

---

**Constructors of `Var`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| Var()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| Var(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| Var(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `Var`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Standard Deviation (`StdDev`)

The formula is:

$$\mathit{StdDev}_t = \sqrt{\frac{1}{n}\sum_{i=0}^{n-1}{\left( p_{t - i} - \overline{p} \right) ^2}}$$

where:  
- $\mathit{StdDev}_t$ — value of the indicator at time $t$,  
- $\overline{p} = \frac{1}{n}\sum_{i=0}^{n-1}{p_{t - i}}$ ,  
- $p_{t-i}$ — source value (e.g., price) at time $t-i$,  
- $n$ — number of source values used for calculation (`StdDev` ).  

---

**Constructors of `StdDev`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| StdDev()                           | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| StdDev(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| StdDev(schedule sch)               | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `StdDev`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Bollinger Bands (`BB`)

Bollinger Bands consist of three values, calculated as follows:

$$\mathit{ML}_t = \frac{1}{n} \sum_{i=0}^{n - 1}p_{t-i}$$

$$\mathit{TL}_t = \mathit{ML}_t + d \times \mathit{StdDev}_t$$

$$\mathit{BL}_t = \mathit{ML}_t - d \times \mathit{StdDev}_t$$

where:  
- $\mathit{ML}_t$, $\mathit{TL}_t$, $\mathit{BL}_t$ — middle, top, and bottom lines at time $t$,  
- $\mathit{StdDev}_t = \sqrt{\frac{1}{n}\sum_{i=0}^{n-1}{\left( p_{t - i} - \overline{p} \right) ^2}}$ ,  
- $\overline{p} = \frac{1}{n}\sum_{i=0}^{n-1}{p_{t - i}}$ ,  
- $p_{t-i}$ — source value (e.g., price) at time $t-i$,  
- $d$ — deviation multiplier,  
- $n$ — number of source values used for calculation (`BB`).  

---

**Constructors of `BB`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| BB()                               | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| BB(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| BB(schedule sch)                   | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `BB`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| double d() const                     | Returns the value of $d$.                                                   |
| void set_d(double d)                 | Sets the value of $d$. Must be a floating-point number in `[1, 1000]` (default = 4). Otherwise throws `std::invalid_argument`. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current ML value. Throws `std::out_of_range` if no elements are available. |
| double tl() const                    | Returns the current TL value. Throws `std::out_of_range` if no elements are available. |
| double ml() const                    | Returns the current ML value. Throws `std::out_of_range` if no elements are available. |
| double bl() const                    | Returns the current BL value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |

### Relative Strength Index (`RSI`) <Anchor :ids="['indicators-rsi']"/>

The formula is:

$$\mathit{RSI}_t = 100 - \frac{100}{1 + \mathit{RS}_t}$$

where:  
- $\mathit{RSI}_t$ — RSI value at time $t$,  

- $\mathit{RS}_t = \frac{EMA\_GAIN_t}{EMA\_LOSS_t}$,  

- $\mathit{EMA\_GAIN}_t = \frac{2}{n + 1} (G_t - \mathit{EMA\_GAIN}_{t-1}) + \mathit{EMA\_GAIN}_{t-1}$,  

- $\mathit{EMA\_LOSS}_t = \frac{2}{n + 1} (L_t - \mathit{EMA\_LOSS}_{t-1}) + \mathit{EMA\_LOSS}_{t-1}$,  

with:  

$G_{t} = \begin{cases} 
     p_t - p_{t-1}, &\text{if}\enspace p_t \ge p_{t-1}\\
     0, &\text{if}\enspace p_t < p_{t-1} 
   \end{cases}$;
   
   
$L_{t} = \begin{cases} 
     p_{t-1} - p_t, &\text{if}\enspace p_t \le p_{t-1}\\
     0, &\text{if}\enspace p_t > p_{t-1} 
   \end{cases}$;

- $p_t$ — source value (e.g., price) at time $t$,  
- $n + 1$ — number of source values used for calculation (`RSI`).  

---

**Constructors of `RSI`:**

| Constructor                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| RSI()                              | Creates an object with an empty schedule and portfolio `TradingDays`.        |
| RSI(std::vector&lt;interval&gt; sch) | Creates an object with a schedule and portfolio `TradingDays`.               |
| RSI(schedule sch)                  | Creates an object with a schedule and portfolio `TradingDays`.               |

---

**Methods of `RSI`:**

| Method                               | Description                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| size_t length() const                | Returns the number of elements used in calculation ($n$ in the formula).    |
| void set_length(size_t n)            | Sets the number of elements used in calculation. Must be an integer in `[1, 10000]` (default = 10). Otherwise throws `std::invalid_argument`. |
| size_t timeframe() const             | Returns the calculation timeframe, i.e., how often $p_i$ values are taken.  |
| void set_timeframe(size_t timeframe) | Sets the calculation timeframe in seconds. Must be an integer in `[1, 86400]` (default = 1 second). Otherwise throws `std::invalid_argument`. Changing the timeframe clears the accumulated value queue. |
| int trading_days() const             | Returns the indicator’s `TradingDays`.                                      |
| void set_trading_days(int td)        | Sets the indicator’s `TradingDays`. Must be an integer in `[0, 127]`. Otherwise throws `std::invalid_argument`. |
| bool update(double p)                | Adds a new value $p_i$ for calculation. If the timeframe has elapsed, the value is added and the function returns `true`; otherwise `false`. |
| double value() const                 | Returns the current indicator value. Throws `std::out_of_range` if no elements are available. |
| void clear()                         | Clears the list of elements used for calculation.                           |
| bool empty()                         | Checks whether the list of elements is empty.                               |
| size_t size()                        | Returns the number of elements currently stored.                            |
| void shift(double p)                 | Adds the given value to all stored elements and recalculates the indicator. |


## Examples of Accessing Portfolio, Instrument, Trade, and Position Parameters

Suppose there is a portfolio named "si", and it contains one financial instrument — the dollar futures "SiH6". To get, for example, the bid price and bid volume of the portfolio's financial instrument and store these values in variables, you need to write the following code:

```C
security s = get_security();
double bid = s.bid();
long long amount_bid = s.amount_bid();
```

___

To get, for example, the portfolio position and buy signal, you need to write:

```C
portfolio p = get_portfolio();
double lim_buy = p.lim_b();
long long pos = p.pos();
```

___

<Anchor :ids="['__sec_status_check__']"/>To check, for example, whether orders can currently be placed for the instrument and whether the robot has an active connection receiving order books:

```C
security s = get_security();
if ((s.trading_status() & TRADING_CAN_PLACE) && (s.conn_online() & MARKET_DATA_OB_ONLINE))
{
    // TODO place your code here
}
```

___

The portfolio position can be calculated manually by dividing the main financial instrument's position by its weight in the portfolio, like this:

```C
security_fields sf = get_security_fields();
long long pos = sf.pos() / sf.count();
```

___

To calculate the spread for portfolio trades, you can use the formula:

```C
portfolio p = get_portfolio();
return p.deal("SiH6").price;
```

___

You can save and load a value from "data" as follows:

```C
portfolio p = get_portfolio("si");
p.data()["key"] = 10;
double p = p.data()["key"];
```

___

<Anchor hide :ids="['__Example1__']"/>To get, for example, the last trade price for a financial instrument from the SPB exchange (retrieving the last trade price by key is only available for the SPB exchange):

```C
security s = get_security("SPB_AGGR_AAPL");
const spb_commons& c = s.spb_common();
double p = c.price_last;
```

___

<Anchor hide :ids="['__Example2__']"/>To, for example, set and then get the value of "user field #0"

```C
portfolio p = get_portfolio();
p.set_uf0(user_value(123));
const user_value& v = p.uf0();
return v.value();
```

___

<Anchor hide :ids="['__Example8__']"/>To calculate, for example, the weighted average bid over the first 10 order book entries (strongly NOT recommended to iterate over the entire order book, as it changes frequently and your code will run slowly):

```C
double sum1 = 0, sum2 = 0, avg_bid = 0;
security s = get_security("SPB_AGGR_AAPL");
order_book ob = s.orderbook();
if (ob.is_available())
{
    int i = 0;
    while (i <= 10 && ob.has_next_bid())
    {
        i++;
        std::pair<double, long long> b = ob.next_bid();
        sum1 += b.first * b.second;
        sum2 += b.second;
    }
}
avg_bid = (sum2 != 0) ? (sum1 / sum2) : 0;
```

___

<Anchor hide :ids="['__Example3__']"/>To loop through all financial instruments in the portfolio and output their names to the log:

```C
portfolio p = get_portfolio();
p.restart_sec_iter();
while (p.has_next_sec())
{
    security_fields sf = p.next_sec();
    log_info(sf.sec_key());
}
```

___

<Anchor hide :ids="['__Example9__']"/>To calculate, for example, the total volume of active portfolio orders for a financial instrument at a given price of 100:

```C
security_fields sf = get_security_fields();
order_pool p = sf.orders();
long long amount = 0;
while (p.has_next())
{
    order_item o = p.next();
    if (o.status == RUNNING && fabs(o.price - 100) < 1e-9)
    {
        amount += o.amount_rest;
    }
}
```

___

To find, for example, the current position in a financial instrument and the current balance in a currency:

```C
connection c = get_connection("okex_send_test");
coin_item ci = c.coin("BTC");
sec_item si = c.sec("isolated/BTC-USD-SWAP");
double coin_pos = ci.pos();
long long sec_pos = si.pos();
```

___

## Examples of Using Functions and Classes

Suppose there is a portfolio named "test" containing two financial instruments: the RTS index futures "RIH6" and its call option with a strike price of 70000 "RI70000BB6". The position in both instruments is 1, and the trading direction for both is [On_buy](params-description.md#s.on_buy) = [Buy](params-description.md#p.buy).

Let's calculate the delta of one of the portfolio instruments, for example, "RIH6". To do this, we will use the delta function from the options module. The delta of a futures contract is always 1. To verify this, write the following code:

```C
return S_delta("RIH6");
```

and execute this code, we will get 1 as a result. If we want to calculate delta with a refinancing rate, we can specify the optional parameter rate, for example, set it to 6.25%:

```C
return P_delta("test");
```

here "test" is the portfolio name (for portfolios with other names, you should use their respective names). The portfolio's delta will be equal to the sum of the deltas of its instruments, taking into account position size and trading direction:

$$\Delta_{portfolio}=\sum_{i\in portfolio}\Delta_i \times pos_i \times 
    \begin{cases}
      1, &\text{if}\enspace On\enspace buy_i=Buy\\
     -1, &\text{if}\enspace On\enspace buy_i=Sell 
    \end{cases}$$  

where `i` is the `i` -th instrument in the portfolio, Δ`i` is the delta of the `i`-th portfolio instrument, pos`i` is the position of the `i`-th portfolio instrument, and Onbuy`i` is the "On buy" setting of the `i`-th portfolio instrument. The portfolio values for gamma, vega, theta, and implied volatility are calculated similarly. Functions for their calculation are called in the same way as the delta example. The price function is also called similarly to delta, but it cannot be called for a portfolio — it is available only for individual financial instruments.

___

Now let's consider an example of using functions that allow more "flexible" calculation of required values, as they accept a broader set of input arguments. However, these functions work exclusively with options, and when using them, you must clearly know whether you are calculating a call or a put option. For example, let's calculate the implied volatility of the option "RI70000BB6", using the best bid prices for both the option and the underlying asset:

```C
security s1 = get_security("RIH6");
security s2 = get_security("RI70000BB6");
return CIV(s1.bid(), s2.strike(), s2.exp_date(), s2.bid());
```

___

<Anchor hide :ids="['__Example4__']"/>To check if the current time is before noon:

```C
day_time t = get_day_time();
day_time t1(12, 0, 0);
return t < t1;
```

___

<Anchor hide :ids="['__Example7__']"/>Example of a timer every 10 seconds:

```C
static timers::timer t(10000000000LL);
if (t.tick())
{
    // do some operation
}
```

___

Example of performing an operation daily, not earlier than 10:00:

```C
static timers::day_timer t(10, 0);
if (t.tick())
{
    // do some operation
}
```

___

Example of accessing and modifying "user fields" (increase the value of the `i`-th field by `i`):<Anchor hide :ids="['__Example6__']"/>

```C
portfolio p = get_portfolio();
for (int i = 0; i < 20; i++)
{
    double v = std::invoke(uf[i], p).value();// get value
    std::invoke(set_uf[i], p, user_value(v + i));// set value
}
return 0;
```

___

## Examples of Writing Ratio Buy/Sell Formulas

When writing formulas, you can use any financial instruments that are part of any portfolio. You can also access values from other portfolios, for example their instrument positions.

To use the [Ratio sell/buy formula](params-description.md#s.ratio_b_formula) field, you must first set the [Ratio type](params-description.md#s.ratio_type) parameter for the selected portfolio instrument to `Ratio formula`. After that, press Enter, apply the changes by clicking the Apply button, and go to the Formulas tab to write the necessary code.

Suppose there is a portfolio named "si" containing one instrument — the dollar futures "SiH6", and the trading direction for this instrument is [On by](params-description.md#s.on_buy) = `Buy`.

If [Ratio sign](params-description.md#s.ratio_sign) = "×", then the formula can only define a multiplier (used for both buy and sell). You can then enter a custom multiplier value for each side of the trade (for buy [Ratio buy formula](params-description.md#s.ratio_b_formula) and sell [Ratio sell formula](params-description.md#s.ratio_s_formula) scenarios separately), for example:


```C
security s = get_security("SiH6");
return sqrt(s.bid());
```

```C
security s = get_security("SiH6");
return sqrt(s.offer());
```

for buy and sell, respectively.

In this case, when calculating [Buy](params-description.md#p.buy) the square root of the bid will be used, and when calculating [Sell](params-description.md#p.sell) the square root of the ask will be used.

If [Ratio sign](params-description.md#s.ratio_sign) = "+",  you can completely redefine the calculation formula for [Buy](params-description.md#p.buy) and [Sell](params-description.md#p.sell), To do this, first subtract the values currently in use, thereby zeroing out [Buy](params-description.md#p.buy) and [Sell](params-description.md#p.sell):

```C
security s = get_security("SiH6");
return -s.bid();
```

```C
security s = get_security("SiH6");
return -s.offer();
```

for buy and sell, respectively, and then add a new value to [Buy](params-description.md#p.buy) and [Sell](params-description.md#p.sell), for example like this:

```C
security s = get_security("SiH6");
double price = s.offer() * 3 + 5;
return -s.offer() + price;
```

and

```C
security s = get_security("SiH6");
double price = s.bid() * 3 + 5;
return -s.bid() + price;
```

Now the value of the `price` variable will serve as the new values for [Buy](params-description.md#p.buy) and [Sell](params-description.md#p.sell) when calculating each parameter.  It should be noted that without using `Ratio formula` such a "sophisticated" value would not have been possible to achieve.
___

Let's consider another example. Suppose there is a portfolio named "test" containing two instruments:
- USD futures "SiH6" with [On_buy](params-description.md#s.on_buy) = `Buy`, and it is marked as [Is first](params-description.md#s.is_first);
- RTS index futures "RIH6" with [On_buy](params-description.md#s.on_buy) = `Buy` (for this example, the [Is first](params-description.md#s.is_first) flag of the non-primary instrument is irrelevant).

To use these two instruments in one portfolio, their prices in points must be expressed in the same unit. USD trades in RUB (`1 pt = 1 rub`), while the RTS index does not. For the index, `1 pt = 0.02 * $price rub` (where `$price` is the USD/RUB rate; it is dynamic, not a constant).

There are two equivalent solutions, both implemented via `Ratio formula` and producing identical results:

1. For USD, set [Ratio](params-description.md#s.ratio) = `1`.  
   For the RTS index, choose [Ratio sign](params-description.md#s.ratio_sign) = "×" and write the following in [Ratio buy formula](params-description.md#s.ratio_b_formula):


    ```C
    security s = get_security("SiH6");
    return (0.02 * s.offer() * 0.001);
    ```

    in `Ratio sell formula` write the following:

    ```C
    security s = get_security("SiH6");
    return (0.02 * s.bid() * 0.001);
    ```

    Thus, when calculating [Buy](params-description.md#p.buy)  we will use the dollar's ask price, and when calculating [Sell](params-description.md#p.sell) -  its bid price, resulting in a value expressed in rubles.

2. For the dollar, simply set [Ratio](params-description.md#s.ratio) = 1. For the RTS index, select [Ratio sign](params-description.md#s.ratio_sign) = "+", and in [Ratio buy formula](params-description.md#s.ratio_b_formula) enter the following (first zero out the value, as in the previous example, then set a new one):

    ```C
    security s1 = get_security("SiH6");
    security s2 = get_security("RIH6");
    double price = s2.offer() * 0.02 * s1.offer() * 0.001;
    return -s2.offer() + price;
    ```

    in [Ratio sell formula](params-description.md#s.ratio_s_formula) write the following:

    ```C
    security s1 = get_security("SiH6");
    security s2 = get_security("RIH6");
    double price = s2.bid() * 0.02 * s1.bid() * 0.001;
    return -s2.bid() + price;
    ```

    Now the value of the "price" variable will serve as the new values (so to speak, from the RTS index side) used to calculate [Buy](params-description.md#p.buy) and [Sell](params-description.md#p.sell), respectively.

## Examples of Using Indicators<Anchor hide :ids="['__Example5__']"/>

The simplest example of calculating `SMA` without any additional settings (i.e., a 1-second timeframe and 10 values for averaging):
```C
security s = get_security();// get main security
static indicators::SMA sma;// initialize SMA object as static variable
sma.update(s.mid_price());// try to update SMA value, by adding new price
return sma.value();// get current SMA value
```
---

Example of calculating `EMA` using a schedule (`TradingDays` are taken from the portfolio, 1-second timeframe and 10 values for averaging):
```C
security s = get_security();// get main security
static indicators::EMA ema({{{7, 0}, {18, 45}}, {{19, 0}, {23, 50}}});// initialize EMA with trading schedule: 7:00-18:45, 19:00-23:50
ema.update(s.mid_price());// try to update EMA value, by adding new price
return ema.value();// get current EMA value
```
---

Example of calculating `Var` using user field values to configure indicator parameters and handling missing prices for a given financial instrument:
```C
portfolio p = get_portfolio();// get current portfolio
user_value td = p.uf0();// get TradingDays value from user field 0
user_value len = p.uf1();// get length value from user field 1
user_value tf = p.uf2();// get timeframe value from user field 2
security s = get_security();// get main security

static indicators::Var v({{{7, 0}, {23, 0}}});// initialize Var with trading schedule: 7:00-23:00
v.set_timeframe(tf.value());// set timeframe value from user field 2
v.set_length(len.value());// set length value from user field 1
v.set_trading_days(td.value());// set TradingDays value from user field 0

try// try to catch exception
{
    v.update(s.mid_price());// try to update Var value, by adding new price
}
catch(std::range_error& e)// if there is no mid_price value simply return -1
{
    return -1;
}
return v.value();// get current Var value
```
---
Examples of Setting `TradingDays` for an Indicator:
```C
sma.set_trading_days(WD_MONDAY | WD_TUESDAY);// compute indicator value on Monday and Tuesday only
sma.set_trading_days(WORK_WEEK);// compute indicator value from Monday till Friday
sma.set_trading_days(WHOLE_WEEK & (~ WD_MONDAY));// compute indicator value from Tuesday till Sunday
```

## Most Common Errors in Formulas Leading to Robot Crash <Anchor :ids="['errors']"/>

Since formulas are written in the unsafe programming language C++, runtime errors in formulas can lead to a crash of the entire robot. The most common types of such errors include:
- Integer division by zero (using data types like `int` and its variations);
- Accessing non-existent elements in a collection (e.g., calling `back()`on an empty container);
- Ignoring the domain of mathematical functions (e.g., taking the logarithm of a negative number or zero);
- Exhausting allocated memory due to uncontrolled accumulation of data in collections without proper cleanup.
