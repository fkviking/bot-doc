# 6. Adding Connections

This section describes the exchanges/brokers and markets supported by the robot, along with all parameters used when creating each connection. Some connection parameters directly correspond to fields in the exchange's API; for such parameters, we aim to use names that match those in the exchange API. For example: `Credentials`, `SenderCompID`, `ComplianceID` , and many others.
Please note that not all parameters specified during trade connection setup are used during authentication. Some parameters — for instance, `Trading account(s)` - may only be applied when placing or canceling an order.  Therefore, successful authentication and bringing a trade connection online do not guarantee that all connection settings are correct. To verify the correctness of all parameters, create a [portfolio](getting-started.md#portfolio_add) with one instrument, place an order (e.g., using the [clicker](params-description.md#p.buy_portfolio))  in such a way that it does not immediately execute as a trade (for example, by setting a negative value for the [k](params-description.md#s.k) parameter), and then cancel this order (e.g., via [Hard stop](getting-started.md#portfolio_actions.hard_stop).

## 6.1. MOEX FORTS

### 6.1.1. TWIME и FIFO TWIME

The robot supports connections via the TWIME protocol in both standard TWIME and FIFO TWIME modes. However, using FIFO TWIME requires additional network infrastructure. If you plan to use FIFO TWIME, please [notify support](help@fkviking.ru) in advance. They will deploy the robot on a server where infrastructure-level access to FIFO TWIME is available.

When creating the connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.moex_fut_opt.twime_server) address.

When ordering this type of connection, keep in mind that two logins at 30 transactions/sec perform better than one login at 60 transactions/sec (see [Round robin](params-description.md#s.client_code)).

#### 6.1.1.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to navigate in the list of trade connections. Allowed characters: `_ a-z A-Z 0-9`

#### 6.1.1.2. TWIME server

The TWIME server address of the exchange to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### 6.1.1.3. Credentials

Credentials are provided by the broker.

#### 6.1.1.4. Trading account(s)

Trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they should be listed separated by commas):

![Alt text](/bot-doc/docs/00-img/4-1-1-3.png)

#### 6.1.1.5. Comment

A unique identifier for all orders within this connection, set by the user for their own convenience. It is an integer ranging from 0 to 1073741823. If not used, leave it as 0. 

#### 6.1.1.6. Round robin

Enabled by default. For improved performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#tc.moex_fut_opt.client_code). When ordering a TWIME connection, keep in mind that two logins at 30 transactions/sec to the same trading account in `Round robin` mode will perform better than a single login at 60 transactions/sec. In this mode, the robot will send orders to the multiple logins in a round-robin fashion.

#### 6.1.1.7. ComplianceID

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### 6.1.1.8. Max trans

Transactions per second limit. The user's application specifies login performance, where one unit equals 30 transactions per second.

#### 6.1.1.9. Reserved trans

Default is 0. The number of transactions per second reserved for cancellation orders. Using this parameter reduces the number of order submissions available per second defined by [Max trans](creating-connection.md#tc.moex_fut_opt.max_transactions_in_one_second), but increases the likelihood that the robot will be able to cancel an order in time when prices move.

#### 6.1.1.10. Move order

Allowed by default. Allows or prohibits the use of order modification (move) commands for this connection.

#### 6.1.1.11. Fast aggregation mode (on SIMBA)

When this flag is used, the connection will utilize trade data from the market-data connection, specifically from the Orderlog stream of the corresponding SIMBA connection, provided that this stream is in the `Enabled` state. When this flag is used, the connection will utilize trade data from the market-data connection, specifically from the Orderlog stream of the corresponding SIMBA connection, provided that this stream is in the `Deals for today` and `Deals history` widgets, such trades will be displayed with the `Aggregated` flag.

#### 6.1.1.12. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### 6.1.2. FAST (FIX Adapted for STreaming)

This connection consists of 4 streams. This is designed to separate rarely used options, as well as to distinguish the resource-intensive but fast Orderlog stream from the slightly slower but lighter Best prices stream. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.1.2.1. Futures Definitions

Instrument definition stream for futures. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.1.2.2. Best prices

Best prices stream. Not mandatory. Automatically disabled when the Orderlog stream is set to Enable, as the exchange does not support combining streams on the FAST derivatives market.

#### 6.1.2.3. Orderlog

Stream of all orders; the aggregated order book is built based on this data. Note that since the order book for a single instrument is constructed using only order data for that specific instrument, levels reconstructed from other instruments' order books (synthetic liquidity) will be missing in such an order book.

#### 6.1.2.4. Options definitions

Instrument definition stream for options. To trade options, this stream must be set to Enable status.

### 6.1.3. SIMBA

This connection consists of 3 streams. This is designed to separate rarely used options. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.1.3.1. Futures Definitions

Instrument definition stream for futures. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.1.3.2. Orderlog

Stream of all orders; the aggregated order book is built based on this data. Note that since the order book for a single instrument is constructed using only order data for that specific instrument, levels reconstructed from other instruments' order books (synthetic liquidity) will be missing in such an order book.

#### 6.1.3.3. Options Definitions

Instrument definition stream for options. To trade options, this stream must be set to Enable status.


## 6.2. MOEX Spot

### 6.2.1. FIX (Financial Information eXchange)

When connecting to the cash market, we recommend ordering 3 (three) logins for a single trading account, as there are 3 (three) FIX servers on the cash market, and occasionally one or two may become unavailable. This increases the fault tolerance of your trading [see. Round robin](params-description.md#s.client_code).

#### 6.2.1.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### 6.2.1.2. Server

The address of the exchange's FIX server to which the connection will be established.

#### 6.2.1.3. SenderCompID

The value of this parameter is provided by the broker.

#### 6.2.1.4. Password

**Important!** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about password changes can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### 6.2.1.5. Trading account(s)

The trading account, provided by the broker. It can also be viewed in the trading terminal (if there are multiple accounts, they should be listed separated by commas):

![Alt text](/bot-doc/docs/00-img/4-2-1-5.png)

#### 6.2.1.6. Round robin

Enabled by default.
For fault tolerance, we recommend using three FIX connections to the cash market with the same [Trading account(s)](creating-connection.md#tc.moex_fond.client_code). In `Round robin` mode, the robot will use them sequentially, so an unexpected disconnection of one of the exchange's FIX servers will not stop trading.

#### 6.2.1.7. Client code

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](/bot-doc/docs/00-img/4-2-1-7.png)

#### 6.2.1.8. ComplianceID

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### 6.2.1.9. Firm level account

A checked checkbox indicates that the client's account is a firm-level account.

#### 6.2.1.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### 6.2.2. TWIME and FIFO TWIME

TWIME is a binary protocol, a faster alternative to the FIX protocol. Robot software supports connections via the TWIME protocol in both TWIME and FIFO TWIME variants. However, using FIFO TWIME requires additional network infrastructure, so if you plan to use FIFO TWIME, please [notify support staff](help@fkviking.ru) in advance—they will place the robot on a server where such connectivity is supported at the infrastructure level. When creating a connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.moex_fond.twime.twime_server) address to connect to.

#### 6.2.2.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### 6.2.2.2. TWIME server

The address of the exchange's TWIME server to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### 6.2.2.3. Username

The value of this parameter is provided by the broker.

#### 6.2.2.4. Password

**Important!** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### 6.2.2.5. Trading account(s)

The trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they are listed separated by commas):

![Alt text](/bot-doc/docs/00-img/4-2-1-5.png)

#### 6.2.2.6. Round robin

Enabled by default. To improve performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#'tc.moex_fond.twime.client_code).  In this mode, the robot will send orders to multiple logins in a round-robin fashion.

#### 6.2.2.7. Client code

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](/bot-doc/docs/00-img/4-2-1-7.png)

