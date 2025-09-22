---
title: 8. Algorithm Notes
section: 8
---

# Algorithm Notes

This page contains detailed descriptions of non-obvious aspects of the bot algorithm.

## Specifics of Using Market Depth (Order Book) Data

The bot uses order book tables/streams to obtain instrument prices. A key characteristic of working with order books is that the exchange does not send a fully formed, real-time order book. To minimize data transmission volume, the exchange first sends a snapshot of the order book for an instrument at a given moment, followed by incremental updates reflecting changes. The bot does not build order books for all available instruments — only for those used in active portfolios. Therefore, to add a new instrument to the list of those for which order books are maintained, the bot must re-open the snapshot stream and then apply incremental updates from the update stream. During the processing of the snapshot stream, the system temporarily suspends order book updates for all active instruments. Updates resume only after the snapshot stream is fully processed and closed, and incremental updates have resumed. The processing time depends on the number of instruments in the snapshot and the depth of the order books. As a result, during the order book reinitialization, price data for certain instruments may be temporarily unavailable. Reinitialization is required in most connection types because full order book snapshots or complete order logs are typically delivered over a single data stream. This means it is not possible to subscribe to data for specific instruments — data for all instruments is received, but only selected ones are actively used by the system.

The order book in the bot may be reinitialized in the following cases:

- Add a new portfolio;
- Adding a new instrument to a portfolio;
- Clearing the `Disabled` flag on a portfolio;
- Message sequence gaps in the incremental order book update stream over UDP connections to exchanges (the more portfolios and instruments you have, the higher the likelihood of such gaps).

This results in a temporary suspension of trading across all portfolios using instruments from the affected exchange. This behavior is not a malfunction—it is an expected part of the system's operation

## Move Order Support

On certain connections, the bot supports submitting a specialized exchange order called a Move Order. This feature helps reduce the number of transactions and improve the trade-to-transaction ratio — particularly valuable in quoting (market-making) strategies — while also enhancing order persistence in the market. Since the specifics of using this command vary across markets and connection types, its application may be limited to the first leg of a portfolio or extended to instruments in both legs, depending on the connection. Currently, submission of this command is implemented for FIX connections on the Moscow Exchange stock and currency markets, as well as for TWIME connections on the Moscow Exchange derivatives market.

Using the Move Order command is optional for supported connections. This feature can be disabled when creating a new transactional connection.

## Rules for moving Lim_Sell and Lim_Buy

