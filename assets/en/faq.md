---
title: 13. Frequently Asked Questions
section: 13
ignore-section-number: true
---

# Frequently Asked Questions

- <details>
    <summary><i>Problem with the exchange trading connection: the robot does not place orders / does not see trades, but the situation does not allow stopping trading for a long time.<Anchor :ids="['faq.lost_orders']" /></i></summary>

    1. Send an email to support describing the issue;
    2. Disable trading for all portfolios using this trading connection; make sure there are no active orders left;
    3. Reset order statuses for all portfolios from step 2. The `Reset statuses` functionality is described [here](getting-started.md#portfolio_actions.reset_statuses);
    4. Reconnect the problematic trading connection;
    5. Enable trading for the portfolios from step 2;
    6. If the problem reoccurs within a couple of hours, disable trading for all portfolios using this trading connection and do not enable it again until you receive a response from support.

    </details>
---
- <details>
    <summary><i>Trading turns on and off spontaneously. What could be causing this?<Anchor :ids="['faq.timetable']" /></i></summary>

    Most likely, a trading schedule has been set, or this behavior has been explicitly programmed in the formulas.

    </details>
---
- <details>
    <summary><i>The robot is not trading. Almost all connections are disconnected. What could be the reason?<Anchor :ids="['faq.license']" /></i></summary>

    The most probable cause is an expired license. Check how many days are left until the license expires. The number of remaining paid days can be viewed in the [Robots](interface.md#robots_table) widget, in the table row corresponding to this robot, under the `Days paid` column.

    </details>
---
- <details>
    <summary><i>Added a portfolio, all exchange connections are active, trading is enabled, but orders for the first leg are not being placed. What could be the reason?<Anchor :ids="['faq.prompt']" /></i></summary>

    When you hover over the portfolio name in the portfolio list, a tooltip appears. It separately indicates for buy and sell of the first leg what conditions are missing for the robot to place an order.
    For example, the tooltip string for portfolio selling may look like this: "`sell: is signal=1, quantity=5, is valid market volume=1, is price check=0, is max not hedged=1, is orderbook valid=1`. 
	`is_signal` means whether there is a buy/sell signal (i.e. either we are currently quoting, or the condition for [Sell](params-description.md#p.sell) and [Lim_Sell](params-description.md#p.lim_s) is met). If the signal is present, the value is 1; otherwise, 0. All check values can only be 0 or 1 unless otherwise specified.
	`quantity` shows the volume of the order the robot intends to place based on the portfolio settings. An order will be placed only if the volume is positive. A negative volume is not an error—it is simply the result of calculations.
	`is valid market volume` indicates whether the [Market volume](params-description.md#p.mkt_volume) check has passed.
	`is price check` indicates whether the [Price check](params-description.md#p.price_check) condition has been satisfied.
	`is max not hedged` indicates whether the [Max not hedget](params-description.md#p.max_not_hedged) condition is met for orders on the second leg.
	`is orderbook valid` reflects external signs of order book validity. The order book is considered invalid if the bid and ask sides overlap.
	Thus, an order is placed only when all values are greater than zero.
    
    </details>
---
- <details>
    <summary><i>The required instrument is missing from the exchange instrument list. Where can I get it?<Anchor :ids="['faq.no_security']" /></i></summary>

    The list of financial instruments in the robot is updated every morning at 6:05 server time. You can check the server time in the [Robots](interface.md#robots_table) widget, in the row corresponding to this robot, under the `Robot time`. column. To reload the instrument list, click `Reload security list from exchanges`. If you do not see a particular financial instrument in the list (and you have already updated it), but the instrument is already available on the exchange, either wait until the scheduled update time when the instrument will be added automatically, or reconnect the market data connection and then refresh the financial instrument list.
    
    </details>
---
- <details>
    <summary><i>New financial instruments were added on the exchange today, but I don't see them in the robot. What should I do?<Anchor :ids="['faq.new_security']" /></i></summary>

    New financial instruments are loaded early in the morning, and the robot might not have had time to pick them up yet. You need to reconnect the market data feed to the exchange, then refresh the financial instrument list—the new instruments will become available.
    
    </details>
---
- <details>
    <summary><i>I added a portfolio, changed its settings, but the changes did not apply and the portfolio disappeared. What is happening?<Anchor :ids="['faq.another_user']" /></i></summary>

    Check whether you are the only one editing the robot. It's possible that your colleague is making changes at the same time, and you are interfering with each other.
    
    </details>
---
- <details>
    <summary><i>The robot has become slower at executing trades. What could be causing this?<Anchor :ids="['faq.making deals']" /></i></summary>

    The speed at which the exchange matches orders depends on many factors that the robot cannot influence. For example, if your order for 1000 hits the opposite side of the order book, there is a significant difference between it being matched against a single opposing order of 1000 (or more), or being matched against 1000 separate orders of size 1 each. The second scenario will naturally take the exchange longer to process.
    
    Looking at the broader picture—from the moment the robot receives market data to the moment an order is filled—besides the robot’s market data processing speed, order submission speed, and the exchange’s matching speed, a major factor is the current market situation (availability of counterparty liquidity).
    
    </details>
---
- <details>
    <summary><i>ПWhy is volume being placed multiple times at the same spread? My K parameter is non-zero.<Anchor :ids="['faq.limits_shifting']" /></i></summary>

    [Sell](params-description.md#p.sell) has become significantly greater than [Lim_Sell](params-description.md#p.lim_s), and as a result, when shifting by [K](params-description.md#p.k), the system is chasing the market price.
    Example: You want to sell at 100, K=1. At some point, the market price jumps to 105. You sell at 105, but according to the algorithm, the robot first sold at 100, then shifted by K and started selling at 101. It sold again at 105, then shifted again by K to 102, sold once more at 105, and so on. Thus, all these sales occur at the price of 105.
    
    </details>
---
- <details>
    <summary><i>How can I reduce slippage on second-leg instruments?<Anchor :ids="['faq.k_percent_of_quantity']" /></i></summary>

    To address this, pay attention to the [k](params-description.md#s.k) and [Percent of quantity](params-description.md#s.percent_of_quantity) parameters for the second-leg instrument in the `Securities` section. Proper tuning of these parameters can significantly affect the execution quality of second-leg orders.
    
    Increasing the [k](params-description.md#s.k) value may potentially worsen execution price but increases the likelihood of order fill. Increasing [Percent of quantity](params-description.md#s.percent_of_quantity) helps achieve more reliable hedging, as the first-leg order will only be placed when sufficient volume is available for hedging on the second leg.
    
    </details>
---
- <details>
    <summary><i>I frequently encounter the REASON_FLOOD error. What should I do to avoid it?<Anchor :ids="['faq.reason_flood']" /></i></summary>

    **If the error occurs when placing orders for [Is first](params-description.md#_5-3-11-is-first) instruments:**
    
    This error indicates the use of quoting mode ([Quote](params-description.md#p.quote)). You may try trading without quoting mode, which reduces the frequency of transaction submissions. If quoting mode is essential, review the "Anti-spam" group parameters, particularly [Delta](params-description.md#p.delta).
    [Delta](params-description.md#p.delta) - defines the deviation of [Price_s/Price_b](params-description.md#p.price_s) from the currently placed order's price that triggers an order re-quoting (i.e., a new transaction). Set this value so that minor price fluctuations do not cause constant order replacement. For example, if you are trading BTCUSD priced at 10,000, setting [Delta](params-description.md#p.delta) to 1 means even a $1 change will trigger a re-quote. Given how often prices fluctuate by $1 at this level, the robot could send multiple cancel-and-replace commands per second—this causes exchange flooding. Setting [Delta](params-description.md#p.delta) to 5–10 reduces flood risk, as a more significant price move is required before sending new orders.
    Adjust the [Market volume](params-description.md#p.mkt_volume) parameter. If there is already a large volume ahead of your order, there’s little benefit in placing your order immediately, helping to avoid spamming the exchange with replacements.
    **Important:** In `bid/offer` trading mode, this parameter only considers bid and offer volumes. Any additional depth behind them remains invisible to the robot, which may still place orders. Therefore, use this parameter primarily in `orderbook` or `orderbook+filter` modes.  
    Use the [Price check](params-description.md#p.price_check) parameter. If [Price_s/Price_b](params-description.md#p.price_s) differs from `bid/offer` by more than [Price check](params-description.md#p.price_check) points, do not quote—this also prevents unnecessary exchange spam. Naturally, lower values result in less frequent order updates.
    You can also set a larger [TP](params-description.md#_5-3-26-tp) to take profit less frequently but in larger amounts.

    **If the error occurs when placing orders for non-Is first instruments:**
    
    It is likely that the first-leg order is being filled in small portions, and after each such trade, hedging orders are being placed for second-leg instruments. Pay attention to the [Overlay](params-description.md#p.overlay)parameter, which allows placing hedging orders not after every single first-leg trade, thus reducing order frequency.
    
    </details>
---
- <details>
    <summary><i>Trades in the robot do not match trades in the terminal. What could be the reason?<Anchor :ids="['faq.prompt']" /></i></summary>

    The robot does not use trade prices in its algorithm—they are used only for display purposes. Moreover, on many connections it is impossible to obtain the exact price of a specific trade. For this reason, and to improve performance, the robot may record the order placement price or the average execution price of fills within an order as the trade price. Additionally, on some connections, several consecutive trades may be aggregated by the robot into a single trade with the total executed volume. This behavior is not erroneous—there is no loss of position information.
    
    </details>
---
- <details>
    <summary><i>I don't see a portfolio, but I'm sure I created it, and the robot won't let me create a new portfolio with the same name. What could be the issue?<Anchor :ids="['faq.filter']" /> </i></summary>

    Most likely, a filter is applied in the portfolios table, and the given portfolio is not selected in the filter. Click on the "FILTER APPLIED" label in the [Portfolios table](interface.md#portfolios_table) widget and check the box next to the desired portfolio.
    
    </details>
---
- <details>
    <summary><i>I cannot create a portfolio—I receive a message saying a portfolio with this name already exists. I definitely did not create such a portfolio. What could be the reason?<Anchor :ids="['faq.not_your_portfolio']" /></i></summary>

    First, make sure you have not actually created this portfolio by checking the portfolio filter as described [above](#faq.filter). If that does not help, it is likely that a portfolio with this name already exists in the robot, created by another user. You cannot see portfolios created by other users, but portfolio names must be unique across all portfolios in the robot. If this occurs on a free robot, it is normal—such robots are indeed used by many traders. If this happens on a production robot, contact the Head of Traders to confirm whether someone else is using the same robot instance.
    
    </details>
---
- <details>
    <summary><i>Is there a way to configure the robot to hedge part of the Is_first leg if less than 5 contracts are filled? For example: fill 2 on the first leg, hedge 3 on the second leg (while keeping Count at 5 to 8)?<Anchor :ids="['faq.n_perc_fill']" /></i></summary>

    Input data: `Curpos`=19, `Count`=5  
    By default, the portfolio position is rounded down to the nearest integer value of `Curpos` divided by `Count` (main leg), so hedging occurs only when the portfolio position changes.  
    When n_perc_fill=0, rounding down modulo, i.e. |19/5=3|;  
    When n_perc_fill=80:  
    Suppose the position changes to Curpos=18, integer division |18/5|=3 - unchanged,
    remainder  =3. (100 - n_perc_fill)=100-80=20, 20% of count (i.e. of  5) =1, 80% of count =4.  
    The remainder 3 falls within the range between 1 and 4, so the portfolio position remains unchanged. Pos=3.  
    Thus, the position will decrease only when Curpos<=15 and increase when Curpos>=20.
    
    </details>
---
- <details>
    <summary><i>How to set up notifications for sharp changes in spreads?<Anchor :ids="['faq.notifications']" /></i></summary>

   Notifications are configured in the portfolio settings on the `Notifications` tab.
   
   </details>
---
- <details>
    <summary><i>In the Financial result section, the asset price is often displayed instead of the spread (delta). How does this affect Average sell and buy?<Anchor :ids="['faq.fin_res']" /></i></summary>
    
    Calculations are based on trades executed during the selected period, calculated separately for buys and sells, not based on spreads (delta). Therefore, whether the Financial result contains delta or price is irrelevant—it does not affect the calculation of Average sell and buy.
    
    </details>
---
- <details>
    <summary><i>What order types does the robot use? Is it possible for the robot to place market orders?<Anchor :ids="['faq.order_type']" /></i></summary>

    The robot uses only limit quote orders. Placing market-type orders is not possible, but you can emulate them by placing a limit order deep into the opposite side of the order book using the [k](params-description.md#_5-3-12-k) parameter of the corresponding instrument in the portfolio settings under the `Securities` section.
    
    </details>
---
- <details>
    <summary><i>What actions does the robot take when connection is lost on one leg?<Anchor :ids="['faq.connection_lost']" /></i></summary>

    It depends on which leg and at what moment the connection was lost. If the first leg loses connection, the portfolio containing instruments from the exchange with the lost connection stops trading. If the connection to the second leg is lost and the first leg has not yet been filled, the robot also stops trading this portfolio. If the first leg was successfully filled, and at that moment the second leg had not yet placed its order but already lost connection, the robot will continue attempting to place the order (of course, rate limits are respected).
    
    </details>
---
- <details>
    <summary><i>Do I need to keep the browser page open for everything to keep working? What will happen to my positions if I close the browser or restart my computer?<Anchor :ids="['faq.site']" /></i></summary>

    Robot operation does not depend on whether the browser tab is open for the user or not. You can close this page, open it elsewhere, access it simultaneously from multiple locations, restart your computer, etc.—none of this affects the robot's operation. The robots run on our servers and function autonomously. After logging in to the website, you gain the ability to manage the robots available to you. There is a separate option to run the robot on your own server.
    
    </details>
---   
- <details>
    <summary><i>On futures instruments of the Moscow Exchange, prices in the robot differ from those in the terminal. What could be the reason?<Anchor :ids="['faq.sintetic']" /></i></summary>

    The futures market of the Moscow Exchange uses synthetic matching, which is related to trading [calendar spreads](https://www.moex.com/ru/spreads). With synthetic matching, trades are formed based on orders arriving in different order books of linked instruments (two futures and a calendar spread). As a result, during matching, synthetic levels of any necessary depth are constructed to match active orders.
    
    In the robot, market data for the Moscow Exchange futures market is received exclusively via `Orderlog` streams using the [FAST](creating-connection.md#tc.MOEX_FUT_OPT.FAST) and [SIMBA](creating-connection.md#tc.MOEX_FUT_OPT.SIMBA) protocols, as this is the fastest method of obtaining market information.
    
    </details>
---
- <details>
    <summary><i>I see error messages when placing orders for the portfolio, starting with "Stop trading!!!", but trading for the portfolio has not been disabled yet, and the errors continue. How is this possible?<Anchor :ids="['faq.stop_trading']" /></i></summary>

    This can happen when using formulas where the code directly controls the enabling of trading for the portfolio, or does so via schedule activation (using methods such as `set_re_sell`, `set_re_buy`, `set_use_tt`). When writing formulas, it is recommended to account for the possibility that the robot may disable trading on the portfolio upon receiving certain order placement errors.
    
    </details>
---
- <details>
    <summary><i>I received an email requesting to stop trading due to a robot update. What exactly should I do?<Anchor :ids="['faq.robot_update']" /></i></summary>

    You must disable trading for all portfolios in the robot (for example, using the [actions](getting-started.md#portfolio_actions) in the [Portfolios table](interface.md#portfolios_table) widget) and ensure there are no active orders left on the exchange placed by the robot. It is not necessary to close your position to zero.
    
    Pay special attention when stopping trading for portfolios that use a [schedule](params-description.md#p.use_tt) (if the schedule enables trading, it must be disabled), and for portfolios where the [re_sell/re_buy](params-description.md#p.re_buy) flags are controlled via formulas (formulas for selected portfolios can be disabled together with trading using the [Stop formulas](getting-started.md#portfolio_actions.stop_formulas)). action). Don’t forget to re-enable the schedule and formulas after the robot update.
    
    </details>
---    
- <details>
    <summary><i>Can I create portfolios and make changes to existing ones on non-trading days?<Anchor :ids="['faq.no_trading_days']" /></i></summary>

    You can edit portfolio settings on non-trading days. However, creating new portfolios or adding new instruments to existing ones is not guaranteed, because the robot requires an updated instrument list to perform these actions. If the robot has previously loaded the instrument list from the exchange, you will be able to create portfolios and add instruments even during non-trading hours. However, there may be cases when robots are restarted during non-trading hours for updates or maintenance. In such cases, the robot will only be able to reload the instrument list once market data transmission resumes on trading days. This is not an error. We reserve the right to restart robots and perform other maintenance during non-trading hours.
    
    </details>
---    
- <details>
    <summary><i>What are the system requirements for the computer on which the robot website will be opened?<Anchor :ids="['faq.requirements']" /></i></summary>

    System requirements are described [here](introduction.md#requirements).
    
    </details>

---    
- <details>
    <summary><i>Does the robot require the 'Cancel on Disconnect' option to be enabled in the trading connection? <Anchor :ids="['faq.cod']" /></i></summary>
    
    Many exchanges and brokers offer the `Cancel on Disconnect` (CoD) option in their trading connections. This option means that if the connection between the robot and the exchange is lost, all orders placed by the robot will be automatically canceled by the exchange itself (without robot involvement). The robot does not use or rely on this mechanism: upon reconnection, the robot retrieves up-to-date order data from the exchange and updates its internal order statuses accordingly.
    
    On one hand, the `Cancel on Disconnect` mechanism is designed to mitigate risks during connection loss. For example, with CoD enabled, if a connection drops, the first-leg instrument order will be automatically canceled, eliminating the risk of an unhedged position. On the other hand, enabling this mechanism on trading connections used for second-leg instruments may lead to undesired behavior: if the connection is lost, the second-leg order will be canceled and will not be automatically re-submitted after reconnection. Hedging will only occur again if the [Hedge (sec)](params-description.md#p.hedge_after) parameter is properly configured..
    
    </details>
---    
- <details>
    <summary><i>The exchange has suspended trading. What actions should I take in the robot? <Anchor :ids="['faq.exchange_stopped']" /></i></summary>
    
    First and foremost, regardless of which exchange has suspended trading, do not rush to reset order statuses by clicking [Sell/Buy status](params-description.#p.sell_status) or using the [Reset statuses](getting-started.md#portfolio_actions.reset_statuses). menu option. Trading suspensions can occur for various reasons, not only technical ones, and exchange behavior during such events may vary significantly. We have previously observed cases where, after a trading halt on the Moscow Exchange, a client immediately reset order statuses in the robot. Then, 10–30 minutes later, trading resumed, but the client had to manually cancel outstanding orders via the terminal—orders the robot had "forgotten" due to the status reset.
    
    Since trading halts on any exchange can happen for multiple reasons, there is no universal action algorithm for such situations. Our platform employs a comprehensive monitoring system that tracks numerous robot parameters: availability of trading and market data connections, orders stuck in intermediate statuses, order submission/cancellation errors not covered by standard categories, etc. Thanks to this system, we are often aware of trading halts on the Moscow Exchange before receiving notifications from brokers. This information is analyzed promptly, and in case of an exchange failure, we send out user notifications detailing the necessary steps.
    
    </details>    
