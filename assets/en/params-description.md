---
title: 7. Parameters Description
section: 7
---

# Parameters Description

## Terminology <Anchor :ids="['pp']" />

This section defines terms and values that are not direct parameters of portfolios, instruments, or connections, but are used throughout parameter descriptions.

### lot_size <Anchor :ids="['pp.lot_size']" />

A multiplier used to convert order/trade quantities and positions from integers to fractional values.  
All quantities in orders/trades and positions within the robot are stored as integers to avoid precision issues when working with floating-point arithmetic.  

To convert to the same unit scale as displayed on exchange websites (for exchanges that allow fractional values in these fields), the `lot_size` multiplier is applied:

- **Integer → Fractional**: multiply the integer value by `lot_size`.  
- **Fractional → Integer**: divide the fractional value by `lot_size`.

**Example:**  
For many cryptocurrency spot instruments, quantities are quoted with up to 8 decimal places. In such cases, the `lot_size` equals `0.00000001`.

## Portfolio Parameters <Anchor :ids="['p']" />

This section describes portfolio parameters. All parameters are editable unless explicitly stated otherwise.  
Some parameters are grouped for clarity.

### Name <Anchor :ids="['p.name']" />

The portfolio name. Only Latin letters and digits are allowed, up to 30 characters.  
The name of an existing portfolio cannot be edited.  
To change the name: stop trading, clone the portfolio, set the desired name for the clone, and delete the original portfolio.

### re_sell / re_buy <Anchor :ids="['p.re_sell', 'p.re_buy']" />

Enables selling/buying.  
When checked, enables the robot for selling/buying.

**Important!** Unchecking `re_sell` or `re_buy` resets the robot’s error counter.

### Type <Anchor :ids="['p.portfolio_type']" />

Defines the trading algorithm type for the portfolio:

- **`Arbitrage`** — Standard arbitrage trading using all configured parameters.  
  The order is placed first for the [Is first](params-description.md#s.is_first) instrument. Once executed, orders are placed for the other instruments in the portfolio.

- **`Option hedge`** — Arbitrage trading with options and automatic [Count](params-description.md#s.count) calculation for both legs.  
  Intended for trading an option + underlying asset pair.  
  The main leg is the option. The option [Count](params-description.md#s.count) is automatically calculated using the Black–Scholes model so that the option delta equals 1.  
  The second leg always has [Count](params-description.md#s.count) = 1.  
  Example: If the delta of 1 option lot = 0.5, then:  
  - Option leg `count = 2`  
  - Underlying leg `count = 1`

- **`TP algo`** — Trading mode with a single “take profit” order placed for the main instrument.  
  Only one TP order is maintained. After a non-TP order is executed, the TP order is canceled and replaced with a new volume.  
  No orders are placed for the second leg.

- **`TP algo 2`** — Trading mode with “take profit” orders placed for the main instrument.  
  After each execution of a non-TP order, a new TP order is placed.  
  Each TP order has a [Timer](params-description.md#s.timer) and [SL](params-description.md#s.sl).  
  Orders for the second leg are placed in the same way as in `Arbitrage`.

  **Important!** If [Hedge (sec)](params-description.md#p.hedge_after) is enabled, then every [Hedge (sec)](params-description.md#p.hedge_after) seconds, if the main instrument’s portfolio position is non-zero and there are no active or pending orders reducing it to zero, an order is placed to flatten the position.  
  This rule also applies to positions opened manually (via “clicker”).  
  Closing via [Hedge (sec)](params-description.md#p.hedge_after) is possible only after trades on the main instrument have been executed by the algorithm (not manually). If no trades have occurred, there are no reference prices to place TP orders from.

### Type trade <Anchor :ids="['p.type_trade']" />

Defines the trading mode used for calculating [Sell/Buy](params-description.md#p.sell) and [Price_s/Price_b](params-description.md#p.price_s):

- **`Price`** — trading based on instrument prices (bid and ask).
- **`IV`** — volatility trading, using implied volatility values derived from instrument prices with the Black–Scholes model.

---

### Type price <Anchor :ids="['p.price_type']" />

Defines how the instrument price is determined:

- **`Bid/ask`** — use the best bid and the best ask price.  
- **`Orderbook`** — search for the required volume in the order book. Prices are aggregated starting from the best price in the chosen direction, moving deeper into the book, until the required volume is collected.  
  The target volume is calculated by the formula:

$$Count \times Percent\enspace of\enspace quantity \times 0.01 \times 
\begin{cases} 
v\_in\_left, &\text{if } \enspace open\enspace pose\\
v\_out\_left, &\text{if } \enspace close\enspace pose 
\end{cases},$$

- **`Orderbook+filter`** — same as `Orderbook`, but excludes the robot’s own orders if they are present at the corresponding prices.

Order book depth is determined by the portfolio instrument parameter [Depth OB](params-description.md#s.depth_ob).

---

### Quote <Anchor :ids="['p.quote']" />

Controls quoting behavior for the [Is first](params-description.md#s.is_first) instrument.  

- If enabled, an order for the [Is first](params-description.md#s.is_first) instrument is always maintained in the order book.  
- If disabled, orders for the [Is first](params-description.md#s.is_first) instrument are placed only under these conditions:  
  - A sell order is placed when [Sell](params-description.md#p.sell) ≥ [Lim_sell](params-description.md#p.lim_s).  
  - A buy order is placed when [Buy](params-description.md#p.buy) ≤ [Lim_buy](params-description.md#p.lim_b).  

---

### Order ID <Anchor :ids="['p.portfolio_num']" />

Identifier for all portfolio orders. Also determines the execution priority of the portfolio’s trading algorithm.  

**Example:**  
Suppose multiple portfolios contain the same instrument. When the best bid or ask for that instrument changes, the trading algorithm is triggered for all such portfolios.  
Execution order is based on ascending `Order ID`:  
- The portfolio with the smallest `Order ID` runs first.  
- The portfolio with the largest `Order ID` runs last.  

If two portfolios share the same `Order ID`, their execution order is undefined and may vary.

---

### Hedge (sec) <Anchor :ids="['p.hedge_after']" />

Time interval in seconds after which any unhedged position is automatically hedged if the second-leg order was not placed by the algorithm (e.g., due to exchange-side technical issues, rate-limit restrictions, or other non-market conditions).  

- If set to `-1`, unhedged position checks are disabled.

**Note:**  
If the position mismatch exceeds the [Overlay](params-description.md#p.overlay) value (including active orders), a correcting order is placed without canceling existing active orders.  
- When a correcting order is placed, the error counter for that instrument is reset.  
- Mismatches are calculated separately for each second-leg instrument.  
- At most one correcting order can be active per second-leg instrument at a time.  
- If the correcting order is not executed, it is re-submitted once per second.

---

### Only maker <Anchor :ids="['p.maker']" />

For quoting mode ([Quote](params-description.md#p.quote)), places orders for the [Is first](params-description.md#s.is_first) instrument with the `maker only` flag (cancel if the order would act as a taker), provided the exchange supports this order type.

**Important!**  
When using this parameter, it is strongly recommended to also enable [Simply first](params-description.md#p.simply_first) to avoid an excessive number of rejected transactions (e.g., when an order unintentionally crosses the book). Otherwise, frequent rejections may trigger exchange sanctions.

### Simply first <Anchor :ids="['p.simply_first']" />

When enabled, if [Price_s/Price_b](params-description.md#p.price_s) fall into a wide spread or move to the opposite side of the order book, first-leg orders will always be placed no deeper than one price step into the spread (i.e., at the best available price in the order book).  

Additionally, during quoting, this condition is maintained dynamically as the order book updates. For example:  
- If another order is placed ahead of the robot’s order.  
- Or if orders behind the robot’s order are canceled, creating a gap greater than one price step.  

In such cases, the robot’s order will automatically be adjusted.  

The resulting placement logic for first-leg orders is as follows:


$Price\_s_1=\max\left(Price\_s_0,ask-step\right),$

$Price\_b_1=\min\left(Price\_b_0,bid+step\right),$

Here, `bid`, `ask`, and `step` represent the bid, ask, and price step of the [Is first](params-description.md#s.is_first) instrument.  
The subscript `0` denotes the current value of a parameter, while subscript `1` denotes the new value.  

If the [Is first](params-description.md#s.is_first) instrument has the `Only Maker` flag enabled and the current spread equals one price step, then:  
- The sell order will be placed at `ask`.  
- The buy order will be placed at `bid`.  

Otherwise, the order could not be placed and would generate unnecessary transaction attempts (“spam”) on the exchange.

**Important!** If our order is the bid or offer and is the only order at that price level, then in the previous formula, the bid and offer used are taken excluding our order from the order book.

**Important!**  If the calculated order price falls outside the instrument's allowed price range, the price will be adjusted to the nearest boundary (i.e., if the calculated price is below the minimum allowed price, the minimum allowed price is used; if it exceeds the maximum allowed price, the maximum allowed price is used).

**Important!** To use this parameter correctly, market depth (order book) data for the main instrument must be available. Therefore, for market data connections where the order book is enabled via a separate stream, this stream must be activated. On crypto markets, when using this flag, avoid connections whose names end with `_top`, as they do not provide order book data.

**Non-obvious point!**  
All of the above applies only if the calculated prices [Price_s/Price_b](params-description.md#p.price_s)fall into the wide spread or on the opposite side of the order book. If these prices fall on the "same" side of the book (buy price within buy levels, sell price within sell levels), the `Simply first` parameter has no effect on the prices.

Moreover, if the condition specified by the [Threshold](params-description.md#p.threshold), parameter is met, the price recalculation via `Simply first` will also not be performed.


### Equal prices <Anchor :ids="['p.equal_prices']" />

If the checkbox is not set, the price of the second leg is determined based on the prices that were present at the moment the signal was generated to place an order for the `is first` instrument. If the checkbox is set, the order for the second leg will be placed at such a price that [Sell](params-description.md#p.sell) = [Lim_sell](params-description.md#p.lim_s) and [Buy](params-description.md#p.buy) = [Lim_buy](params-description.md#p.lim_b) (works only for portfolios with two financial instruments).  
Thus, the prices in the orders will strictly match [Lim_sell](params-description.md#p.lim_s), even if better prices were available at the moment.

Enabling this parameter reduces the number of negative slippages on the second leg but also decreases the number of positive slippages (when you buy at a better price than intended).

Example: the first leg's price is 100, the second leg's price is 95. We want to buy the first leg at 100, provided the second leg is also at 100, i.e., the spread is zero. At the moment, the market in the second leg suddenly spikes up to 110.
If the checkbox is enabled, we will buy the first leg at 100 and attempt to sell the second leg at 100 (since a zero spread was acceptable).
If the checkbox is not enabled, we will use the price that triggered the trade signal, i.e., buy the first leg at 100 and attempt to sell the second leg at 110.

Formula for the second leg's buy price:

$$Price=\pm\left(Lim\_sell-Price\_s
\begin{cases}+,& Ratio\_sign_1=+\\
        \times,& Ratio\_sign_1=\times\end{cases}
ratio_1\right)
\begin{cases}-,& Ratio\_sign_2=+\\
        /,& Ratio\_sign_2=\times\end{cases}
ratio_2$$

for sell:

$$Price=\pm\left(Lim\_buy-Price\_b
\begin{cases}+,& Ratio\_sign_1=+\\
        \times,& Ratio\_sign_1=\times\end{cases}
ratio_1\right)
\begin{cases}-,& Ratio\_sign_2=+\\
        /,& Ratio\_sign_2=\times\end{cases}
ratio_2$$

The ± sign depends on the value set for the [On_buy](params-description.md#s.on_buy) parameter on the second leg (if set to Buy, then "+", if set to Sell, then "-").

### Volumes <Anchor :ids="['p._volumes']" />

A group of parameters responsible for the volume of placed orders. The group can be divided into two pairs of parameters: [v_in_left/v_in_right](params-description.md#p.v_in_l) and [v_out_left/v_out_right](params-description.md#p.v_out_l), as well as the parameters [Virt_0_pos](params-description.md#p.virtual_0_pos) and [n_perc_fill](params-description.md#p.n_perc_fill).

#### v_min/v_max <Anchor :ids="['p.v_min', 'p.v_max']" />

Minimum/maximum allowed portfolio position. Measured in number of portfolios.

#### v_in_left/v_in_right <Anchor :ids="['p.v_in_l', 'p.v_in_r']" />

Responsible for the minimum/maximum allowed volume for a single entry into a position (in number of portfolios);  
If the price determination type [Type price](params-description.md#p.price_type) is set to `Orderbook` or `Orderbook+filter` then the volume `v_in_right` for a single entry is not used.

#### v_out_left/v_out_right <Anchor :ids="['p.v_out_l', 'p.v_out_r']" />

Responsible for the minimum/maximum allowed volume for a single exit from a position (in number of portfolios);
If the price determination type [Type price](params-description.md#p.price_type) is set to `Orderbook` or `Orderbook+filter` then the volume `v_in_right` for a single entry is not used.

#### Virt 0 pos <Anchor :ids="['p.virtual_0_pos']" />

This parameter allows the [Is first](params-description.md#s.is_first) order, placed by the algorithm, on a financial instrument directed toward closing the position not only to bring the position to zero but also immediately open a new position in the opposite direction. Additionally, the order volume can never be less than [v_in_left](params-description.md#p.v_in_l) and [v_out_left](params-description.md#p.v_out_l).

**Important!** If the [To0](params-description.md#p.to0) flag is enabled, the robot may exhibit behavior where the position never reaches exactly zero but constantly flips from one side to the other. With the `Virt 0 pos` parameter enabled, the robot might not reach the [v_min/v_max](params-description.md#p.v_min) positions, as it "bumps into" the limits set by [v_in_left/v_in_right](params-description.md#p.v_in_l) and [v_out_left/v_out_right](params-description.md#p.v_out_l) (the robot will not place orders smaller than these values).

#### n_perc_fill <Anchor :ids="['p.n_perc_fill']" />

This parameter defines the relationship between the position in the first-leg instrument and the portfolio position, and effectively determines hedging conditions in cases where the [Count](params-description.md#s.count) of the first leg may not be an integer multiple of its position. Based on this parameter, the ratio of the position ([Curpos](params-description.md#s.pos)) in the main instrument to the [Count](params-description.md#s.count) parameter of the same instrument is rounded. The `n_perc_fill` parameter can only take values from 50 to 100 and 0. A value of`n_perc_fill` equal to zero disables the rounding mechanism, resulting in the position always being rounded down in absolute value. In all other cases, the following rules apply:

- if, upon changing the position in the main instrument of the portfolio, the integer part of the position has not changed, and the remainder of dividing [Curpos](params-description.md#s.pos) by [Count](params-description.md#s.count) falls within the range from `(100 - n_perc_fill)` to `n_perc_fill` percent of [Count](params-description.md#s.count), then the portfolio position remains unchanged; if the remainder is to the left of this range, rounding is performed downward in absolute value; if to the right — upward in absolute value;

- if, when increasing the position, the integer part of dividing [Curpos](params-description.md#s.pos) by [Count](params-description.md#s.count)  and the absolute value of the remainder is greater than or equal to `n_perc_fill` percent of [Count](params-description.md#s.count),  then the portfolio position is rounded up in absolute value; otherwise — down;

- if, when decreasing the position, the integer part of dividing [Curpos](params-description.md#s.pos) by [Count](params-description.md#s.count) decreases, and the absolute value of the remainder is less than or equal to `(100 - n_perc_fill)` percent of [Count](params-description.md#s.count),  then the portfolio position is rounded down in absolute value; otherwise — up.

Thus, using the `n_perc_fill` parameter with a non-zero value makes sense only when the [Count](params-description.md#s.count) of the first-leg instrument is greater than one. In this case, a non-zero value of the `n_perc_fill` parameter acts as a kind of "hysteresis" and provides the ability to filter out position "jitter" on the first-leg instrument within certain limits.

### Delta <Anchor :ids="['p.delta']" />

Minimum deviation of [Price_s](params-description.md#p.price_s) and `[Price_b](params-description.md#p.price_b) from the price of the currently placed sell or buy order, respectively. If this deviation is exceeded, the robot may re-quote the order — that is, replace the order on the [Is first](params-description.md#s.is_first) instrument (used only when the [Quote](params-description.md#p.quote) mode is enabled);

_Example_:  
Delta = 10; a quoting sell order is placed at price 95 (i.e., at the time of placement, Price_s = 95). As soon as Price_s becomes less than 85 or greater than 105, the order will be replaced at a new price.

### First delta <Anchor :ids="['p.first_delta']" />

Specified in percent (%), this is one of the parameters that triggers re-quoting an order with a new volume if its current unexecuted volume falls below `First delta` percent of the initially placed volume (used only when the [Quote](params-description.md#p.quote)) mode is enabled). This allows maintaining the required minimum volume in the quoting order.


_Example_:  
First delta = 20. You are quoting a sell order with volume 100, and your order starts being filled partially. The order remains active as long as its unexecuted volume is greater than or equal to 20. Once it drops below 20, the order is canceled and, if possible, a new order is placed at price `Price_s` with the full volume.

### Market volume <Anchor :ids="['p.mkt_volume']" />

This parameter restricts placing an order on the [Is first](params-description.md#s.is_first) instrument if the queue depth in the order book at the intended price level already exceeds the value set in `Market volume`. The value is displayed in the same unit as the instrument position shown in the exchange terminal (unless otherwise specified for a particular connection).

**Important!**  For display on the website, [lot_size](params-description.md#pp.lot_size) is used. When using [С++ Formulas](c-api.md#cpp) or [API](api.md#api)  to obtain the correct parameter value, you must manually multiply by [lot_size](params-description.md#pp.lot_size).

### Price check <Anchor :ids="['p.price_check']" />

If the intended order price for the [Is first](params-description.md#s.is_first) financial instrument falls deeper into the order book than `Price check` ticks, the order will not be placed.
That is, if `ask + Price check < Price_s`, where `ask` is the best sell price of the [Is first](params-description.md#s.is_first) instrument,  then the order will not be placed. The same logic applies for buy orders.

### Max not hedged <Anchor :ids="['p.max_not_hedged']" />

The value represents the maximum allowed number of unhedged openings on the [Is first](params-description.md#s.is_first) instrument (i.e., when at least one non-[Is first](params-description.md#s.is_first) instrument has active orders totaling no less than `Max not hedged`)  plus placement errors (all errors except crosses). Once this threshold is reached, trading on the [Is first](params-description.md#s.is_first) instrument will be suspended until at least one of the unhedged positions is hedged or the error counter is reset.

**important!** The `Max not hedged`  parameter should be used in conjunction with [Hedge (sec)](params-description.md#p.hedge_after); otherwise, trading may halt after accumulating a certain number of errors.

**Non-obvious point!** On some trading platforms, a two-way position model is used, allowing simultaneous long and short positions. On such platforms, instead of two possible order sides — "buy" and "sell" — four are used: "open buy", "open sell", "close buy", and "close sell". When using instruments from such platforms as second-leg instruments in the portfolio, the `Max not hedged` parameter must be set to "1"; otherwise, the robot's algorithm cannot function correctly.

### Overlay <Anchor :ids="['p.overlay']" />

Hedge only if the difference (in portfolios) between the [Is first](params-description.md#s.is_first) financial instrument and the other instruments in the portfolio is greater than or equal to this parameter's value (measured in number of portfolios, i.e., in the same unit as [v_in_left/v_in_right](params-description.md#p.v_in_l)).

### Lim_sell/Lim_buy <Anchor :ids="['p.lim_s', 'p.lim_b']" />

`Lim_Sell` –  signal price for selling; an order on the [Is first](params-description.md#s.is_first) financial instrument is placed if `Sell ≥ Lim_Sell` , regardless of whether the [Quote](params-description.md#p.quote) mode is enabled.

`Lim_Buy` –  signal price for buying; an order on the [Is first](params-description.md#s.is_first) financial instrument is placed if `Buy ≤ Lim_Buy` regardless of whether the   [Quote](params-description.md#p.quote) mode is ebabled.


### Threshold <Anchor :ids="['p.threshold']" />

When `Threshold > 0`, during strong spread movement by the amount `Threshold`— i.e., when either `Sell ≥ Lim_Sell + Threshold` or `Buy ≤ Lim_Buy - Threshold`is satisfied — the calculation of prices [Price_s](params-description.md#p.price_s) and [Price_b](params-description.md#p.price_b)will be performed as if the [Simply first](params-description.md#p.simply_first) flag is cleared, regardless of its actual value (i.e., the parameter is temporarily disabled). Additionally, when placing an order on the [Is first](params-description.md#s.is_first) financial instrument, the [Only maker](params-description.md#p.maker) flag will not be set in the order, regardless of the current setting. Note that the user-visible portfolio settings remain unchanged; all parameter deactivations occur internally and virtually.

when `Threshold = 0` , this parameter has no effect on the algorithm — effectively disabling this functionality.

**Important!** It is not possible to modify an already placed order on an exchange by changing its [Only maker](params-description.md#p.maker) flag. Therefore, when the `Threshold`conditions are met, re-quoting is always implemented as a separate cancel-and-replace sequence.

### Trading signal shift <Anchor :ids="['p._limits_shift']" />

A group of parameters responsible for creating the arbitrage channel.

#### K <Anchor :ids="['p.k']" />

Price shift coefficient that improves the order price for each subsequent entry.  
The [Lim_sell](params-description.md#p.lim_s) level (in case of selling) or [Lim_buy](params-description.md#p.lim_b)level (in case of buying) is shifted by the value of `K` when building a position. In other words, this defines how much the order price improves after a fill (a "fill" is defined as a trade with volume no less than [v_in_left](params-description.md#p.v_in_l)).

#### ТР <Anchor :ids="['p.tp']" />

Opposite-side order level after a fill. Using the `ТР` parameter, you specify where the opposite-side order will be placed after a fill (applies only after the first fill).
For example, if we were filled at [Lim_sell](params-description.md#p.lim_s) = 150, then with `ТР` = 50, [Lim_buy](params-description.md#p.lim_b) will be placed at 150 – 50 = 100.

#### K1 <Anchor :ids="['p.k1']" />

The coefficient specifies the shift of the opposite-side order after the second fill that increases the position.
For example, if [Lim_buy](params-description.md#p.lim_b) = 100 from the previous example, with `K1` = 5, it will be set to 100 + 5 = 105, after the second fill on [Lim_sell](params-description.md#p.lim_s). After another trade, [Lim_buy](params-description.md#p.lim_b) will increase by another 5 to 110; after the next trade on [Lim_sell](params-description.md#p.lim_s),  it will become 115, and so on.

#### K2 <Anchor :ids="['p.k2']" />

The coefficient that shifts the order price to improve it for each subsequent exit.
[Lim_sell](params-description.md#p.lim_s) (in case of selling) or [Lim_buy](params-description.md#p.lim_b)(in case of buying) is shifted by the value of `K2` when exiting a position. In other words, this defines how much the next exit order improves after a prior fill (a "fill" is defined as a trade with volume no less than [v_out_left](params-description.md#p.v_out_l)).
From the earlier example, where [Lim_buy](params-description.md#p.lim_b) = 105, with `K2` = 3, after a fill at [Lim_buy](params-description.md#p.lim_b), its value becomes 105 - 3 = 102.

### Limits timer <Anchor :ids="['p.timer']" />

Timer duration (set in seconds) after which both [Lim_sell](params-description.md#p.lim_s) and [Lim_buy](params-description.md#p.lim_b) are shifted by the value of [K](params-description.md#p.k). The timer starts when trading is enabled and a buy or sell signal occurs, but trading is blocked because the robot has already reached the maximum position (according to [v_min/v_max](params-description.md#p.v_min)). The timer stops when [Percent](params-description.md#p.percent) > 100%.

Example: `Limits timer` = 10 sec, `Percent` = 60. Consider a 10-second time window: suppose the signal was present for 2 sec, then absent for 3 sec, present again for 4 sec, and absent for 1 sec. Over 10 seconds, the signal was active for a total of 6 seconds, which is ≥ 60% of 10 seconds — thus, the condition is met and the shift is applied.

### Percent <Anchor :ids="['p.percent']" />

The percentage of [Limits timer](params-description.md#p.timer) after which the shift occurs. If the trading signal persists for the specified percentage of the [Limits timer](params-description.md#p.timer) duration, then [Lim_sell/Lim_buy](params-description.md#p.lim_s) are moved by [K](params-description.md#p.k) , regardless of whether any trades occurred on the Is [Is first](params-description.md#s.is_first) financial instrument.

### Always timer <Anchor :ids="['p.always_limits_timer']" />

When `Always timer` ia enabled, the [Limits timer](params-description.md#p.timer) is always active, even if the portfolio position has not reached [v_min](params-description.md#p.v_min) or [v_max](params-description.md#p.v_max). When `Always timer` is disabled, the levels [Lim_sell](params-description.md#p.lim_s) and/or [Lim_buy](params-description.md#p.lim_b) shift only when trades occur or when the portfolio position reaches [v_min](params-description.md#p.v_min) or [v_max](params-description.md#p.v_max).Enabling this parameter allows level adjustments even if no trade occurred, as long as the robot attempted to place an order.


### Pos <Anchor :ids="['p.pos']" />

Current portfolio position (in number of portfolios), calculated using the formula:



$Pos=[\frac{Curpos_{first}}{Count_{first}}],$

Where Curpos<sub>first</sub> and Count<sub>first</sub> - are the [Curpos](params-description.md#s.pos) and [Count](params-description.md#s.count) parameters for the portfolio instrument with the [Is first](params-description.md#s.is_first) flag set, rounded up or down depending on the value of the [n_perc_fill](params-description.md#p.n_perc_fill) parameter. The value is updated by the robot but can also be manually edited by the user.

### Timetable <Anchor :ids="['p.use_tt', 'p.trading_days']" />

Enable trading according to a schedule. The schedule consists of a list of weekdays specifying the days on which trading will be active, and a list of trading periods (the same for all trading days), each with its own set of parameters:

`Begin` - start of the trading period.\
`End` - end of the trading period.\
`re_sell` -  behavior of [re_sell](params-description.md#p.re_sell) during this interval: always enable, always disable, or "manual" mode.\
`re_buy` - behavior of [re_buy](params-description.md#p.re_buy) during this interval: always enable, always disable, or "manual" mode.\
`Close` -  attempt to close the position immediately after the end of the trading period (within 10 seconds). Position closure is not guaranteed, as orders may fail to be placed due to external reasons.\
`To market` - attempt to flatten the position immediately after the end of the trading period (within 10 seconds). Position flattening is not guaranteed, as orders may fail to be placed due to external reasons.\
`To0` - behavior of [To0](params-description.md#p.to0) during this interval: always enable, always disable, or "manual" mode.\
`Save history` - whether to save the history of changes to certain portfolio parameters during this interval.

If the current local server time (`curTime`) falls within one of the defined periods, i.e., $Begin_i \le curTime \le End_i$, control over the above-mentioned portfolio parameters is transferred to the schedule. Otherwise (if the current time does not fall within any of the periods), the aforementioned parameters are automatically disabled.

The "manual" mode means that the respective portfolio parameter is not controlled by the schedule during that time interval, i.e., the user can adjust the parameter manually even when the schedule is active.

The weekly trading schedule can also be applied to multiple portfolios simultaneously by selecting them in the [Portfolios table](interface.md#portfolios_table) widget and choosing the [TradingDays](getting-started.md#portfolio_actions.trading_days) option from the `Actions` menu.


**Important!** Current time is determined by the server clock where the robot is running. Currently, for robots trading on cryptocurrency exchanges, this is UTC; for all others, it is UTC+3 (MSK). The server time is displayed in the [Robots](interface.md#robots_table) widget under the `Robot time` column.It is strongly recommended to use this time as reference.

**Important!** There is a difference between two scenarios: (1) when a non-trading period is explicitly defined between trading periods, starting exactly at the end of one trading period and ending just before the next, and (2) when there is a time gap between trading periods but no non-trading period is defined in the schedule. In the second case, all flags described above will be automatically disabled during the gap. In the first case, the behavior can be specifically configured.

### To0 <Anchor :ids="['p.to0']" />

Enabling this parameter allows trading only in the direction of closing the position. When the portfolio position reaches zero, trading will stop. 

**Important!** If the [Virt_0_pos](params-description.md#p.virtual_0_pos)flag is enabled, the robot may exhibit behavior where the position never reaches exactly zero but constantly flips from one side to the other.

### Opened <Anchor :ids="['p.opened']" />

A parameter used to calculate the financial result, computed using the formula:

$$Opened = -\left(\sum_{i\in bought}tradePrice_i\times tradeAmount_i\times lotSize_i\times Mult_i\right)+
            \left(\sum_{i\in sold}tradePrice_i\times tradeAmount_i\times lotSize_i\times Mult_i\right),$$

where tradePrice<sub>i</sub> - trade price;  
tradeAmount<sub>i</sub> - number of lots in the trade;  
lotSize<sub>i</sub> - multiplier to convert integer volumes into fractional ones;  
bought - list of buy trades;  
sold - list of sell trades;  
Mult<sub>i</sub> - [Fin res multiplier](params-description.md#s.fin_res_mult) of the portfolio instrument.

### Commision sum <Anchor :ids="['p.opened_comission']" />

Total commission across all portfolio trades, used in calculating the financial result.

### Decimals <Anchor :ids="['p.decimals']" />

A parameter that defines the number of decimal places displayed for parameters with fractional values.
Note that the robot uses actual prices received from the exchange, while the interface may display rounded values when the `Decimals` parameter is applied.

### Custom trade <Anchor :ids="['p.custom_trade']" />

When this flag is enabled, the standard spread price calculation is disabled. Instead, the value displayed as the spread price in the [Finres history](interface.md#finres_history) and [Finres for today](interface.md#finres_for_today) widgets in the `Price` field will be determined by the result of the formula entered in the [Trade formula](params-description.md#p.trade_formula) field. Therefore, ensure that a valid formula is provided in the [Trade formula](params-description.md#p.trade_formula) field when enabling this flag.

### Trade formula <Anchor :ids="['p.trade_formula']" />

A formula written in [C++](c-api.md#cpp) programming language used to calculate the spread value displayed in the `Price` field of the [Finres history](interface.md#finres_history) and [Finres for today](interface.md#finres_for_today) widgets. You write only the function body and must return a value of type `double`. The function is called at the moment when all necessary trades for calculating the spread and adding it to the table are received (note that trades may not be present for all financial instruments in the portfolio). For each financial instrument, no more than one trade will be available; if multiple trades occurred for a given instrument within the same spread calculation, only one trade will be accessible, with aggregated volume and average price.

**Important!** Values produced by this formula are used exclusively in the `Price` field of the [Finres history](interface.md#finres_history) and [Finres for today](interface.md#finres_for_today) widgets and nowhere else. The financial result shown in the `Fin res` field of the [Portfolios table](interface.md#portfolios_table) widget is calculated directly from trade prices and does not depend on the output of this formula.

**Non-obvious point!** The default formula code returns a zero value and is not suitable for use in live trading.

### Extra formulas <Anchor :ids="['p.ext_formulas']" />

A flag that enables the calculation of `Extra field#1` and `Extra field#2`.

### Extra field#1 and Extra field#2 <Anchor :ids="['p.ext_field1_', 'p.ext_field2_']" />

Fields for additional formulas written in [C++](c-api.md#cpp) programming language. You write only the function body and must return a value of type `double`.

### Shared formulas <Anchor :ids="['p._sh_f']" />

A flag; when enabled, allows editing fields of this portfolio from formulas in another portfolio. If disabled, any attempt to edit will throw an exception `std::domain_error` with the message
`Editing "<FIELD_NAME>" value is not allowed`.

### Disable portfolio <Anchor :ids="['p.disabled']" />

Completely disable the portfolio from all calculations and trading without deleting it. This flag is not a substitute for the [re_sell/re_buy](params-description.md#p.re_buy) flags. When the `disabled` flag is set, the portfolio stops receiving both market data and updates on its own active orders, if any. Therefore, before using this flag, ensure that trading is disabled and there are no active orders on either leg of the portfolio. 

**Important!** When unchecking this flag and restoring portfolio operation, market order books may be reopened, potentially causing a temporary suspension of trading in all portfolios using the same data connection during the order book reinitialization period.

### Sell/Buy clicker <Anchor :ids="['p.sell_portfolio', 'p.buy_portfolio']" />

A "clicker" function to place a sell/buy order for a specified number of portfolios. Orders are placed immediately across all instruments in the portfolio. This provides a manual way to execute trades for the entire portfolio at once, without waiting for the `Sell`>=`Lim_sell` or `Buy`<=`Lim_buy` signals to trigger.

### To market <Anchor :ids="['p.to_market']" />

The "clicker" allows forcibly flattening the portfolio position. When clicked, the following actions occur: first, all orders are canceled except for algorithmically placed orders on the first leg; then, market orders are placed on the remaining instruments with the same volumes, adjusted according to the [k_sl](params-description.md#s.k_sl) parameter.  If it is evident that even full execution of these orders would not fully flatten the portfolio position, additional balancing orders are placed on the second-leg instruments — no more than one per instrument. These balancing orders are also placed at market price, taking into account the [k_sl](params-description.md#s.k_sl) parameter.

### Place order <Anchor :ids="['p.order_security']" />

Allows placing an order on one of the portfolio instruments without waiting for the portfolio's configured conditions to trigger, including when portfolio trading is disabled. To use this option, click the blue cell in the `Place order` column of the `Portfolios table` ,  set the desired order parameters, and then click the `Place order` button.  
When trading is enabled, an order placed this way may trigger the following mechanisms:  
`Hedge (sec)`, `SLE`, `TE`.  
An order placed in this manner can be canceled either manually via the exchange terminal or using the [Hard stop](getting-started.md#portfolio_actions.hard_stop) button.

### Sell/Buy <Anchor :ids="['p.sell', 'p.buy']" />

`Sell` – calculated sell price. Non-editable parameter.
`Buy` – calculated buy price. Non-editable parameter.  
Simplified formula for two financial instruments:

${Is\enspace first: On\enspace buy=Buy, Second\enspace leg: On\enspace buy=Sell}$

${Buy=ask_1Ratio\_sign_1ratio_1-bid_2Ratio\_sign_2ratio_2}$

${Sell=bid_1Ratio\_sign_1ratio_1-ask_2Ratio\_sign_2ratio_2}$

${Ratio\_sign =+\enspace or\enspace \times}$

Formulas for calculating `Sell` and `Buy` for any number of legs:

$$Buy=\sum_{i} 
        \begin{cases}-bid_i,& On\enspace buy_i=Sell\\
                     ask_i,& On\enspace buy_i=Buy\end{cases} 
        \begin{cases}+,& Ratio\_sign_i=+\\
                \times,& Ratio\_sign_i=\times\end{cases} 
        ratio_i$$

$$Sell=\sum_{i} 
        \begin{cases}bid_i,& On\enspace buy_i=Buy\\
                  -ask_i,& On\enspace buy_i=Sell\end{cases} 
        \begin{cases}+,& Ratio\_sign_i=+\\
                \times,& Ratio\_sign_i=\times\end{cases} 
	ratio_i$$


### Price_s/Price_b <Anchor :ids="['p.price_s', 'p.price_b']" />

`Price_s` – the price at which a sell order is placed for the [Is first](params-description.md#s.is_first) financial instrument, calculated as the inverse function of [Sell](params-description.md#p.sell), where the [Sell](params-description.md#p.sell) price is replaced with [Lim_Sell](params-description.md#p.lim_s). Non-editable parameter.  
`Price_b` – the price at which a buy order is placed for the [Is first](params-description.md#s.is_first) financial instrument, calculated as the inverse function of [Buy](params-description.md#p.buy), where the [Buy](params-description.md#p.buy) price is replaced with [Lim_Buy](params-description.md#p.lim_b). In general, this is the price at which the robot "wants" to buy or sell the [Is first](params-description.md#s.is_first) instrument. 
Non-editable parameter.

Formulas for calculating `Price_s` and `Price_b` for two financial instruments:

$$Price\_s=\left(Lim\_sell-ask_2
\begin{cases}+,& Ratio\_sign_2=+\\
        \times,& Ratio\_sign_2=\times\end{cases}
ratio_2\right)
\begin{cases}-,& Ratio\_sign_1=+\\
        /,& Ratio\_sign_1=\times\end{cases}
ratio_1 - k_1$$

$$Price\_b=\left(Lim\_buy+bid_2
\begin{cases}+,& Ratio\_sign_2=+\\
        \times,& Ratio\_sign_2=\times\end{cases}
ratio_2\right)
\begin{cases}-,& Ratio\_sign_1=+\\
        /,& Ratio\_sign_1=\times\end{cases}
ratio_1 + k_1$$

Formulas for calculating `Price_s` and `Price_b` for any number of legs:
   
$$Price\_s=\left(Lim\_sell_i-\sum_{i \neq isfirst}
\begin{cases}bid_i,& On\enspace buy_i=Buy\\
                  -ask_i,& On\enspace buy_i=Sell\end{cases} 
        \begin{cases}+,& Ratio\_sign_i=+\\
                \times,& Ratio\_sign_i=\times\end{cases} 
	ratio_i
\right) 
               \begin{cases}
	          -,& Ratio\_sign=+\\
                  /,& Ratio\_sign=\times 
	       \end{cases} 
                 ratio\_s_{isfirst} - k_{isfirst}$$

$$Price\_b=\left(Lim\_buy_i-\sum_{i \neq isfirst}
\begin{cases}-bid_i,& On\enspace buy_i=Sell\\
                     ask_i,& On\enspace buy_i=Buy\end{cases} 
        \begin{cases}+,& Ratio\_sign_i=+\\
                \times,& Ratio\_sign_i=\times\end{cases} 
        ratio_i
\right) 
             \begin{cases}
	       -,& Ratio\_sign=+\\
               /,& Ratio\_sign=\times 
	     \end{cases} 
                ratio\_b_{isfirst} + k_{isfirst}$$


### Sell/Buy status <Anchor :ids="['p.sell_status', 'p.buy_status']" />

Status of the sell/buy order for the [Is first](params-description.md#s.is_first) financial instrument, placed for quoting in [Quote](params-description.md#p.quote) mode or upon meeting the condition [Buy](params-description.md#p.buy) ≥ [Lim_Buy](params-description.md#p.lim_b) for a buy order and [Sell](params-description.md#p.sell) ≥ [Lim_Sell](params-description.md#p.lim_s) for a sell order. Thus, the `Sell status` and `Buy status` fields display the statuses of two specific orders. Orders placed via the clicker are not reflected in these fields.

The following statuses are possible:

- `free` - no order is present
- `adding` - order is being placed (a command to place the order has been sent to the exchange; confirmation not yet received)
- `moving` - order is being modified (a command to change the order has been sent to the exchange; confirmation not yet received)
- `deleting`/`first_deleting`/`sl_deleting` - order is being canceled (a cancel command has been sent to the exchange; confirmation not yet received)
- `running` - order is active on the exchange (confirmation of successful placement received; no other pending commands for this order)

An order may remain in the `free` and `running` states for extended periods, while all other states are transitional. When connected via transactional API and operating online, orders should not remain in a transitional state for more than a few seconds.

To release a "stuck" order, double-click the corresponding cell in the table. Manually changing the status may cause the robot to lose track of the order; this action is recommended only in exceptional cases.

### Return first <Anchor :ids="['p.return_first']" />

Turnover for the [Is first](params-description.md#s.is_first) financial instrument, calculated since the server part of the robot started, as the sum of absolute values of traded lot quantities for the [Is first](params-description.md#s.is_first) instrument. Can be reset to zero by double-clicking. The value is displayed in the same unit as the instrument position shown in the exchange terminal (unless otherwise specified for a particular connection).

**Important!** For display on the website, [lot_size](params-description.md#pp.lot_size) is used. When using [С++ Formulas](c-api.md#cpp) or [API](api.md#api) , to obtain the correct parameter value, you must manually multiply by [lot_size](params-description.md#pp.lot_size) .

### Fin res <Anchor :ids="['p.fin_res']" />

Estimated financial result of the portfolio, calculated using the formula:

$$Fin\enspace res=Opened+Commission\enspace sum+\sum_{i\in secs}Curpos_i \times lotSize_i \times Mult_i \times
   \begin{cases} 
     secBid_i, &\text{if } Curpos_i>0\\ 
   secask_i, &\text{if } Curpos_i<0 
   \end{cases},$$

where secBid<sub>i</sub> - best buy price of the portfolio instrument;  
secask<sub>i</sub> - best sell price of the portfolio instrument;  
lotSize<sub>i</sub> - multiplier to convert integer volumes into fractional ones;  
Curpos<sub>i</sub> - current position of the portfolio instrument;  
Mult - [Fin res multiplier](params-description.md#s.fin_res_mult) of the portfolio instrument;  
secs - list of portfolio instruments.

### Fin res wo C <Anchor :ids="['p.fin_res_wo_c']" />

`Fin res` without commission. Calculated using the formula:

$$Fin\enspace res=Opened+\sum_{i\in secs}Curpos_i \times lotSize_i \times Mult_i \times 
   \begin{cases} 
     secBid_i, &\text{if } Curpos_i> 0\\ 
   secask_i, &\text{if } Curpos_i< 0 
   \end{cases},$$

where secBid<sub>i</sub> - best buy price of the portfolio instrument;  
secask<sub>i</sub> - best sell price of the portfolio instrument;  
lotSize<sub>i</sub> - multiplier to convert integer volumes into fractional ones;  
Curpos<sub>i</sub> - current position of the portfolio instrument;  
Mult<sub>i</sub> - [Fin res multiplier](params-description.md#s.fin_res_mult) of the portfolio instrument;
secs - list of portfolio instruments.

### Is trading <Anchor :ids="['p.is_trading']" />

Displays the current trading status of the portfolio. Possible values are:

- `Not trading` - trading for the portfolio is disabled (i.e., both [re_sell](#p.re_sell) and [re_buy](#p.re_buy) flags are cleared), and there are no active orders for the portfolio on exchanges;
- `Trading`- trading for the portfolio is enabled (i.e., at least one of the [re_sell](#p.re_sell) or [re_buy](#p.re_buy) flags is set);
- `Has active orders` - trading for the portfolio is disabled (i.e., both [re_sell](#p.re_sell) and [re_buy](#p.re_buy) flags are cleared), but there are still active orders for this portfolio on exchanges.

Non-editable parameter.

### Comment <Anchor :ids="['p.comment']" />

A comment can be added to each portfolio if needed. Maximum allowed number of characters is 100.

### Color <Anchor :ids="['p.color']" />

The portfolio can be highlighted with a color in the `color` field, if necessary..

## Portfolio Instrument Parameters 

Below is a description of portfolio instrument parameters. All parameters are editable unless otherwise specified.

### SecKey <Anchor :ids="['s.sec_key']" />

Unique identifier of the portfolio instrument. Non-editable parameter.

### SecBoard <Anchor :ids="['s.sec_board']" />

Trading board (mode) of the portfolio instrument. Non-editable parameter.

### SecCode <Anchor :ids="['s.sec_code']" />

Code of the portfolio instrument. Non-editable parameter.

### Exchange <Anchor :ids="['s.sec_type']" />

Name of the exchange where the financial instrument is traded. Non-editable parameter.

### Curpos <Anchor :ids="['s.pos']" />

Current portfolio position in this instrument. The value is displayed in the same unit as the instrument position shown in the exchange terminal (unless otherwise specified for a particular connection).

**Important!** For display on the website, [lot_size](params-description.md#pp.lot_size) is used. When using [С++ Formulas](c-api.md#cpp) or [API](api.md#api) ,  to obtain the correct parameter value, you must manually multiply by [lot_size](params-description.md#pp.lot_size).

### Count type <Anchor :ids="['s.count_type']" />

This parameter allows selecting a constant value for [Count](params-description.md#s.count) or using a [Count formula](params-description.md#s.count_formula)

### Count <Anchor :ids="['s.count']" />

The quantity of the instrument in one portfolio unit. The value is displayed in the same unit as the instrument position shown in the exchange terminal (unless otherwise specified for a particular connection).

**Important!** For display on the website, [lot_size](params-description.md#pp.lot_size) is used. When using [С++ Formulas](c-api.md#cpp) or [API](api.md#api), to obtain the correct parameter value, you must manually multiply by [lot_size](params-description.md#pp.lot_size).

**Important!** When [Virt 0 pos](params-description.md#p.virtual_0_pos) is enabled, `Count` – represents the minimum quantity the robot will trade for the corresponding instrument; otherwise, an order with a volume smaller than  `Count` may be placed (e.g., when closing a position or to reach [v_min/v_max](params-description.md#p.v_min)).

### Count formula <Anchor :ids="['s.count_formula']" />

The number of lots of the instrument in one portfolio, defined as code in [C++](c-api.md#cpp). programming language. You write only the function body and must return a value of type `double`.

**Important!** The values of [Count](params-description.md#s.count)
 or [Count formula](params-description.md#s.count_formula) define the ratio between the positions of portfolio instruments (the ratio within a specific trade may differ). For this reason, the value of [Count formula](params-description.md#s.count_formula) does not depend on the order direction being placed.

**Important:** It is strongly recommended to never return a value of 0 for the [Is first](params-description.md#s.is_first) financial instrument. If you wish to stop trading, use the `Ratio formula` and set appropriate spread values. If you do end up with a [Count](params-description.md#s.count)
equal to 0 for the [Is first](params-description.md#s.is_first) financial instrument, the portfolio will not trade any financial instruments, and when calculating the portfolio position, wherever division by the [Count](params-description.md#s.count) of the
 [Is first](params-description.md#s.is_first) instrument (which is 0 in your case) is required, division by 1 will be used instead.

### On buy <Anchor :ids="['s.on_buy']" />

Determines whether we will buy or sell the instrument when a buy signal is triggered on the main instrument. This parameter is configurable only for the second leg. For the first leg, it is always `On Buy` = `Buy`. by default. When a sell signal is triggered, the robot will take the opposite action.

**Example:**
For the`is_first` instrument `On Buy` = `Buy`
For the second leg `On Buy` = `Sell`
With these settings, when a buy signal is triggered, the robot will attempt to buy the first leg and then sell the second leg.
When a sell signal is triggered, the robot will attempt to sell the first leg and then buy the second leg.

For the  `is_first` instrument `On Buy` = `Buy`
For the second leg `On Buy` = `Buy`
With these settings, when a buy signal is triggered, the robot will attempt to buy both legs.
When a sell signal is triggered, the robot will attempt to sell both legs.

### Is first <Anchor :ids="['s.is_first', 'is-first']" />

Indicates whether the financial instrument is the primary (main) instrument of the portfolio. The portfolio position is calculated based on the main financial instrument. The [On buy](params-description.md#s.on_buy) setting for this instrument is always treated as [Buy](params-description.md#p.sell).

### k <Anchor :ids="['s.k']" />

Sets the size of artificial slippage (offset from the market price): when buying, the order price is `ask` + `k`;  when selling, the order price is `bid`−`k`, where `bid` and `ask` – are the best bid and ask prices, respectively).

### k_sl <Anchor :ids="['s.k_sl']" />

Analogous to the `k`, parameter, but used only when re-quoting orders triggered by [SLE](params-description.md#s.sle) and [TE](params-description.md#s.te).  Sets the size of artificial slippage (offset from market price): for a buy order, the placement price is `ask` + `k_sl`; for a sell order, the placement price is `bid`−`k_sl`, where `bid` and `ask` – are the best bid and ask prices, respectively.

### SLE <Anchor :ids="['s.sle']" />

Enable/disable stop-loss re-quoting functionality. Orders re-quoted due to stop-loss will subsequently be re-quoted according to a specific [algorithm](algorithm-comments.md#sl_timer).

### SL <Anchor :ids="['s.sl']" />

Stop-loss value; when reached, the order (if not yet filled) must be canceled and resubmitted at the current market price. The stop-loss is measured from the original order placement price.

### TE <Anchor :ids="['s.te']" />

Parameter responsible for enabling/disabling timer-based re-quoting. Orders re-quoted due to timer will subsequently be re-quoted according to a specific [algorithm](algorithm-comments.md#sl_timer).

### Timer <Anchor :ids="['s.timer']" />

Defines the time interval after which an unfilled order should be canceled and resubmitted at the current market price.

### Percent of quantity <Anchor :ids="['s.percent_of_quantity']" />

If the volume available at the best bid or ask price on the exchange (or within the found volume in the order book when [Type price](params-description.md#p.price_type) = `Orderbook` or [Type price](params-description.md#p.price_type) = `Orderbook + filter`) contains a sufficient percentage (%) of the order volume for the non-[Is first](params-description.md#s.is_first) instrument, and this condition holds true for all non-[Is first](params-description.md#s.is_first) instruments, then an order may be placed on the [Is first](params-description.md#s.is_first) instrument. Thus, if there is insufficient hedge volume in the second leg, the order on the first leg will not be placed, even if a buy or sell signal is present.

### Ratio sign <Anchor :ids="['s.ratio_sign']" />

The sign used before the [Ratio](params-description.md#s.ratio) coefficient when calculating [Sell](params-description.md#p.sell) and [Buy](params-description.md#p.buy) prices: either ”+” or ”×”.

### Ratio <Anchor :ids="['s.ratio']" />

Coefficient used in the calculation of [Sell](params-description.md#p.sell) and [Buy](params-description.md#p.buy) prices.

### Fin res multiplier <Anchor :ids="['s.fin_res_mult']" />

`Fin res multiplier` - a multiplier used to calculate the financial result, ensuring all prices are converted into the same unit of measurement.

### Commission type and Commission <Anchor :ids="['s.comission_sign', 's.comission']" />

`Comission type` - parameter defining the commission calculation method. Allows setting either a fixed fee or a percentage of the trade volume.

`Commission` - instrument-specific commission. If `Commission type` is set to `%`, the commission is specified as a percentage of the trade price; if set to `pt`, the commission is specified in the same unit used for the portfolio's financial result (e.g., for Sberbank stock, commission is typically 0.01% of the trade value; for a futures contract on Sberbank stock, it is often 0.25 points for scalping trades).

### Client code <Anchor :ids="['s.client_code']" />

Client code from which orders for this financial instrument should be placed. An empty string means using the "default" client code. Displays all available codes eligible for trading the given instrument. The code `virtual` means virtual trading and can be used for strategy testing. A code starting with [Round robin](params-description.md#s.client_code) indicates the use of the [Round robin](params-description.md#s.client_code) order routing mode.

**Important!** The [Round robin](params-description.md#s.client_code) mode means placing and canceling orders sequentially across all exchange connections associated with the same client code, following a specific algorithm. The behavior of this algorithm differs between the Moscow Exchange and cryptocurrency exchanges due to differences in market mechanics and connection types. On crypto exchanges, when using the [Round robin](params-description.md#s.client_code) mode, orders are placed and canceled sequentially through connections that share the same client code. For some crypto exchanges, this allows increasing the total throughput of a client account by using multiple API key pairs. On the Moscow Exchange, all connections with the same client code are kept in a queue, where their position depends on their current order submission speed (the faster connection takes priority). The queue order is updated no more than once per second, and resets every second, resulting in non-uniform load distribution. Only certain "important" orders are considered when measuring round-trip latency. Important orders include those placed on the first leg via the main algorithm (not via clicker, stop-loss, or other methods), but only when quoting is disabled. Also considered important are second-leg orders placed according to the core algorithm (i.e., after a fill on the first leg). Round-trip values are reset hourly to allow reassessment of each connection's speed and selection of the fastest one. Thus, for the Moscow Exchange, the fastest connection is selected, and orders are placed through it whenever possible.

**Important!** The client code cannot be empty for financial instruments with a [Count](params-description.md#s.count) different from zero.

<Anchor hide :ids="['virt_tr_daily_limit']" />
**Important!** By default, a single live robot is allowed up to 100,000 virtual trades per day; free robots are allowed up to 1,000,000 virtual trades per day.
If the virtual trade limit is exceeded, trading will be automatically disabled for the portfolio when attempting to place an order in `virtual` mode, and a log message will appear:
`Trading on "PORTFOLIO_NAME" was stopped. Daily limit of robot's virtual trades was exceeded`

### MM <Anchor :ids="['s.mm']" />

A flag; when enabled, all orders for the instrument are submitted with the "market maker" designation (supported only by certain connections). Use of this designation must be explicitly approved by the exchange.

### TP <Anchor :ids="['s.tp']" />

Take-profit level. Used when [Type](params-description.md#p.portfolio_type) is set to `TP algo` or `TP algo 2`. The value is measured from the execution price of the order for the [Is first](params-description.md#s.is_first) instrument.

### Ratio type <Anchor :ids="['s.ratio_type']" />

Allows configuring whether a constant `Ratio` value or the result of the `Ratio formula` is used in calculating [Sell](params-description.md#p.sell) and [Buy](params-description.md#p.buy) prices.

### Ratio buy formula <Anchor :ids="['s.ratio_b_formula']" />

Parameter used in calculating the [Buy](params-description.md#p.buy) price, defined as code in [C++](c-api.md#cpp) programming language. You write only the function body and must return a value of type `double`.

### Ratio sell formula <Anchor :ids="['s.ratio_s_formula']" />

Parameter used in calculating the [Sell](params-description.md#p.sell) price, defined as code in [C++](c-api.md#cpp) programming language. You write only the function body and must return a value of type `double`.

### Depth OB <Anchor :ids="['s.depth_ob']" />

Maximum depth level of the order book up to which prices and volumes are calculated (measured in number of price steps, counting from bid/ask). Available only for non-[Is first](params-description.md#s.is_first) instruments, and used only in [Type price](params-description.md#p.price_type) = `Orderbook` and [Type price](params-description.md#p.price_type) = `Orderbook + filter` modes.  
if you have selected [Type price](params-description.md#p.price_type) = `Orderbook` and [Type price](params-description.md#p.price_type) = `Orderbook + filter`, you must monitor the `Depth OB` value  if it is set too low, the robot will not be able to calculate prices and volumes, resulting in zero values for the `Sell` and `Buy` parameters.

### Calc price OB <Anchor :ids="['s.ob_c_p_t']" />

Price type used to calculate [Sell](params-description.md#p.sell), [Buy](params-description.md#p.buy), [Price_s](params-description.md#p.price_s) and [Price_b](params-description.md#p.price_b). Available only for non-[Is first](params-description.md#s.is_first) financial instruments and used only in [Type price](params-description.md#p.price_type) = `Orderbook` and [Type price](params-description.md#p.price_type) = `Orderbook + filter` modes:

- **Deepest** – price of the order book level at which the required volume is reached;
- **Weighted avg.** –  volume-weighted average price across all levels up to and including the one where the required volume is filled.

### Trading price OB <Anchor :ids="['s.ob_t_p_t']" />

Price type used during trading. Available only for non-[Is first](params-description.md#s.is_first) financial instruments and used only in [Type price](params-description.md#p.price_type) = `Orderbook` and [Type price](params-description.md#p.price_type) = `Orderbook + filter` modes:

- **Deepest** – price of the order book level at which the required volume is reached;
- **Weighted avg.** –  volume-weighted average price across all levels up to and including the one where the required volume is filled.

_Example:_  
`Trading price OB`- Deepest:  

Suppose you are looking to buy 1000 lots in the order book: 500 lots are available at price 100, 490 lots at price 99, and the remaining 10 lots at price 5. In this case, the resulting price will be 5.  

`Trading price OB` - Weighted avg:  

Using the same example: (500 × 100 + 490 × 99 + 10 × 5) / 1000 = 98.56 — this is the resulting price. Before placing the order, the robot rounds the price according to the instrument’s price step. For sell orders, rounding is upward; for buy orders, rounding is downward. So, if the price step in this example is 1, the selling price will be 99.

### Level to0 <Anchor :ids="['s.mc_level_to0']" />

If for at least one financial instrument in the portfolio the absolute difference between [Mark price](params-description.md#mark-price) and [Liquidation price](params-description.md#liquidation-price) is strictly less than this value, then set the [To0](params-description.md#p.to0) flag and prevent it from being cleared while the condition holds; when the condition no longer applies, clear the [To0](params-description.md#p.to0) flag. This allows preventing position increases for a given portfolio while the current price is dangerously close to the liquidation price.

### Level close <Anchor :ids="['s.mc_level_close']" />

If for at least one financial instrument in the portfolio the absolute difference between [Mark price](params-description.md#mark-price) and [Liquidation price](params-description.md#liquidation-price) is strictly less than this value, then set the [To0](params-description.md#p.to0) flag and prevent it from being cleared while the condition holds (clear the flag when the condition no longer applies). Every 5 seconds, place an order in the direction of position closing with volume [v_out_left](params-description.md#p.v_out_left) portfolios, continuing until the condition no longer holds or the portfolio position reaches zero. Thus, the portfolio position is gradually reduced following hedging rules until the liquidation price returns to a safe level.

### Leverage <Anchor :ids="['s.leverage']" />

Parameter defining the leverage for placed orders.

### Decimals <Anchor :ids="['s.decimals']" />

Parameter that determines the number of decimal places displayed for parameters with fractional values.

**Important!** This parameter also controls the number of decimal places shown in trade prices for this financial instrument within the spreads table. When changed, existing trades already added to the table will retain their original precision and will not be updated.

### Max trans time <Anchor :ids="['s.max_trans_musec']" />

Maximum allowed Round trip time (i.e., the difference between the time the exchange response is received and the time the order command was sent), in microseconds, for this instrument. If this threshold is exceeded, order placement on the first leg will be suspended for [Ban_period](params-description.md#s.ban_period) seconds.

### Ban period <Anchor :ids="['s.ban_period']" />

The duration in seconds during which the robot will not place any orders on the first leg of the portfolio. Used in conjunction with [Max trans time](params-description.md#s.ban_period).

<Anchor hide :ids="['notifications-params']" />
## Notifications Parameters 

The robot can notify the user about the occurrence of certain events. In addition to purely signaling functionality, all notifications can disable trading for a given portfolio.
When the corresponding event occurs, the notification appears on the website and also in the [Telegram-bot](getting-started.md#тelegram-бот) (if it is connected and configured).

For all notifications that have parameters `Time (sec)` and `Value`, the logic of these parameters is the same:
1. The current value of the selected parameter is recorded at the current moment in time.
2. - If within the time period of `Time (sec)` seconds the value of the selected parameter changes by an amount strictly greater than the specified limit (i.e., if the saved value is `X`, then for the new value `Y` the inequality $\lvert X - Y \rvert > \mathit{Value}$), the notification is triggered and the algorithm proceeds to step `1`.
   - If within the time period of `Time (sec)` seconds the value does not change by more than the specified limit, then after `Time (sec)` seconds have elapsed, the algorithm proceeds to step `1`.

Thus, the user will receive a notification if, within no more than `Time (sec)` seconds from the moment a value was recorded, the current value of the specified parameter differs from this recorded value by strictly more than `Value`.

There are also notifications configured for a specific exchange trading connection; they are described in the section [Position Parameters](params-description.md#параметры-позиций).

### FinRes fall

Notification about financial result drop:

- `Fall (%)` - percentage drop in financial result that should trigger the notification;
- `Time (sec)` - time period in seconds over which the drop is measured;
- `Min fall (pt)` - minimum change that should trigger a response;
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled).

**Important!**  Works only when trading is enabled for the portfolio

### Lim_Sell change and Lim_Buy change

Notify about changes in the portfolio's [Lim_Sell/Lim_Buy](params-description.md#p.lim_s):

- `Time (sec)` - time period in seconds over which the change is measured;
- `Value` - threshold value for the change in [Lim_Sell/Lim_Buy](params-description.md#p.lim_s);
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled.

**Important!**  Works only when trading is enabled for the portfolio

### Severe sell change and Severe buy change

Notify about "sharp" changes in the portfolio's [Sell/Buy](params-description.md#p.sell):

- `Time (sec)` - time period in seconds over which the change is measured;
- `Value` -  threshold value for the change in [Sell/Buy](params-description.md#p.sell);
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled).

**Important!**  Works only when trading is enabled for the portfolio.

**Important!** Note that when prices for the portfolio’s financial instruments are unavailable and/or when it is impossible to calculate [Sell/Buy](params-description.md#p.sell), the values of [Sell/Buy](params-description.md#p.sell) parameters will be equal to `0`.

### Severe pos change

Notify about a "sharp" change in the portfolio's position [Pos](params-description.md#p.pos) портфеля:

- `Time (sec)` - time period in seconds over which the change is measured;
- `Value` - threshold value for the position change;
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled).

**Important!**  Works only when trading is enabled for the portfolio.

### Too much running orders

Notify about an excessive number of active orders for non-[Is first](params-description.md#s.is_first) instruments in the portfolio. That is, if for each non-[Is first](params-description.md#s.is_first) instrument in the portfolio we obtain the number of active orders and take the maximum among these values, then the notification will be sent if this maximum is strictly greater than the specified percentage of [Max not hedged](params-description.md#p.max_not_hedged).

- `Percent (%)` - threshold percentage;
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled).

### Too much not hedged

Notify about an excessively large unhedged position for the [Is first](params-description.md#s.is_first) instrument in the portfolio:

- `Limit portfolios` - threshold value for the unhedged position (calculated in number of portfolios); in the robot's algorithm, the condition uses the "strictly greater than" comparison;
- `Stop trading` - disable trading for the portfolio together with the notification (the schedule will also be disabled).


## User Parameters <Anchor :ids="['p.user_fields']" />

The robot includes a group of 20 user-defined parameters called `User fields`  with identifiers ranging from 0 to 19. These parameters are not used in the robot’s main algorithm. They can be used either to display values computed in [C++ Formulas](c-api.md#cpp), or conversely as input parameters for formula calculations. The values of these parameters are preserved across robot restarts. In the main table of the [Portfolios table](interface.md#portfolios_table) widget, these parameters appear as table columns named `User field#0` ... `User field#19`. In the portfolio settings form, the `User fields` parameters are configured on a separate tab, where both the value and label of each parameter can be set. Parameter values are of type `double`.

**Non-obvious detail!**  
Column headers in the main table of the [Portfolios table](interface.md#portfolios_table) widget are fixed and cannot be renamed — you cannot change `User field#0` ... `User field#19` into custom names.  Moreover, a single user field from one column may be used differently in formulas across various portfolios. However, on the `USER FIELDS` tab in the portfolio settings within the [Portfolios table](interface.md#portfolios_table) widget, you can define custom labels for the user fields. Here is how a label is set in the settings:

![Alt text](@images/uf_form.png)

And here is how it might appear in the main table of the [Portfolios table](interface.md#portfolios_table) widget when different portfolios have different field labels:

![Alt text](@images/uf_table.png)

## Position Parameters

### Instrument Position Parameters

Instrument position parameters are displayed separately for each connection on the "Positions/Balance" tab of that connection and are presented as a table. The rows of the table correspond to the instruments of this connection used in the robot’s portfolios. If multiple client accounts are accessible through this trading connection, each row will represent a pair (client account, instrument). Instruments with zero position may be hidden (to do this, uncheck the `Show_zero_poses`flag). Below are descriptions of the table columns; parameters are assumed to be editable unless otherwise specified.

#### SecKey

Unique instrument identifier. Corresponds to the portfolio instrument parameter [SecKey](params-description.md#s.sec_key). Non-editable parameter.

#### SecCode

Instrument code. Corresponds to the portfolio instrument parameter [SecCode](params-description.md#s.sec_code). Non-editable parameter.

#### Pos

Exchange position for the instrument. Non-editable parameter.

#### Robot pos

Total instrument position across all portfolios in the robot trading via this connection, using the specified financial instrument and client account. Non-editable parameter.

#### Mark price

"Mark" price of the instrument. Non-editable parameter.
If `Mark price` reaches `Liquidation price`, the instrument's position will be forcibly closed by the exchange.

#### Liquidation price

Instrument liquidation price. Non-editable parameter.
If `Mark price` reaches `Liquidation price`, the instrument's position will be forcibly closed by the exchange.

#### Pos lag

Value against which the difference between `Pos` and `Robot pos` is compared.  The comparison itself and subsequent actions are determined by the parameter [Check equality](params-description.md#check-equality).

#### Check equality

If the flag is set, then in the following situation:

$pos-robot\_pos\neq pos\_lag$

you will receive log notifications indicating that the exchange position and robot position do not match.
(`pos` - position on the exchange, `robot_pos` - position in the robot across portfolios trading this financial instrument via this connection)
If the flag is not set, notifications will be sent only if:

$|pos-robot\_pos|>pos\_lag$$

#### Tgr notify

If the flag is set, send notifications about mismatch between robot and exchange positions to Telegram.

#### Pos leveling

Place an order with specified direction, price, and volume. By default, direction and volume are set to align the exchange position with the robot's position (this order does not change positions in the robot’s portfolio instruments).

### Currency Position Parameters

Currency position parameters are displayed separately for each connection on the "Positions/Balance" tab of that connection and presented as a table. The rows correspond to currencies/cryptocurrencies included in the instruments traded through this connection and used in the robot’s portfolios. If multiple client accounts are accessible via this trading connection, each row represents a pair (client account, currency). Currencies with zero balance may be hidden (to do this, uncheck the `Show zero` poses flag). Below are descriptions of the table columns; parameters are assumed to be editable unless otherwise specified.

#### Currency

Short name of the currency/cryptocurrency.

#### Limit

Currency limit.


## Portfolio Parameter Validation Rules upon Portfolio/Instrument Creation or Editing

If any condition listed below is TRUE, then such settings are NOT valid:

### For the portfolio

1) The [Quote](params-description.md#p.quote) parameter is disabled, while [Simply first](params-description.md#p.simply_first) is enabled;

2) The robot build lacks order book support and the [Simply first](params-description.md#p.simply_first) parameter is enabled;

3) The robot build lacks order book support and the value of the [Type price](params-description.md#p.price_type) parameter is set to bid/ask;

4) The [Quote](params-description.md#p.quote) parameter is disabled and [Only maker](params-description.md#p.maker) is enabled;

5) The value of the [Max not hedged](params-description.md#p.max_not_hedged) parameter is greater than 1, and the financial instrument's position on the exchange has separate buy and sell legs;

6) The values of the [v_min/v_max](params-description.md#p.v_min) parameters have opposite signs (or one of them equals 0), and the financial instrument's position on the exchange has separate buy and sell legs;

### For the financial instrument

1) For OKEX-SPOT financial instruments: Client code does not end with "/cash", "/cross_base", "/cross_quote" or "/isolated" or is set to “virtual”;

2) For OKEX-FUT financial instruments: Client code does not end with "/cross" or "/isolated" or is set to “virtual”;

3) For the first leg, [Count type](params-description.md#s.count_type) = constant and [Count](params-description.md#s.count) = 0;

4) For the first leg, [On_by](params-description.md#s.on_buy) = Sell;

5) An empty value is selected for [Сlient code](params-description.md#s.client_code) and [Count](params-description.md#s.count) is not 0;

### The following portfolio parameters are prohibited from being changed when the portfolio is trading or has active orders

1) [Is first](params-description.md#s.is_first)

2) [Client code](params-description.md#s.client_code)

3) [On_by](params-description.md#s.on_buy)

4) [Leverage](params-description.md#s.leverage)

5) [Curpos](params-description.md#s.pos)

6) [Count](params-description.md#s.count)

7)  [Count formula](params-description.md#s.count_formula)

8) [TP](params-description.md#s.tp)

9) [Ratio](params-description.md#s.ratio)

10) [Ratio type](params-description.md#s.ratio_type)

11) [Ratio sign](params-description.md#s.ratio_sign)

12) [Ratio buy formula](params-description.md#s.ratio_b_formula)

13) [Ratio sell formula](params-description.md#s.ratio_s_formula)

14) [Custom trade](params-description.md#p.custom_trade')

15) [Extra formulas](params-description.md#p.ext_formulas)

16) [Trade formula](params-description.md#p.trade_formula)

17) [Extra field#1](params-description.md#p.ext_field1_)

18) [Extra field#2](params-description.md#p.ext_field2_)

19) [Type trade](params-description.md#p.type_trade)

20) [Type price](params-description.md#p.price_type)

21) [Type](params-description.md#p.type)