Signal prices [Lim_Sell](params-description.md#p.lim_s) and [Lim_Buy](params-description.md#p.lim_s) are moved only upon trade execution in the [Is first](params-description.md#s.is_first) instrument of the portfolio, except when [Always timer](params-description.md#p.always_limits_timer) is enabled.

The rules for moving signal prices can be divided into two cases: a sale occurred in the [Is first](params-description.md#s.is_first) instrument and a purchase occurred in the [Is first](params-description.md#s.is_first) instrument. Within each of these cases, the algorithm is further split into two subcases: the portfolio position before the trade was zero or non-zero.

We define the following notation:
- `diffpos` - signed lot quantity in the trade of the [Is first](params-description.md#s.is_first) instrument;
- `V` - [v_in_left](params-description.md#p.v_in_l) × [Count](params-description.md#s.count) or [v_out_left](params-description.md#p.v_out_l) × [Count](params-description.md#s.count), depending on whether the order opens or closes a position;
- [Count](params-description.md#s.count) - `Count` of the [Is first](params-description.md#s.is_first) instrument;
- [Curpos](params-description.md#s.pos) - current position in the [Is first](params-description.md#s.is_first) instrument of the portfolio (i.e., the just-executed trade is not yet included);
- subscript 0 - previous value of a parameter, subscript 1 — new value of a parameter. 
With this notation, the algorithm for moving signal prices is as follows:


- if a sell trade has been executed (with a quantity of `diffpos`):
    
    - if the current position before the trade was $curpos\neq 0$:

        $k3=\left(|{Lim\_Sell_0- Lim\_Buy_0}|-TP-K\right)\times\frac{V}{curpos},$

        $k4=
  \begin{cases}k3+K2, &\text{if}\enspace Lim\_Sell_0-Lim\_Buy_0\geq 0\\
              -k3+K2, &\text{if}\enspace Lim\_Sell_0-Lim\_Buy_0<0 
  \end{cases},$ 

        $Lim\_Buy_1= Lim\_Buy_0+\frac{|{diffpos}|}{V}\times 
    \begin{cases} 
       k4, &\text{if}\enspace curpos>0\\ 
       K1, &\text{if}\enspace curpos<0 
    \end{cases},$

        $Lim\_Sell_1=Lim\_Sell_0+\frac{|{diffpos}|}{V}\times
   \begin{cases} 
     K2, &\text{if}\enspace curpos>0\\ 
      K, &\text{if}\enspace curpos<0 
   \end{cases},$

    - if the current position before the trade was $curpos=0$:

        $Lim\_Sell_1=Lim\_Sell_0+\frac{|{diffpos}|}{V}\times K,$

        $Lim\_Buy_1=Lim\_Sell_0-TP,$

- if a buy trade has been executed (with a quantity of `diffpos`):

    - if the current position before the trade was $curpos\neq 0$:

        $k3=\left(|Lim\_Sell_0-Lim\_Buy_0|-TP-K\right)\times\frac{V}{curpos},$

        $k4=
  \begin{cases} 
    -k3+K2, &\text{if}\enspace Lim\_Sell_0-Lim\_Buy_0\geq 0\\
     k3+K2, &\text{if}\enspace Lim\_Sell_0-Lim\_Buy_0<0
  \end{cases},$
	
        $Lim\_Sell_1=Lim\_Sell_0-\frac{|{diffpos}|}{V}\times 
   \begin{cases} 
     k4, &\text{if}\enspace curpos<0\\
     K1, &\text{if}\enspace curpos>0 
   \end{cases},$
   	
        $Lim\_Buy_1=Lim\_Buy_0-\frac{|{diffpos}|}{V}\times 
   \begin{cases} 
     K2, &\text{if}\enspace curpos<0\\
      K, &\text{if}\enspace curpos>0 
   \end{cases},$

    - if the current position before the trade was $curpos=0$:
	
        $Lim\_Sell_1=Lim\_Buy_0+TP,$
	
        $Lim\_Buy_1=Lim\_Buy_0-\frac{|{diffpos}|}{V}\times K.$

Signal price adjustment also occurs when an order cannot be placed due to restrictions defined by [v_min](params-description.md#p.v_min), [v_max](params-description.md#p.v_max), [To0](params-description.md#p.to0). If the bot cannot buy due to [v_max](params-description.md#p.v_max) restrictions, then according to the portfolio parameters [Limits timer](params-description.md#p.timer) and [Percent](params-description.md#p.percent), the [Lim_Sell](params-description.md#p.lim_s) and [Lim_Buy](params-description.md#p.lim_b) prices are decreased by the value of the portfolio parameter [K](params-description.md#p.k), If the bot cannot sell due to [v_min](params-description.md#p.v_min) restrictions, then according to the portfolio parameters [Limits timer](params-description.md#p.timer) and [Percent](params-description.md#p.percent) the [Lim_Sell](params-description.md#p.lim_s) and [Lim_Buy](params-description.md#p.lim_b) values are increased by the value of the portfolio parameter [K](params-description.md#p.k).

## Behavior of Orders Re-Posted Based on SL or Timer <Anchor :ids="['sl_timer']" />

When the parameter [k_sl](params-description.md#s.k_sl) is zero or positive,  orders placed due to the following events: re-posting due to triggering of the [SL](params-description.md#s.sl) condition, re-posting due to triggering of the [Timer](params-description.md#s.timer) condition, or position closing or leveling according to schedule settings or by clicking the [To market](params-description.md#p.to_market) button, will be re-posted once per second until the order is filled,  trading is disabled via [Hard stop](getting-started.md#portfolio_actions.hard_stop) or a submission error is received. Re-posting will occur at a price of `bid` - [k_sl](params-description.md#s.k_sl) for sell orders and `offer` + [k_sl](params-description.md#s.k_sl) for buy orders.

This is an additional re-posting mechanism; it does not alter or depend on the existing settings of the [Timer](params-description.md#s.timer) or [TE](params-description.md#s.te) parameters. That is, it will be executed even if the [TE](params-description.md#s.te) flag is disabled.

## Financial Result Calculation

The financial result (in the sense of a simple numeric value) is calculated based on trades, and there are no "exotic" edge cases related to its computation. However, there are cases where spreads will not appear in the financial result widgets ([Finres for today](interface.md#finres_for_today) and [Finres history](interface.md#finres_history)). 
The key rule to remember is: a spread is displayed only if there is a trade in the [Is first](params-description.md#s.is_first) instrument. If there is no such trade, no spread will be shown. 
For example, if your position becomes skewed for any reason and you rebalance it by clicking the [To market](params-description.md#p.to_market)button, you will not get a proper spread in these widgets. You will only see a single "skewed" spread entry that includes only the [Is first](params-description.md#s.is_first) instrument.
As an example: during flood control, trades may be executed on the first leg while the second leg cannot be submitted. This leads to one-sided skewed spreads on the first leg. After clicking [To market](params-description.md#p.to_market)button, trades on the second leg are executed (and correctly reflected in the financial result). However, since no matching trade occurs in the primary instrument, no spread is displayed in the table—although the financial result itself remains accurate.

Another scenario occurs when the [Count](params-description.md#s.count) value of the first leg exceeds the [Count](params-description.md#s.count) value of the second leg. For example, suppose you are trading a currency (e.g., USD/RUB) against futures on the derivatives market, with the currency as the first leg. In this case, the currency has a [Count](params-description.md#s.count) of 100, while the futures contract has a [Count](params-description.md#s.count) of 1, meaning you hedge every 100 currency units with one futures contract.
You place an order for 100 currency contracts. Suppose 60 are filled. No spread will appear in the table, as it would be inherently skewed — the second leg has not been traded yet. Then another 50 are filled, and again, no spread will be displayed. You then place one futures contract, which gets executed (and is correctly reflected in the financial result). However, it remains unclear which trades this execution should be linked to. If linked to the most recent trade (i.e., the 50-lot fill), the resulting spread would be clearly skewed. Attempting to associate it with earlier trades is not feasible, as real-world scenarios may be more complex than this simplified example.

## On Pricing of Second-Leg Orders

Orders for second-leg instruments are priced as follows:
- A buy order is placed at the best ask price plus the offset [k](params-description.md#s.k) or plus [k_sl](params-description.md#s.k_sl) if the order is re-posted due to a stop-loss trigger or similar event.
- A sell order is placed at the best bid price minus the offset [k](params-description.md#s.k) or minus [k_sl](params-description.md#s.k_sl)if the order is re-posted due to a stop-loss trigger or similar event.
The best bid and ask prices for second-leg instruments are frozen at the moment the order for the [Is first](params-description.md#s.is_first) instrument is submitted. As a result, when a trade is executed on the [Is first](params-description.md#s.is_first) instrument , all other instruments in the portfolio are quoted with offsets based not on the current market prices, but on the best prices at the time the first-leg order was placed.
The only exception is when the [Equal price](params-description.md#p.equal_prices) parameter is enabled.

No alternative methods for pricing second-leg orders are supported beyond those described above.

## On Order Submission Volumes

For certain exchanges (e.g., Deribit), if the order volume is not a multiple of the lot size, the submitted volume is automatically rounded down to the nearest whole number of lots. For example, if the lot size is 10 and the order size is 25, the actual order placed on the exchange will have a volume of 20 (rounding is always performed downward). If, as a result of this rounding, the order volume becomes zero, you will receive the rejection error `REASON_ZERO_AMOUNT_TO_MULTIPLE`.