#### 6.2.2.8. Brokerref

The value of this parameter is provided by the broker.

#### 6.2.2.9. ComplianceID

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### 6.2.2.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### 6.2.3. FAST

This connection consists of 3 streams. This is designed to separate the Orderlog stream from the Best prices stream. They have similar speed, and the exchange allows their simultaneous use, so they can be enabled together. However, Best prices is clearly less resource-intensive. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.2.3.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.2.3.2. Best prices

Best prices stream. We recommend enabling it simultaneously with the Orderlog stream.

#### 6.2.3.3. Orderlog

Stream of all orders. We recommend enabling it simultaneously with the Best prices stream.

### 6.2.4. SIMBA

This connection consists of 2 streams. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.2.4.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.2.4.2. Orderlog

Stream of all orders; the aggregated order book is built based on this data.

## 6.3. MOEX Currency

### 6.3.1. FIX

When connecting to the currency market, we recommend ordering 5 (five) logins for a single trading account, as there are 5 (five) FIX servers on the currency market, and occasionally one or two may become unavailable. This increases the fault tolerance of your trading ([see. Round robin](params-description.md#s.client_code)).

#### 6.3.1.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### 6.3.1.2. Server

The address of the exchange's FIX server to which the connection will be established. For improved fault tolerance, different addresses should be selected.

#### 6.3.1.3. SenderCompID

The value of this parameter is provided by the broker.

#### 6.3.1.4. Password

Password for this FIX connection. If not changed, use the default one shown in the input field.

**Important!**  when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### 6.3.1.5. Trading account(s)

The trading account, provided by the broker; it can also be viewed in the terminal.
If there are multiple accounts, they should be listed separated by commas.

![Alt text](/bot-doc/docs/00-img/4-3-1-5.png)

#### 6.3.1.6. Round robin

Enables or disables `Round robin`'for this connection.
For fault tolerance, we recommend using 5 (five) FIX connections to the currency market with the same [Trading account(s)](creating-connection.md#tc.moex_curr.client_code). In `Round robin` mode, the robot will use them sequentially, so an unexpected disconnection of one of the exchange's FIX servers will not stop trading.

#### 6.3.1.7. Client code

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker.
When entering, add two slashes '//' at the end. Depending on broker instructions, it might be one slash at the end and one in the middle. If no instructions were given, leave two at the end.

![Alt text](/bot-doc/docs/00-img/4-3-1-7.png)

#### 6.3.1.8. ComplianceID

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### 6.3.1.9. Firm level account

Indicates that the user's account is a firm-level account. Brokers usually do not know the account level, so it often needs to be determined manually.

#### 6.3.1.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### 6.3.2. TWIME и FIFO TWIME

TWIME is a binary protocol, a faster alternative to the FIX protocol. The robot supports connections via the TWIME protocol in both TWIME and FIFO TWIME variants. However, using FIFO TWIME requires additional network infrastructure, so if you plan to use FIFO TWIME, please [notify support staff](help@fkviking.ru) in advance—they will place the robot on a server where such connectivity is supported at the infrastructure level. When creating a connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.moex_curr.twime.twime_server) address to conncet to.

#### 6.3.2.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### 6.3.2.2. TWIME server

The address of the exchange's TWIME server to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### 6.3.2.3. Username

The value of this parameter is provided by the broker.

#### 6.3.2.4. Password

**Important!** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### 6.3.2.5. Trading account(s)

The trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they are listed separated by commas):

![Alt text](/bot-doc/docs/00-img/4-2-1-5.png)

#### 6.3.2.6. Round robin

Enabled by default. To improve performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#'tc.moex_curr.twime.client_code). In this mode, the robot will send orders to multiple logins in a round-robin fashion.

#### 6.3.2.7. Client code

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](/bot-doc/docs/00-img/4-2-1-7.png)

