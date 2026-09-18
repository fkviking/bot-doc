# 8. Algorithm Notes

This page contains detailed descriptions of non-obvious aspects of the bot algorithm.

## 8.1. Specifics of Using Market Depth (Order Book) Data

The bot uses order book tables/streams to obtain instrument prices. A key characteristic of working with order books is that the exchange does not send a fully formed, real-time order book. To minimize data transmission volume, the exchange first sends a snapshot of the order book for an instrument at a given moment, followed by incremental updates reflecting changes. The bot does not build order books for all available instruments — only for those used in active portfolios. Therefore, to add a new instrument to the list of those for which order books are maintained, the bot must re-open the snapshot stream and then apply incremental updates from the update stream. During the processing of the snapshot stream, the system temporarily suspends order book updates for all active instruments. Updates resume only after the snapshot stream is fully processed and closed, and incremental updates have resumed. The processing time depends on the number of instruments in the snapshot and the depth of the order books. As a result, during the order book reinitialization, price data for certain instruments may be temporarily unavailable. Reinitialization is required in most connection types because full order book snapshots or complete order logs are typically delivered over a single data stream. This means it is not possible to subscribe to data for specific instruments — data for all instruments is received, but only selected ones are actively used by the system.

The order book in the bot may be reinitialized in the following cases:

- Add a new portfolio;
- Adding a new instrument to a portfolio;
- Clearing the `Disabled` flag on a portfolio;
- Message sequence gaps in the incremental order book update stream over UDP connections to exchanges (the more portfolios and instruments you have, the higher the likelihood of such gaps).

This results in a temporary suspension of trading across all portfolios using instruments from the affected exchange. This behavior is not a malfunction—it is an expected part of the system's operation

## 8.2. Move Order Support

On certain connections, the bot supports submitting a specialized exchange order called a Move Order. This feature helps reduce the number of transactions and improve the trade-to-transaction ratio — particularly valuable in quoting (market-making) strategies — while also enhancing order persistence in the market. Since the specifics of using this command vary across markets and connection types, its application may be limited to the first leg of a portfolio or extended to instruments in both legs, depending on the connection. Currently, submission of this command is implemented for FIX connections on the Moscow Exchange stock and currency markets, as well as for TWIME connections on the Moscow Exchange derivatives market.

Using the Move Order command is optional for supported connections. This feature can be disabled when creating a new transactional connection.

## 8.3. Rules for moving Lim_Sell and Lim_Buy