#### 6.3.2.8. Brokerref

The value of this parameter is provided by the broker.

#### 6.3.2.9. ComplianceID

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### 6.3.2.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### 6.3.3. FAST

This connection consists of 3 streams. This is designed to separate the Orderlog stream from the Best prices stream. They have similar speed, and the exchange allows their simultaneous use, so they can be enabled together. However, Best prices is clearly less resource-intensive. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.3.3.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.3.3.2. Best prices

Best prices stream. We recommend enabling it simultaneously with the Orderlog stream.

#### 6.3.3.3. Orderlog

Stream of all orders. We recommend enabling it simultaneously with the Best prices stream.

### 6.3.4. FAST Indexes

To view and add indices to the portfolio, this stream must be set to Enable status.

### 6.3.5. SIMBA

This connection consists of 2 streams. It is recommended NOT to enable FAST streams with SIMBA streams at the same time.

#### 6.3.5.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.3.5.2. Orderlog

Stream of all orders; the aggregated order book is built based on this data.

## 6.4. SPB

### 6.4.1. Market Data (Binary Protocol)

The market data connection consists of several data streams. You can activate only the streams you need and disable the unnecessary ones.
If an instrument's name starts with SPB_MM_, it represents SPB liquidity only (orders and trades directly from SPB Exchange). If the name starts with SPB_AGGR_, it represents aggregated liquidity from multiple exchanges. If you are a market maker, you most likely have access only to SPB liquidity.

#### 6.4.1.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.


#### 6.4.1.2. Commons

Stream of statistical market parameters. Not used within the robot's algorithm, but available via the [C++ interface](c-api.md#market-data-access).

#### 6.4.1.3. Top of book

Best bid and ask prices stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### 6.4.1.4. Orderbook

Order book stream. We recommend NOT enabling it simultaneously with the Top of book stream.

### 6.4.2. Binary Protocol Transaction Gateway

Make sure you ordered a binary, not a FIX login. Only one active connection is allowed per login.

**Important!** This exchange distributes instrument status information slowly. However, there are cases when it is necessary to place an order earlier to get ahead of other market participants; therefore, status checks for instruments have been disabled on this connection when placing orders. When trading on the portfolio is enabled and the conditions for placing an order are met, the instrument status check is not performed. This may result in an order being sent while the instrument is not trading. To avoid this, it is necessary to configure schedules for portfolios using this connection. You may deviate from non‑trading hours by no more than 4 minutes and 59 seconds to place orders earlier at the start of trading. During the rest of the non‑trading time, trading must be turned off.

#### 6.4.2.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### 6.4.2.2. Connection type

Direct — a regular connection that connects directly to the exchange.

#### 6.4.2.3. Login

Login for accessing the exchange, taken from the exchange agreement.

#### 6.4.2.4. Password

Password for accessing the exchange, taken from the exchange agreement.

#### 6.4.2.5. Trading account(s)

Trading account, taken from the exchange agreement. Multiple accounts can be added, separated by commas.

#### 6.4.2.6. Member ID

Participant identifier; defaults to 0. If this value does not work, clarify with the exchange.

#### 6.4.2.7. Client ID

Client code identifier, taken from the exchange agreement.

#### 6.4.2.8. Market ID

Liquidity pool identifier. Valid values: 0 (liquidity is automatically determined by financial instrument), 1000 (for addressed instruments, SPB Exchange liquidity only), and 1001 (for anonymous instruments, aggregated liquidity).

#### 6.4.2.9. Comment

Client comment for orders.

#### 6.4.2.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

## 6.5. EXANTE

The robot supports only FIX connections to the EXANTE broker. When adding a transactional connection, two FIX connections are created: market data and transactional. Such a pair of connections can be activated or deactivated only together; that is, attempting to deactivate the market data connection will also deactivate the corresponding transactional connection, and vice versa. Since EXANTE broker can provide market data from a large number of exchanges, the [Exchange filter](creating-connection.md#exchange-filter) field—specifying the list of required exchanges—is mandatory. It is strongly recommended to include only those exchanges whose instruments you actually plan to use.

### 6.5.1. CFI codes

The instrument list will be generated only from those instruments that match the specified codes. By default, codes for all instruments except options are specified. The current list of code options can be found in the [EXANTE documentation](https://api.exante.eu/fix-api/specification/#tag/Instrument-Identification):

`MRCXXX` - Cash, FOREX;

`EXXXXX` - Stocks;

`EUXXXX` - Funds;

`DBXXXX` - Bonds;

`FXXXXX` - Futures;

`FMXXXX` - Calendar spreads;

`OCXXXX` - Call options;

`OPXXXX` - Put options.

### 6.5.2. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### 6.5.3. Conn type

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### 6.5.4. SenderCompID (trade)

Unique client identifier for the transactional connection, provided by the broker.

### 6.5.5. Password (trade)

Password for the transactional connection, provided by the broker. If the broker provided only one password, then most likely the market data and transactional connection passwords are the same.

### 6.5.6. Trading account(s)

Client account identifier, obtained from the broker. Multiple accounts can be added, separated by commas.

### 6.5.7. Max trans

One of the flood protection system parameters. To avoid triggering the broker's flood control, we count outgoing messages internally. This parameter defines the maximum number of messages allowed within a time interval. If the number of messages sent within the time interval defined by [Max trans interval](creating-connection.md#max-trans-interval) exceeds this value, the robot stops sending messages to the broker.

### 6.5.8. Max trans interval

One of the flood protection system parameters. To avoid triggering the broker's flood control, we count outgoing messages internally. This parameter defines the time interval. If the number of messages sent within this interval exceeds the value set in [Max trans](creating-connection.md#max-trans), the robot stops sending messages to the broker.

### 6.5.9. Transactions reserved

One of the flood protection system parameters. This parameter specifies how many transactions per time interval [Max trans interval](creating-connection.md#max-trans-interval) are reserved for order cancellations.That means, even if order submissions hit the robot’s internal flood control limit, the robot will still be able to send cancellation requests up to the number specified in Transactions reserved.

### 6.5.10. SenderCompID (feed)

Unique client identifier for the market data connection, provided by the broker.

### 6.5.11. Password (feed)

Password for the market data connection, provided by the broker. If the broker provided only one password, then most likely the market data and transactional connection passwords are the same.

### 6.5.12. Exchange filter

List of exchanges (separated by commas) from which market data will be received. At least one exchange must be specified. Currently, data is known to be available from the following markets:  
`a3ecs, absv, adc, af, ai, aicf, aig, aix, altimaam, am1, amex, apis, arca, arg, argo, asc, ascg, asn, asx, asyl, ath, aud, audc, avm, avtf, bats, bist, blackbox, bm, bmf, bmi, bostonzechiel, btm, c.index, cad, carf, cboe, cbot, ccf, chf, cme, comex, courant, cpf, cpm, dam, dcm, diadema, diamageca, dim, dml, dnci, dominion, dsl, e, eam, ec, egam, emea, enam, esplanade, eur, eurex, euronext, exante, fiscoam, forts, fqf, fqifl, fwb, gbp, geist, gk, ham, hkex, htf, ice, inc, index, ipo, iq69, iqsf, jordancap, jse, kgrcap, kif, ky, laif, lat, lcm, lgml, libor, liffe, llcp, lme, lse, lseaim, lseiob, lux, lvam, micex, mifm, mil, moex.tom, mpi, mse, mtg, muskokacap, nasdaq, ncc, ncl, nf, niton, nnps, nomx, ns, nse, nymex, nyse, nzx, oameur, oamusd, oe, oef, oic, omxc, omxh, ose, otcbb, otcmkts, paf, pils, pl, pse, pvb, quan, rig, rub, sb, sek, sgx, sicav, six, smn, somx, ssh, tase, tmx, tocom, tse, tsf, uah, us, uscorp, usd, vse, wcf, wse, xetra, xpira`.

### 6.5.13. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.6. CQG

The robot supports only transactional FIX connections to the CQG broker. The CQG transactional connection can operate either in conjunction with an EXANTE market data connection or independently. Since ticker names differ between EXANTE and CQG, when adding a CQG connection that uses EXANTE market data, you must fill in the ticker name mapping dictionary [Securities dictionary](creating-connection.md#securities-dictionary), adding all instruments you plan to use. When using CQG market data independently, required tickers are added via the `Security manager`, functionality located in the [Data connections](interface.md#data_connections) widget.

### 6.6.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### 6.6.2. Server

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### 6.6.3. SenderCompID

Unique client identifier, provided by the broker.

### 6.6.4. Password

Password for the connection, provided by the broker.

### 6.6.5. SenderSubID

Additional connection identifier. Should remain at its default value unless another value is provided by the broker.

### 6.6.6. Client code

Client code, provided by the broker.

### 6.6.7. Securities dictionary

Dictionary mapping ticker names in the format EXANTE:CQG. Must be filled in according to the given example.

### 6.6.8. Add market-data connection

A checkbox must be checked. If you have your own (non-shared) EXANTE connection, do not check this box.

### 6.6.9. Market-data key

This parameter appears after checking the [Add market-data connection](creating-connection.md#add-market-data-connection) box.

### 6.6.10. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.7. KRAKEN

Connection to the Kraken exchange's Spot market. The robot supports only connections based on Websocket and REST API. Market data connection is activated as described in section [3.1 Setting up connections](getting-started.md#connection-setup). Transactional connection parameters are described below.

### 6.7.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### 6.7.2. API Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. The following permissions should be enabled for the key: "Query Funds", "Query Open Orders & Trades", "Query Closed Orders & Trades", "Create & Modify Orders", "Cancel/Close Orders", "Access WebSockets API", "Export Data". The key must be new and not used anywhere else previously.

### 6.7.3. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. The following permissions should be enabled for the key: "Query Funds", "Query Open Orders & Trades", "Query Closed Orders & Trades", "Create & Modify Orders", "Cancel/Close Orders", "Access WebSockets API", "Export Data". The key must be new and not used anywhere else previously.

### 6.7.4. Cancel on disconnect

A flag that controls automatic order cancellation by the exchange when the connection between the exchange and the robot is lost.

### 6.7.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.8. BITFINEX

The robot supports only connections based on Websocket and REST API. The transactional connection uses two distinct API key pairs, which must be different. Market data connection is activated as described in the [Settin up connections](getting-started.md#connection-setup) section. Transactional connection parameters are described below.

### 6.8.1. Name

A field for specifying the connection name. This value is set for user convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters `_ a-z A-Z 0-9`

### 6.8.2. Margin account

Indicates that your account is a margin account.

### 6.8.3. API key#0

First public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### 6.8.4. API key secret#0

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### 6.8.5. API key#1

Second public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### 6.8.6. API key secret#1

Second secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### 6.8.7. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.9. BITMEX

Connection to the BitMEX exchange's futures market. The robot supports only Websocket and REST API connections. The transactional connection uses two distinct API key pairs, which must be different. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup). Transactional connection parameters are described below.

### 6.9.1. Name

A field for specifying the connection name. This value is set for user convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters `_ a-z A-Z 0-9`

### 6.9.2. ID#0

First public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### 6.9.3. Secret#0

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### 6.9.4. ID#1

Second public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### 6.9.5. Secret#1

Second secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### 6.9.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.10. BINANCE

Connection to Binance exchange's Spot market in either Spot or Margin mode. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#connection-setup). Transactional connection parameters are described below.

To connect, you need to create the `Ed25519` key pair using the utility.

The PUBLIC KEY must be specified on Binance itself when adding the key, and you will receive a ready-made [API key](creating-connection.md#tc.binance.ws_id) value.

The PRIVATE KEY must be specified on our platform in the [Secret](creating-connection.md#tc.binance.ws_secret_part) field.

<details>
    <summary><i>How to generate an Ed25519 key pair for sending API requests to Binance<a id="creating-connection.api-key"></a></i></summary>
Go to the official asymmetric key generator website to download and install the latest version: https://github.com/binance/asymmetric-key-generator/releases 
      
   ![Alt text](/bot-doc/docs/00-img/binance_1.png)

Launch the app, and you'll be able to select the key type to generate. Select `Ed25519`.

![Alt text](/bot-doc/docs/00-img/binance_2.png)

   Create new private and public key pairs `Ed25519`. You can also paste an existing private key `Ed25519` into the text field, and the app will automatically generate a corresponding public key `Ed25519`.

Next, you need to register a key on Binance.

Log in to your Binance account and go to `Profile` - `API Management`. Click `Create API`.

![Alt text](/bot-doc/docs/00-img/binance_3.png)

Select `Self-Generated` and click `Next`.

![Alt text](/bot-doc/docs/00-img/binance_4.png)

Copy the public key `Ed25519`, generated using the asymmetric key generator and paste it into the registration field.

![Alt text](/bot-doc/docs/00-img/binance_5.png)

Enter a name for your API key. Then click `Next` and complete two-factor authentication.

![Alt text](/bot-doc/docs/00-img/binance_6.png)

Once the key is added, a field with key settings and the `API key` itself will appear. The value from this field must be specified in the corresponding `API key` field when connecting to the Viking platform.

![Alt text](/bot-doc/docs/00-img/binance_7.png)

</details>

### 6.10.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.10.2. Account type

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### 6.10.3. Margin account

Indicates that your account is a margin account. If enabling this flag, ensure your API key has the "Enable Margin" permission. This parameter is available only when `Account type = PORTOFLIO MARGIN`.

### 6.10.4. API Key

API key ID for accessing the exchange API. Located in account settings under [API Management](creating-connection.md#binance). The following permissions should be enabled: "Read Info", "Enable Trading". For margin trading, the "Enable Margin" permission should also be enabled. The key must be new and not used anywhere else previously.

### 6.10.5. Secret

A secret key for accessing the exchange API. Created along with the corresponding [public key](creating-connection.md#binance).

On the Viking platform, the middle part of the key is used for the `Secret` field. For example:

Original key:

    -----BEGIN PRIVATE KEY-----
    MC4CAQAwBQYDK2VwBCIEIEjyvxn/KlnDFV5vneMEALsP7ZedYXCEbg5hL+utUfcZ
    -----END PRIVATE KEY-----
    
Use:

    MC4CAQAwBQYDK2VwBCIEIEjyvxn/KlnDFV5vneMEALsP7ZedYXCEbg5hL+utUfcZ

### 6.10.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.11. BINANCEFUT

Connection to Binance exchange's USD-M Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#connection-setup). Transactional connection parameters are described below.

### 6.11.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.11.2. Account type

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### 6.11.3. Conn type

Connection type selection. If there are no special arrangements with the exchange for direct connectivity, select REGULAR. If you have such an arrangement, you should [contact support](help@fkviking.ru) in advance to obtain the server IP address from which trading will occur; then, when creating the connection, choose one of the WHITELIST options.

### 6.11.4. API Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" и "Enable Future".

### 6.11.5. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" и "Enable Future".

### 6.11.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

### 6.11.7. BINANCEFUT Connection Streams Description

`binancefut_listen` - full-featured connection with order book. 

`binancefut_listen_0ms` - full-featured connection with order book using 0ms aggregation (since 0ms aggregation is NOT documented, use at your own risk).

`binancefut_listen_top` - full-featured connection without the order book, providing only best bid and ask prices (`top of book`) with fast updates.

**Important!**

- A "full-featured" connection means that enabling just this single stream is sufficient for the robot to operate properly.
- It is strongly NOT recommended to enable both `top of book` and order book streams simultaneously in the same robot, as they are NOT synchronized and may cause various side effects (such as trading based on stale prices — where prices in the `top of book` stream differ from those in the order book). 
- Note that the above is a recommendation, not a strict prohibition.

## 6.12. BINANCECM

Connection to Binance exchange's COIN-M Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#connection-setup). Transactional connection parameters are described below.

### 6.12.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.12.2. Account type

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### 6.12.3. Conn type

Connection type selection. If there are no special arrangements with the exchange for direct connectivity, select REGULAR. If you have such an arrangement, you should [contact support](help@fkviking.ru) in advance to obtain the server IP address from which trading will occur; then, when creating the connection, choose one of the WHITELIST options.

### 6.12.4. API Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" and "Enable Future".

### 6.12.5. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" and "Enable Future".

### 6.12.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

### 6.12.7. BINANCECM Connection Streams Description

`binancecm_listen` - full-featured connection with order book. 

`binancecm_listen_0ms` - full-featured connection with order book using 0ms aggregation (since 0ms aggregation is NOT documented, use at your own risk).

`binancecm_listen_top` -  full-featured connection without the order book, providing only best bid and ask prices (`top of book`) with fast updates.

**Important!**

- A "full-featured" connection means that enabling just this single stream is sufficient for the robot to operate properly.
- It is strongly NOT recommended to enable both `top of book` and order book streams simultaneously in the same robot, as they are NOT synchronized and may cause various side effects (such as trading based on stale prices — where prices in the `top of book` stream differ from those in the order book). 
- Note that the above is a recommendation, not a strict prohibition.

## 6.13. DERIBIT

The robot supports only Websocket API connections. There are two ways to add a market data connection:

1. Public market data connection — activated as described in the [Setting up connections](getting-started.md#connection-setup);
2. If you are creating a transactional connection, you can set the [Create fast data connection](creating-connection.md#create-fast-data-connection) flag, In this case, a market data connection will be created using the same credentials as the transactional connection. The market data connection created via the second method will react slightly faster to market changes. Additionally, such a paired connection can only be activated or deactivated together with the transactional connection. Transactional connection parameters are described below.

### 6.13.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.13.2. Server

Select between live and test environments. By default, the connection is created to the live environment.

### 6.13.3. Access Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the API section. For this key, set permission "read_write" in the Trade field and "read" for all other fields.

### 6.13.4. Access secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the API section. For this key, set permission "read_write" in the Trade field and "read" for all other fields.

### 6.13.5. Create fast data connection

Set this flag if you want to create a fast market data connection using the same key pair as the transactional connection.

### 6.13.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.14. OKX

Connection to OKX exchange platforms: SPOT, SWAP, FUTURES, OPTION, in cross, isolated, and cash modes. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below. You need to go to the personal account settings on the exchange's website and select "One-way-mode" in the "Position mode" section.

### 6.14.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.14.2. Conn type

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### 6.14.3. API Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the API section. Permissions for reading and trading must be enabled. The "Order placement mode" field must be set to "Net". The key must be new and not used anywhere else previously.

### 6.14.4. Secret Key

Secret API key for accessing the exchange API. It is created in the user account on the exchange website together with the corresponding public key. It is located in account settings under the API section. Permissions for reading and trading must be enabled. The key must be new and not used anywhere else previously.

### 6.14.5. Password

Password for accessing the exchange.

### 6.14.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.15. BEQUANT

The robot supports BEQUANT connections via both Websocket/REST API and FIX protocol. Public market data connection via Websocket and REST API is activated as described in the [Setting up connections](getting-started.md#connection-setup) chaper. When creating a transactional connection, you can select which connection type to use. Adding a transactional FIX connection creates two FIX connections: market data and transactional. Such a pair can only be activated or deactivated together — attempting to deactivate the market data connection will also deactivate the transactional one, and vice versa. Transactional connection parameters are described below.

### 6.15.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.15.2. Conn type

Connection type. Available options are FIX and WEBSOCKET. The WEBSOCKET connection can use keys generated by the user in the exchange's personal account. The FIX connection requires contacting exchange support to obtain access.

#### 6.15.2.1. FIX Connection Parameters

The FIX connection requires establishing a VPN connection; therefore, you should [contact support](help@fkviking.ru) before adding the connection and send us the required VPN parameters.

##### 6.15.2.1.1. Server

Select the server to connect to. If the required address is not in the list, [contact support](help@fkviking.ru).

##### 6.15.2.1.2. Exchange account id

User identifier on the exchange. Can be found in the user’s personal account or requested from exchange support. Enter only the identifier itself, without prefixes such a "login_", "user_" etc.

##### 6.15.2.1.3. Password

Password for the FIX connection. Provided by the exchange along with other FIX connection parameters.

#### 6.15.2.2. WEBSOCKET Connection Parameters

##### 6.15.2.2.1. API

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the "API keys" section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

##### 6.15.2.2.2. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the "API keys" section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

### 6.15.3. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.16. KRAKENFUT

Connection to Kraken exchange's Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.16.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.16.2. Conn type

Select the connection type. If there are no special arrangements with the exchange for direct connectivity, choose REGULAR. If you have such an arrangement, [contact support](help@fkviking.ru) in advance to obtain the server IP address from which trading will occur, then select DIRECT when creating the connection.

### 6.16.3. API Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API section. Access level must be set to "Full access". The key must be new and not used anywhere else previously.

### 6.16.4. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API section. Access level must be set to "Full access". The key must be new and not used anywhere else previously.

### 6.16.5. Cancel on disconnect

Flag that controls automatic order cancellation by the exchange upon disconnection between the exchange and the robot.

### 6.16.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.17. KUCOIN

The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.17.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.17.2. Passphrase

Password phrase for accessing the exchange.

### 6.17.3. Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.17.4. Secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.17.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.18. HUOBI

Connection to the Spot market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.18.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.18.2. Server

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the option api-aws.huobi.pro

### 6.18.3. Access Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.18.4. Secret Key

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.18.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.19. HUOBIFUT

Connection to the Coin-M Futures market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup)chapter. Transactional connection parameters are described below.

### 6.19.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.19.2. Server

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### 6.19.3. Access Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.19.4. Secret Key

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.19.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.20. HUOBIFUTCM

Connection to the Coin-M Swaps market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup)chapter. Transactional connection parameters are described below.

### 6.20.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.20.2. Server

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### 6.20.3. Access Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.20.4. Secret Key

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.20.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.21. HUOBIFUTUM

Connection to the USDT-M market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.21.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.21.2. Server

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### 6.21.3. Access Key

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.21.4. Secret Key

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.21.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.22. VIKINGTRADE

The robot supports only Websocket API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.22.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.22.2. Conn type

Select between live and test environments. By default, the connection is created to the live environment.

### 6.22.3. Public key id

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located under Account → API. When creating the key, trading permission must be enabled.

### 6.22.4. Access secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located under Account → API. When creating the key, trading permission must be enabled.

### 6.22.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.23. BYBIT

Connection to Bybit exchange markets: Inverse Perpetual, USDT Perpetual, and Inverse Futures. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. The account must be in `One-Way mode`. Transactional connection parameters are described below.

### 6.23.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.23.2. Public key id

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.23.3. Access secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.23.4. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.24. BYBITSPOT

Connection to Bybit exchange's Spot market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#connection-setup) chapter. Transactional connection parameters are described below.

### 6.24.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### 6.24.2. Public key id

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### 6.24.3. Access secret

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### 6.24.4. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.25. CTRADER

The robot supports only FIX connections to the cTrader broker. When adding a transactional connection, two FIX connections are created: market data and transactional. Such a pair can be activated or deactivated only together — attempting to deactivate the market data connection will also deactivate the corresponding transactional connection, and vice versa.

Only one connection to Ctrader is allowed within a single robot, as different brokers may have different IDs for instruments, which can cause errors when placing orders.

**Important!** The lot size is not provided in the Ctrader FIX API, so the robot does not offer the ability to trade in instrument units; trading is performed in lots. For convenience, you can also switch to trading in lots in the Ctrader terminal itself.

### 6.25.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### 6.25.2. Conn type

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### 6.25.3. SenderCompID

Unique client identifier, provided by the broker.

### 6.25.4. Login

cTrader account number.

### 6.25.5. Password (trade)

Password for both trading and market data FIX connections; matches the password of the cTrader account.

### 6.25.6. Try to use only one position for one instrument

A flag that, when enabled, prevents the robot from placing more than one order per instrument if no open position exists. As soon as this order is executed and an open position is created, all restrictions on placing further orders for that instrument are lifted.

### 6.25.7. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.26. IMEX

### 6.26.1. Market Data (binary protocol)

The market data connection consists of several data streams. You can activate only the streams you need and disable the unnecessary ones.
If an instrument's name starts with IMEX_MM_, it represents IMEX liquidity only (orders and trades directly from IMEX exchange). If the name starts with IMEX_AGGR_, it represents aggregated liquidity from various exchanges. If the instrument name starts with IMEX_OKX_, it represents liquidity from OKX exchange.

#### 6.26.1.1. Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to "Enable" status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### 6.26.1.2. Top of book

Best bid and ask prices stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### 6.26.1.3. Orderbook

Order book stream. We recommend NOT enabling it simultaneously with the Top of book stream.

### 6.26.2. Binary Protocol Transaction Gateway

Make sure you ordered a binary, not a FIX login. Only one active connection is allowed per login.

**Important!** Due to the slow distribution of instrument status information by the exchange, instrument status checking has been disabled for this connection when placing orders. When portfolio trading is enabled, instrument status checking is not performed when the conditions for placing an order are met. This may result in an order being submitted when the instrument is not trading. To prevent this, it is required to configure a schedule for portfolios using this connection.

#### 6.26.2.1. Name

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### 6.26.2.2. Login

Login for accessing the exchange, taken from the exchange agreement.

#### 6.26.2.3. Password

Password for accessing the exchange, taken from the exchange agreement.

#### 6.26.2.4. Trading account(s)

Trading account, taken from the exchange agreement. Multiple accounts can be added, separated by commas.

#### 6.26.2.5. Member ID

Participant identifier; defaults to 0. If this value does not work, clarify with the exchange.

#### 6.26.2.6. Client ID

Client code identifier, taken from the exchange agreement.

#### 6.26.2.7. Market ID

Used for routing orders to the appropriate liquidity pool; the correct value should be clarified with the exchange.

#### 6.26.2.8. Prime exchange

Used for routing orders to the appropriate liquidity pool; the correct value should be clarified with the exchange.

#### 6.26.2.9. Comment

Client comment for orders.

#### 6.26.2.10. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

## 6.27. ITS

### 6.27.1. Market data (binary protocol)

#### 6.27.1.1. Definitions

Financial instrument definition stream. For the connection to work, the Enable status must be set for this stream. In addition to instrument definitions, it also includes their trading statuses and price limits.

#### 6.27.1.2. Top of book

Best buy and sell price stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### 6.27.1.3. Orderbook

Order book feed. We recommend NOT enabling it simultaneously with the Top of Book feed.

### 6.27.2. Binary Protocol Transaction Gateway

Please make sure you ordered a binary login, not a fixed one. Multiple simultaneous connections cannot be added to a single login.

**Important!** Due to the slow distribution of instrument status information by the exchange, instrument status checking has been disabled for this connection when placing orders. When portfolio trading is enabled, instrument status checking is not performed when the conditions for placing an order are met. This may result in an order being submitted when the instrument is not trading. To prevent this, it is recommended to configure a schedule for portfolios using this connection.

#### 6.27.2.1. Name

A field for specifying the connection name. This value is provided for convenience, to make it easier to navigate the list of transaction connections. Allowed characters: `_ a-z A-Z 0-9`.

#### 6.27.2.2. Login

The login for accessing the exchange is taken from the agreement with the exchange.

#### 6.27.2.3. Password

The password for accessing the exchange is taken from the agreement with the exchange.

#### 6.27.2.4. Trading account(s)

The trading account is taken from the agreement with the exchange. Multiple accounts can be added, separated by commas.

#### 6.27.2.5. Member ID

The trading participant ID is 0 by default. If it doesn’t work, you need to check with the exchange.

#### 6.27.2.6. Comment

A text comment added to each request submitted by this connection.

#### 6.27.2.7. Client ID

Client code identifier, taken from the agreement with the exchange.

#### 6.27.2.8. Market ID

Used to route orders to the desired liquidity pool; the required value should be verified with the exchange.

#### 6.27.2.9. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

## 6.28. OREX

### 6.28.1. Market data (binary protocol)

#### 6.28.1.1. Definitions

Financial instrument definition stream. For the connection to work, the Enable status must be set for this stream. In addition to instrument definitions, it also includes their trading statuses and price limits.

#### 6.28.1.2. Top of book

Best buy and sell price stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### 6.28.1.3. Orderbook

Order book feed. We recommend NOT enabling it simultaneously with the Top of Book feed.

### 6.28.2. Binary Protocol Transaction Gateway

Please make sure you ordered a binary login, not a fixed one. Multiple simultaneous connections cannot be added to a single login.

**Important!** Due to the slow distribution of instrument status information by the exchange, instrument status checking has been disabled for this connection when placing orders. When portfolio trading is enabled, instrument status checking is not performed when the conditions for placing an order are met. This may result in an order being submitted when the instrument is not trading. To prevent this, it is recommended to configure a schedule for portfolios using this connection.

#### 6.28.2.1. Name

A field for specifying the connection name. This value is provided for convenience, to make it easier to navigate the list of transaction connections. Allowed characters: `_ a-z A-Z 0-9`.

#### 6.28.2.2. Login

The login for accessing the exchange is taken from the agreement with the exchange.

#### 6.28.2.3. Password

The password for accessing the exchange is taken from the agreement with the exchange.

#### 6.28.2.4. Trading account(s)

The trading account is taken from the agreement with the exchange. Multiple accounts can be added, separated by commas.

#### 6.28.2.5. Member ID

The trading participant ID is 0 by default. If it doesn’t work, you need to check with the exchange.

#### 6.28.2.6. Comment

A text comment added to each request submitted by this connection.

#### 6.28.2.7. Client ID

Client code identifier, taken from the agreement with the exchange.

#### 6.28.2.8. Market ID

Used to route orders to the desired liquidity pool; the required value should be verified with the exchange.

#### 6.28.2.9. Bind IP

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

## 6.29. J2T

The robot supports only FIX connectivity to the broker JUST2TRADE.

Due to the specifics of this connection, full setup is only possible after you [contact technical support](help@fkviking.ru).

### 6.29.1. Name

A field for setting the connection name. This value is set for convenience, to make it easier to identify the connection in the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### 6.29.2. Server

Selects the server to which the connection will be established. Currently, only one server is available.

### 6.29.3. SenderCompID

The client's unique identifier, provided by the broker. The broker JUST2TRADE confuses the FIX protocol fields `SenderCompID` and `TargetCompID`. Therefore, from the two fields provided by the broker (`SenderCompID` and `TargetCompID`), you must use the one whose value is different from `J2TT`.

### 6.29.4. Login

The client account name for JUST2TRADE.

### 6.29.5. Password

Password for the trading FIX connection; may be the same as the JUST2TRADE account password.

### 6.29.6. Client code

Client code is used when adding order. Most often, the value is a numeric identifier contained in the client`s login. Since the value of this field does not affect connection authentication, you should try adding order to verify that this field is set correctly.

### 6.29.7. Use SSL/TLS

A flag indicating whether SSL/TLS encryption should be used. Information about whether encryption is enabled for a given login is provided by the broker.

### 6.29.8. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.30. BITGETFUT

### 6.30.1. Name

You set the connection name in this field. Its value is set for convenience, to make it easier to identify the connection in the list of transactional connections. The allowed characters are `_ a-z A-Z 0-9`

### 6.30.2. Key API

The key API is a public key to access BITGET API. It is set on your account page on BITGET site together with the corresponding private key. The option is located in your account settings, API section. 

### 6.30.3. Key secret

The key API is a private key to access BITGET API. It is set on your account page on BITGET site together with the corresponding public key. The option is located in your account settings, API section.

### 6.30.4. Passphrase

The pass-phrase is set by the user.

### 6.30.5. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.31. BITGETSPOT

### 6.31.1. Name

You set the connection name in this field. Its value is set for convenience, to make it easier to identify the connection in the list of transactional connections. The allowed characters are `_ a-z A-Z 0-9`

### 6.31.2. Conn type

It is a trading mode option. Available modes include `Spot` (trading without leverage) as well as `Isolated` and `Cross` margin trading modes. A detailed comparison of the trading modes can be found on BITGET website.

### 6.31.3. Key API

The key API is a public key to access BITGET API. It is set on your account page on BITGET site together with the corresponding private key. The option is located in your account settings, API section. 

### 6.31.4. Key secret

The key API is a private key to access BITGET API. It is set on your account page on BITGET site together with the corresponding public key. The option is located in your account settings, API section. 

### 6.31.5. Passphrase

The pass-phrase is set by the user.

### 6.31.6. Bind IP

You should [contact support](help@fkviking.ru) to clarify bind IP. The IP address specified in this field should not be provided to the exchange as the IP address of the server.

## 6.32. LMAX

Description is under development