These rules depend on [Shift_mode](params-description.md#p.shift_mode) parameter value.

Signal prices are also moved when an order cannot be placed due to [v_min](params-description.md#p.v_min), [v_max](params-description.md#p.v_max), [To0](params-description.md#p.to0) restrictions. If the bot cannot buy due to [v_max](params-description.md#p.v_max) restrictions, then according to portfolio parameters [Limits timer](params-description.md#p.timer) and [Percent](params-description.md#p.percent), [Lim_Sell](params-description.md#p.lim_s) and [Lim_Buy](params-description.md#p.lim_b) prices are decreased by [K](params-description.md#p.k) parameter value, and if the bot cannot sell due to [v_min](params-description.md#p.v_min) restrictions, then according to portfolio parameters [Limits timer](params-description.md#p.timer) and [Percent](params-description.md#p.percent), [Lim_Sell](params-description.md#p.lim_s) and [Lim_Buy](params-description.md#p.lim_b) values are increased by [K](params-description.md#p.k) parameter value.

## 8.4. Behavior of Orders Re-Posted Based on SL or Timer

When the parameter [k_sl](params-description.md#s.k_sl) is zero or positive,  orders placed due to the following events: re-posting due to triggering of the [SL](params-description.md#s.sl) condition, re-posting due to triggering of the [Timer](params-description.md#s.timer) condition, or position closing or leveling according to schedule settings or by clicking the [To market](params-description.md#p.to_market) button, will be re-posted once per second until the order is filled,  trading is disabled via [Hard stop](getting-started.md#portfolio_actions.hard_stop) or a submission error is received. Re-posting will occur at a price of `bid` - [k_sl](params-description.md#s.k_sl) for sell orders and `offer` + [k_sl](params-description.md#s.k_sl) for buy orders.

This is an additional re-posting mechanism; it does not alter or depend on the existing settings of the [Timer](params-description.md#s.timer) or [TE](params-description.md#s.te) parameters. That is, it will be executed even if the [TE](params-description.md#s.te) flag is disabled.

## 8.5. Financial Result Calculation

[Financial result](params-description.md#pp.fin_res) as a portfolio parameter is calculated based on deals and there are no “exotic” cases associated with its calculation. However, there are cases where spreads will not appear in the financial result widgets ([Finres for today](interface.md#finres_for_today) and [Finres history](interface.md#finres_history)). 
The key rule to remember is: a spread is displayed only if there is a trade in the [Is first](params-description.md#s.is_first) instrument. If there is no such trade, no spread will be shown. 
For example, if your position becomes skewed for any reason and you rebalance it by clicking the [To market](params-description.md#p.to_market)button, you will not get a proper spread in these widgets. You will only see a single "skewed" spread entry that includes only the [Is first](params-description.md#s.is_first) instrument.
As an example: during flood control, trades may be executed on the first leg while the second leg cannot be submitted. This leads to one-sided skewed spreads on the first leg. After clicking [To market](params-description.md#p.to_market)button, trades on the second leg are executed (and correctly reflected in the financial result). However, since no matching trade occurs in the primary instrument, no spread is displayed in the table—although the financial result itself remains accurate.

Another scenario occurs when the [Count](params-description.md#s.count) value of the first leg exceeds the [Count](params-description.md#s.count) value of the second leg. For example, suppose you are trading a currency (e.g., USD/RUB) against futures on the derivatives market, with the currency as the first leg. In this case, the currency has a [Count](params-description.md#s.count) of 100, while the futures contract has a [Count](params-description.md#s.count) of 1, meaning you hedge every 100 currency units with one futures contract.
You place an order for 100 currency contracts. Suppose 60 are filled. No spread will appear in the table, as it would be inherently skewed — the second leg has not been traded yet. Then another 50 are filled, and again, no spread will be displayed. You then place one futures contract, which gets executed (and is correctly reflected in the financial result). However, it remains unclear which trades this execution should be linked to. If linked to the most recent trade (i.e., the 50-lot fill), the resulting spread would be clearly skewed. Attempting to associate it with earlier trades is not feasible, as real-world scenarios may be more complex than this simplified example.

## 8.6. On Pricing of Second-Leg Orders

Orders for second-leg instruments are priced as follows:
- A buy order is placed at the best ask price plus the offset [k](params-description.md#s.k) or plus [k_sl](params-description.md#s.k_sl) if the order is re-posted due to a stop-loss trigger or similar event.
- A sell order is placed at the best bid price minus the offset [k](params-description.md#s.k) or minus [k_sl](params-description.md#s.k_sl)if the order is re-posted due to a stop-loss trigger or similar event.
The best bid and ask prices for second-leg instruments are frozen at the moment the order for the [Is first](params-description.md#s.is_first) instrument is submitted. As a result, when a trade is executed on the [Is first](params-description.md#s.is_first) instrument , all other instruments in the portfolio are quoted with offsets based not on the current market prices, but on the best prices at the time the first-leg order was placed.
The only exception is when the [Equal price](params-description.md#p.equal_prices) parameter is enabled.

No alternative methods for pricing second-leg orders are supported beyond those described above.

## 8.7. On Order Submission Volumes

For certain exchanges (e.g., Deribit), if the order volume is not a multiple of the lot size, the submitted volume is automatically rounded down to the nearest whole number of lots. For example, if the lot size is 10 and the order size is 25, the actual order placed on the exchange will have a volume of 20 (rounding is always performed downward). If, as a result of this rounding, the order volume becomes zero, you will receive the rejection error `REASON_ZERO_AMOUNT_TO_MULTIPLE`.
