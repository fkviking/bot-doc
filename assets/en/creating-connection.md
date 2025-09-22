---
title: 6. Adding Connections
section: 6
---

# Adding Connections

This section describes the exchanges/brokers and markets supported by the robot, along with all parameters used when creating each connection. Some connection parameters directly correspond to fields in the exchange's API; for such parameters, we aim to use names that match those in the exchange API. For example: `Credentials`, `SenderCompID`, `ComplianceID` , and many others.
Please note that not all parameters specified during trade connection setup are used during authentication. Some parameters — for instance, `Trading account(s)` - may only be applied when placing or canceling an order.  Therefore, successful authentication and bringing a trade connection online do not guarantee that all connection settings are correct. To verify the correctness of all parameters, create a [портфель](getting-started.md#portfolio_add) with one instrument, place an order (e.g., using the [кликера](params-description.md#p.buy_portfolio))  in such a way that it does not immediately execute as a trade (for example, by setting a negative value for the [k](params-description.md#s.k) parameter), and then cancel this order (e.g., via [Hard stop](getting-started.md#portfolio_actions.hard_stop).

## MOEX FORTS

### TWIME и FIFO TWIME

The robot supports connections via the TWIME protocol in both standard TWIME and FIFO TWIME modes. However, using FIFO TWIME requires additional network infrastructure. If you plan to use FIFO TWIME, please notify support in advance. They will deploy the robot on a server where infrastructure-level access to FIFO TWIME is available.

When creating the connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.MOEX_FUT_OPT.twime_server) address.

When ordering this type of connection, keep in mind that two logins at 30 transactions/sec perform better than one login at 60 transactions/sec (see [Round robin](params-description.md#s.client_code)).

#### Name  <Anchor :ids="['tc.MOEX_FUT_OPT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to navigate in the list of trade connections. Allowed characters: `_ a-z A-Z 0-9`

#### TWIME server  <Anchor :ids="['tc.MOEX_FUT_OPT.twime_server']" />

The TWIME server address of the exchange to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### Credentials  <Anchor :ids="['tc.MOEX_FUT_OPT.credentials']" />

Credentials are provided by the broker.

#### Trading account(s) <Anchor :ids="['tc.MOEX_FUT_OPT.client_code']" />

Trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they should be listed separated by commas):

![Alt text](@images/4-1-1-3.png)

#### Comment <Anchor :ids="['tc.MOEX_FUT_OPT.comment']" />

A unique identifier for all orders within this connection, set by the user for their own convenience. It is an integer ranging from 0 to 1073741823. If not used, leave it as 0. 

#### Round robin <Anchor :ids="['tc.MOEX_FUT_OPT.round_robin']" />

Enabled by default. For improved performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#tc.MOEX_FUT_OPT.client_code). When ordering a TWIME connection, keep in mind that two logins at 30 transactions/sec to the same trading account in `Round robin` mode will perform better than a single login at 60 transactions/sec. In this mode, the robot will send orders to the multiple logins in a round-robin fashion.

#### ComplianceID <Anchor :ids="['tc.MOEX_FUT_OPT.compliance_id']" />

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### Max trans <Anchor :ids="['tc.MOEX_FUT_OPT.max_transactions_in_one_second']" />

Transactions per second limit. The user's application specifies login performance, where one unit equals 30 transactions per second.

#### Reserved trans <Anchor :ids="['tc.MOEX_FUT_OPT.transactions_reserved']" />

Default is 0. The number of transactions per second reserved for cancellation orders. Using this parameter reduces the number of order submissions available per second defined by [Max trans](creating-connection.md#tc.MOEX_FUT_OPT.max_transactions_in_one_second), but increases the likelihood that the robot will be able to cancel an order in time when prices move.

#### Move order <Anchor :ids="['tc.MOEX_FUT_OPT.is_move_available']" />

Allowed by default. Allows or prohibits the use of order modification (move) commands for this connection.

#### Fast aggregation mode (on SIMBA) <Anchor :ids="['tc.MOEX_FUT_OPT.fast_aggregation_mode']" />

When this flag is used, the connection will utilize trade data from the market-data connection, specifically from the Orderlog stream of the corresponding SIMBA connection, provided that this stream is in the `Enabled` state. When this flag is used, the connection will utilize trade data from the market-data connection, specifically from the Orderlog stream of the corresponding SIMBA connection, provided that this stream is in the `Deals for today` and `Deals history` widgets, such trades will be displayed with the `Aggregated` flag.

#### Bind IP <Anchor :ids="['tc.MOEX_FUT_OPT.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### FAST (FIX Adapted for STreaming) <Anchor :ids="['tc.MOEX_FUT_OPT.FAST']" />

This connection consists of 4 streams. This is designed to separate rarely used options, as well as to distinguish the resource-intensive but fast Orderlog stream from the slightly slower but lighter Best prices stream.

#### Futures Definitions

Instrument definition stream for futures. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Best prices

Best prices stream. Not mandatory. Automatically disabled when the Orderlog stream is set to Enable, as the exchange does not support combining streams on the FAST derivatives market.

#### Orderlog <Anchor :ids="['tc.MOEX_FUT_OPT.FAST.orderlog']" />

Stream of all orders; the aggregated order book is built based on this data. Note that since the order book for a single instrument is constructed using only order data for that specific instrument, levels reconstructed from other instruments' order books (synthetic liquidity) will be missing in such an order book.

#### Options definitions

Instrument definition stream for options. To trade options, this stream must be set to Enable status.

### SIMBA <Anchor :ids="['tc.MOEX_FUT_OPT.SIMBA']" />

This connection consists of 3 streams. This is designed to separate rarely used options.

#### Futures Definitions

Instrument definition stream for futures. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Orderlog <Anchor :ids="['tc.MOEX_FUT_OPT.SIMBA.orderlog']" />

Stream of all orders; the aggregated order book is built based on this data. Note that since the order book for a single instrument is constructed using only order data for that specific instrument, levels reconstructed from other instruments' order books (synthetic liquidity) will be missing in such an order book.

#### Options Definitions

Instrument definition stream for options. To trade options, this stream must be set to Enable status.


## MOEX Spot

### FIX (Financial Information eXchange)

When connecting to the cash market, we recommend ordering 3 (three) logins for a single trading account, as there are 3 (three) FIX servers on the cash market, and occasionally one or two may become unavailable. This increases the fault tolerance of your trading [see. Round robin](params-description.md#s.client_code).

#### Name <Anchor :ids="['tc.MOEX_FOND.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### Server <Anchor :ids="['tc.MOEX_FOND.host_port_target_comp_id']" />

The address of the exchange's FIX server to which the connection will be established.

#### SenderCompID <Anchor :ids="['tc.MOEX_FOND.sender_comp_id']" />

The value of this parameter is provided by the broker.

#### Password <Anchor :ids="['tc.MOEX_FOND.password']" />

**Important:** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about password changes can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### Trading account(s) <Anchor :ids="['tc.MOEX_FOND.client_code']" />

The trading account, provided by the broker. It can also be viewed in the trading terminal (if there are multiple accounts, they should be listed separated by commas):

![Alt text](@images/4-2-1-5.png)

#### Round robin  <Anchor :ids="['tc.MOEX_FOND.round_robin']" />

Enabled by default.
For fault tolerance, we recommend using three FIX connections to the cash market with the same [Trading account(s)](creating-connection.md#tc.MOEX_FOND.client_code). In `Round robin` mode, the robot will use them sequentially, so an unexpected disconnection of one of the exchange's FIX servers will not stop trading.

#### Client code <Anchor :ids="['tc.MOEX_FOND.clordid']" />

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](@images/4-2-1-7.png)

#### ComplianceID <Anchor :ids="['tc.MOEX_FOND.compliance_id']" />

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### Firm level account <Anchor :ids="['tc.MOEX_FOND.moex_party_id']" />

A checked checkbox indicates that the client's account is a firm-level account.

#### Bind IP <Anchor :ids="['tc.MOEX_FOND.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### TWIME и FIFO TWIME

TWIME is a binary protocol, a faster alternative to the FIX protocol. The robot supports connections via the TWIME protocol in both TWIME and FIFO TWIME variants. However, using FIFO TWIME requires additional network infrastructure, so if you plan to use FIFO TWIME, please notify support staff in advance—they will place the robot on a server where such connectivity is supported at the infrastructure level. When creating a connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.MOEX_FOND.TWIME.twime_server) address to connect to.

#### Name <Anchor :ids="['tc.MOEX_FOND.TWIME.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### TWIME server  <Anchor :ids="['tc.MOEX_FOND.TWIME.twime_server']" />

The address of the exchange's TWIME server to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### Username <Anchor :ids="['tc.MOEX_FOND.TWIME.username']" />

The value of this parameter is provided by the broker.

#### Password <Anchor :ids="['tc.MOEX_FOND.TWIME.password']" />

**Important:** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### Trading account(s) <Anchor :ids="['tc.MOEX_FOND.TWIME.client_code']" />

The trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they are listed separated by commas):

![Alt text](@images/4-2-1-5.png)

#### Round robin  <Anchor :ids="['tc.MOEX_FOND.TWIME.round_robin']" />

Enabled by default. To improve performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#'tc.MOEX_FOND.TWIME.client_code).  In this mode, the robot will send orders to multiple logins in a round-robin fashion.

#### Client code <Anchor :ids="['tc.MOEX_FOND.TWIME.clordid']" />

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](@images/4-2-1-7.png)

#### Brokerref <Anchor :ids="['tc.MOEX_FOND.brokerref']" />

The value of this parameter is provided by the broker.

#### ComplianceID <Anchor :ids="['tc.MOEX_FOND.TWIME.compliance_id']" />

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### Bind IP <Anchor :ids="['tc.MOEX_FOND.TWIME.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### FAST

This connection consists of 3 streams. This is designed to separate the Orderlog stream from the Best prices stream. They have similar speed, and the exchange allows their simultaneous use, so they can be enabled together. However, Best prices is clearly less resource-intensive.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Best prices

Best prices stream. We recommend enabling it simultaneously with the Orderlog stream.

#### Orderlog

Stream of all orders. We recommend enabling it simultaneously with the Best prices stream.

### SIMBA

This connection consists of 2 streams.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Orderlog

Stream of all orders; the aggregated order book is built based on this data.

## MOEX Currency

### FIX

When connecting to the currency market, we recommend ordering 5 (five) logins for a single trading account, as there are 5 (five) FIX servers on the currency market, and occasionally one or two may become unavailable. This increases the fault tolerance of your trading ([see. Round robin](params-description.md#s.client_code)).

#### Name  <Anchor :ids="['tc.MOEX_CURR.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### Server <Anchor :ids="['tc.MOEX_CURR.host_port_target_comp_id']" />

The address of the exchange's FIX server to which the connection will be established. For improved fault tolerance, different addresses should be selected.

#### SenderCompID <Anchor :ids="['tc.MOEX_CURR.sender_comp_id']" />

The value of this parameter is provided by the broker.

#### Password <Anchor :ids="['tc.MOEX_CURR.password']" />

Password for this FIX connection. If not changed, use the default one shown in the input field.

**Important:**  when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### Trading account(s) <Anchor :ids="['tc.MOEX_CURR.client_code']" />

The trading account, provided by the broker; it can also be viewed in the terminal.
If there are multiple accounts, they should be listed separated by commas.

![Alt text](@images/4-3-1-5.png)

#### Round robin <Anchor :ids="['tc.MOEX_CURR.round_robin']" />

Enables or disables `Round robin`'for this connection.
For fault tolerance, we recommend using 5 (five) FIX connections to the currency market with the same [Trading account(s)](creating-connection.md#tc.MOEX_CURR.client_code). In `Round robin` mode, the robot will use them sequentially, so an unexpected disconnection of one of the exchange's FIX servers will not stop trading.

#### Client code  <Anchor :ids="['tc.MOEX_CURR.clordid']" />

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker.
When entering, add two slashes '//' at the end. Depending on broker instructions, it might be one slash at the end and one in the middle. If no instructions were given, leave two at the end.

![Alt text](@images/4-3-1-7.png)

#### ComplianceID <Anchor :ids="['tc.MOEX_CURR.compliance_id']" />

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### Firm level account <Anchor :ids="['tc.MOEX_CURR.moex_party_id']" />

Indicates that the user's account is a firm-level account. Brokers usually do not know the account level, so it often needs to be determined manually.

#### Bind IP  <Anchor :ids="['tc.MOEX_CURR.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### TWIME и FIFO TWIME

TWIME is a binary protocol, a faster alternative to the FIX protocol. The robot supports connections via the TWIME protocol in both TWIME and FIFO TWIME variants. However, using FIFO TWIME requires additional network infrastructure, so if you plan to use FIFO TWIME, please notify support staff in advance—they will place the robot on a server where such connectivity is supported at the infrastructure level. When creating a connection, the choice between TWIME and FIFO TWIME is made by selecting the appropriate [TWIME server](creating-connection.md#tc.MOEX_CURR.TWIME.twime_server) address to conncet to.

#### Name <Anchor :ids="['tc.MOEX_CURR.TWIME.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

#### TWIME server  <Anchor :ids="['tc.MOEX_CURR.TWIME.twime_server']" />

The address of the exchange's TWIME server to which the connection will be established. The list includes addresses for both TWIME and FIFO TWIME.

#### Username <Anchor :ids="['tc.MOEX_CURR.TWIME.username']" />

The value of this parameter is provided by the broker.

#### Password <Anchor :ids="['tc.MOEX_CURR.TWIME.password']" />

**Important:** when creating a new connection, if the password does not meet certain criteria, the robot may automatically change the password. Information about the password change can be found in the robot's log.
The current connection password can be viewed in the Trade connections widget when editing the connection: Trade connections settings (gear icon)-> Actions->Edit.

For transactional connections to the equity and currency markets of Moscow Exchange, the robot automatically changes the password no more than once per month. Notification about password change can be found in the robot's log.

#### Trading account(s) <Anchor :ids="['tc.MOEX_CURR.TWIME.client_code']" />

The trading account, provided by the broker. It can also be viewed in the terminal (if there are multiple accounts, they are listed separated by commas):

![Alt text](@images/4-2-1-5.png)

#### Round robin  <Anchor :ids="['tc.MOEX_CURR.TWIME.round_robin']" />

Enabled by default. To improve performance, you can use multiple TWIME connections with the same [Trading account(s)](creating-connection.md#'tc.MOEX_CURR.TWIME.client_code). In this mode, the robot will send orders to multiple logins in a round-robin fashion.

#### Client code <Anchor :ids="['tc.MOEX_CURR.TWIME.clordid']" />

The client code can be viewed in the terminal linked to the account (press F7 and open the "Money positions" table) or requested from the broker:

![Alt text](@images/4-2-1-7.png)

#### Brokerref <Anchor :ids="['tc.MOEX_CURR.TWIME.brokerref']" />

The value of this parameter is provided by the broker.

#### ComplianceID <Anchor :ids="['tc.MOEX_CURR.TWIME.compliance_id']" />

A label for the order creation method used for orders placed through this connection. If no instructions have been provided by the exchange or broker regarding the value of this field, it is recommended to keep the default value.

#### Bind IP <Anchor :ids="['tc.MOEX_CURR.TWIME.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement with the broker.

### FAST

This connection consists of 3 streams. This is designed to separate the Orderlog stream from the Best prices stream. They have similar speed, and the exchange allows their simultaneous use, so they can be enabled together. However, Best prices is clearly less resource-intensive.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Best prices

Best prices stream. We recommend enabling it simultaneously with the Orderlog stream.

#### Orderlog

Stream of all orders. We recommend enabling it simultaneously with the Best prices stream.

### FAST Indexes

To view and add indices to the portfolio, this stream must be set to Enable status.

### SIMBA

This connection consists of 2 streams.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Orderlog

Stream of all orders; the aggregated order book is built based on this data.

## SPB

### Рыночные данные (бинарный протокол)

The market data connection consists of several data streams. You can activate only the streams you need and disable the unnecessary ones.
If an instrument's name starts with SPB_MM_, it represents SPB liquidity only (orders and trades directly from SPB Exchange). If the name starts with SPB_AGGR_, it represents aggregated liquidity from multiple exchanges. If you are a market maker, you most likely have access only to SPB liquidity.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to Enable status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.


#### Commons

Stream of statistical market parameters. Not used within the robot's algorithm, but available via the[C++ interface](c-api.md#доступ-к-биржевым-данным-по-финансовым-инструментам).

#### Top of book

Best bid and ask prices stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### Orderbook

Order book stream. We recommend NOT enabling it simultaneously with the Top of book stream.

### Транзакционный шлюз бинарного протокола

Make sure you ordered a binary, not a FIX login. Only one active connection is allowed per login.

#### Name <Anchor :ids="['tc.SPB.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### Connection type <Anchor :ids="['tc.SPB.conn_type']" />

Direct — a regular connection that connects directly to the exchange.
Proxy — used to enable multiple robots to trade through a single connection.

#### Login <Anchor :ids="['tc.SPB.login']" />

Login for accessing the exchange, taken from the exchange agreement.

#### Password  <Anchor :ids="['tc.SPB.password']" />

Password for accessing the exchange, taken from the exchange agreement.

#### Trading account(s) <Anchor :ids="['tc.SPB.account']" />

Trading account, taken from the exchange agreement. Multiple accounts can be added, separated by commas.

#### Member ID <Anchor :ids="['tc.SPB.member_id']" />

Participant identifier; defaults to 0. If this value does not work, clarify with the exchange.

#### Client ID <Anchor :ids="['tc.SPB.client_id']" />

Client code identifier, taken from the exchange agreement.

#### Market ID  <Anchor :ids="['tc.SPB.market_id']" />

Liquidity pool identifier. Valid values: 0 (liquidity is automatically determined by financial instrument), 1000 (for addressed instruments, SPB Exchange liquidity only), and 1001 (for anonymous instruments, aggregated liquidity).

#### Comment <Anchor :ids="['tc.SPB.comment']" />

Client comment for orders.

#### Bind IP <Anchor :ids="['tc.SPB.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

### Прокси подключение к транзакционному шлюзу бинарного протокола

Used when multiple robots need to trade through the same transactional connection (i.e., under a single login). Configured by support staff using parameters provided by the user. Parameters are the same as for [Бинарный торговый](creating-connection.md#транзакционный-шлюз-бинарного-протокола).

#### Name

This value must match the name of the shared memory segment used for message exchange. Clarify with support service.

## ALOR OPEN API MOEX

### Name <Anchor :ids="['tc.ALORMOEX.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Refresh token <Anchor :ids="['tc.ALORMOEX.refresh_token_part']" />

Token for API access.

### Trading account(s) <Anchor :ids="['tc.ALORMOEX.client_code']" />

Client's trading account

## ALOR OPEN API SPB

### Name <Anchor :ids="['tc.ALORSPB.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Refresh token  <Anchor :ids="['tc.ALORSPB.refresh_token_part']" />

Token for API access.

### Trading account(s) <Anchor :ids="['tc.ALORSPB.client_code']" />

Client's trading account

## EXANTE

The robot supports only FIX connections to the EXANTE broker. When adding a transactional connection, two FIX connections are created: market data and transactional. Such a pair of connections can be activated or deactivated only together; that is, attempting to deactivate the market data connection will also deactivate the corresponding transactional connection, and vice versa. Since EXANTE broker can provide market data from a large number of exchanges, the [Exchange filter](creating-connection.md#exchange-filter) field—specifying the list of required exchanges—is mandatory. It is strongly recommended to include only those exchanges whose instruments you actually plan to use.

### Name <Anchor :ids="['tc.EXANTE.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### Conn type <Anchor :ids="['tc.EXANTE.conn_type']" />

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### SenderCompID (trade) <Anchor :ids="['tc.EXANTE.sender_comp_id']" />

Unique client identifier for the transactional connection, provided by the broker.

### Password (trade) <Anchor :ids="['tc.EXANTE.password']" />

Password for the transactional connection, provided by the broker. If the broker provided only one password, then most likely the market data and transactional connection passwords are the same.

### Trading account(s) <Anchor :ids="['tc.EXANTE.client_code']" />

Client account identifier, obtained from the broker. Multiple accounts can be added, separated by commas.

### Max trans <Anchor :ids="['tc.EXANTE.max_transactions']" />

One of the flood protection system parameters. To avoid triggering the broker's flood control, we count outgoing messages internally. This parameter defines the maximum number of messages allowed within a time interval. If the number of messages sent within the time interval defined by [Max trans interval](creating-connection.md#max-trans-interval) exceeds this value, the robot stops sending messages to the broker.

### Max trans interval <Anchor :ids="['tc.EXANTE.max_transactions']" />

One of the flood protection system parameters. To avoid triggering the broker's flood control, we count outgoing messages internally. This parameter defines the time interval. If the number of messages sent within this interval exceeds the value set in [Max trans](creating-connection.md#max-trans), the robot stops sending messages to the broker.

### Transactions reserved <Anchor :ids="['tc.EXANTE.transactions_reserved']" />

One of the flood protection system parameters. This parameter specifies how many transactions per time interval [Max trans interval](creating-connection.md#max-trans-interval) are reserved for order cancellations.That means, even if order submissions hit the robot’s internal flood control limit, the robot will still be able to send cancellation requests up to the number specified in Transactions reserved.

### SenderCompID (feed) <Anchor :ids="['tc.EXANTE.md_sender_comp_id']" />

Unique client identifier for the market data connection, provided by the broker.

### Password (feed) <Anchor :ids="['tc.EXANTE.md_password']" />

Password for the market data connection, provided by the broker. If the broker provided only one password, then most likely the market data and transactional connection passwords are the same.

### Exchange filter <Anchor :ids="['tc.EXANTE.md_exchanges']" />

List of exchanges (separated by commas) from which market data will be received. At least one exchange must be specified. Currently, data is known to be available from the following markets:  
`a3ecs, absv, adc, af, ai, aicf, aig, aix, altimaam, am1, amex, apis, arca, arg, argo, asc, ascg, asn, asx, asyl, ath, aud, audc, avm, avtf, bats, bist, blackbox, bm, bmf, bmi, bostonzechiel, btm, c.index, cad, carf, cboe, cbot, ccf, chf, cme, comex, courant, cpf, cpm, dam, dcm, diadema, diamageca, dim, dml, dnci, dominion, dsl, e, eam, ec, egam, emea, enam, esplanade, eur, eurex, euronext, exante, fiscoam, forts, fqf, fqifl, fwb, gbp, geist, gk, ham, hkex, htf, ice, inc, index, ipo, iq69, iqsf, jordancap, jse, kgrcap, kif, ky, laif, lat, lcm, lgml, libor, liffe, llcp, lme, lse, lseaim, lseiob, lux, lvam, micex, mifm, mil, moex.tom, mpi, mse, mtg, muskokacap, nasdaq, ncc, ncl, nf, niton, nnps, nomx, ns, nse, nymex, nyse, nzx, oameur, oamusd, oe, oef, oic, omxc, omxh, ose, otcbb, otcmkts, paf, pils, pl, pse, pvb, quan, rig, rub, sb, sek, sgx, sicav, six, smn, somx, ssh, tase, tmx, tocom, tse, tsf, uah, us, uscorp, usd, vse, wcf, wse, xetra, xpira`.

### Bind IP <Anchor :ids="['tc.EXANTE.bind_ip']" />

To obtain the correct IP address, please contact support. The address entered in this field should not be provided to the exchange as a server address.

## CQG

The robot supports only transactional FIX connections to the CQG broker. The CQG transactional connection can operate either in conjunction with an EXANTE market data connection or independently. Since ticker names differ between EXANTE and CQG, when adding a CQG connection that uses EXANTE market data, you must fill in the ticker name mapping dictionary [Securities dictionary](creating-connection.md#securities-dictionary), adding all instruments you plan to use. When using CQG market data independently, required tickers are added via the `Security manager`, functionality located in the [Data connections](interface.md#data_connections) widget.

### Name <Anchor :ids="['tc.CQG.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### Server <Anchor :ids="['tc.CQG.host_ssl_host_port_target_comp_id']" />

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### SenderCompID <Anchor :ids="['tc.CQG.sender_comp_id']" />

Unique client identifier, provided by the broker.

### Password <Anchor :ids="['tc.CQG.password']" />

Password for the connection, provided by the broker.

### SenderSubID <Anchor :ids="['tc.CQG.sender_sub_id']" />

Additional connection identifier. Should remain at its default value unless another value is provided by the broker.

### Client code <Anchor :ids="['tc.CQG.client_code']" />

Client code, provided by the broker.

### Securities dictionary <Anchor :ids="['tc.CQG.securities']" />

Dictionary mapping ticker names in the format EXANTE:CQG. Must be filled in according to the given example.

### Add market-data connection <Anchor :ids="['tc.CQG.create_listen']" />

A checkbox must be checked. If you have your own (non-shared) EXANTE connection, do not check this box.

### Market-data key <Anchor :ids="['tc.CQG.cqg_listen_key']" />

This parameter appears after checking the [Add market-data connection](creating-connection.md#add-market-data-connection) box.

### Bind IP <Anchor :ids="['tc.CQG.bind_ip']" />

To obtain the correct IP address, please contact support. The address entered in this field should not be provided to the exchange as a server address.

## KRAKEN

Connection to the Kraken exchange's Spot market. The robot supports only connections based on Websocket and REST API. Market data connection is activated as described in section [3.1 Setting up connections](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.KRAKEN.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### API Key <Anchor :ids="['tc.KRAKEN.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. The following permissions should be enabled for the key: "Query Funds", "Query Open Orders & Trades", "Query Closed Orders & Trades", "Create & Modify Orders", "Cancel/Close Orders", "Access WebSockets API", "Export Data". The key must be new and not used anywhere else previously.

### Secret <Anchor :ids="['tc.KRAKEN.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. The following permissions should be enabled for the key: "Query Funds", "Query Open Orders & Trades", "Query Closed Orders & Trades", "Create & Modify Orders", "Cancel/Close Orders", "Access WebSockets API", "Export Data". The key must be new and not used anywhere else previously.

### Cancel on disconnect <Anchor :ids="['tc.KRAKEN.cod']" />

A flag that controls automatic order cancellation by the exchange when the connection between the exchange and the robot is lost.

### Bind IP <Anchor :ids="['tc.KRAKEN.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BITFINEX

The robot supports only connections based on Websocket and REST API. The transactional connection uses two distinct API key pairs, which must be different. Market data connection is activated as described in the [Settin up connections](getting-started.md#настройка-подключений) section. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BITFINEX.name']" />

A field for specifying the connection name. This value is set for user convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters `_ a-z A-Z 0-9`

### Margin account <Anchor :ids="['tc.BITFINEX.margin']" />

Indicates that your account is a margin account.

### API key#0 <Anchor :ids="['tc.BITFINEX.api_key']" />

First public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### API key secret#0 <Anchor :ids="['tc.BITFINEX.secret_key_part']" />

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### API key#1 <Anchor :ids="['tc.BITFINEX.rest_api_key']" />

Second public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### API key secret#1 <Anchor :ids="['tc.BITFINEX.rest_secret_key_part']" />

Second secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in the settings under the API section. All possible read and write permissions should be enabled for this key. The key must be new and not used anywhere else previously.

### Bind IP <Anchor :ids="['tc.BITFINEX.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## HitBTC

The robot supports only connection to the HitBTC exchange's Spot section via Websocket and REST API. Market data connection is activated as described in the [Setting up connection](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.HITBTC.name']" />

A field for specifying the connection name. This value is set for user convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters `_ a-z A-Z 0-9`

### API Key <Anchor :ids="['tc.HITBTC.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the API keys section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

### Secret <Anchor :ids="['tc.HITBTC.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the API keys section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

### Bind IP <Anchor :ids="['tc.HITBTC.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BITMEX

Connection to the BitMEX exchange's futures market. The robot supports only Websocket and REST API connections. The transactional connection uses two distinct API key pairs, which must be different. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BITMEX.name']" />

A field for specifying the connection name. This value is set for user convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters `_ a-z A-Z 0-9`

### ID#0 <Anchor :ids="['tc.BITMEX.ws_id']" />

First public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### Secret#0 <Anchor :ids="['tc.BITMEX.ws_secret_part']" />

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### ID#1 <Anchor :ids="['tc.BITMEX.add_id']" />

Second public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### Secret#1 <Anchor :ids="['tc.BITMEX.add_secret_part']" />

Second secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API Keys section. The "Order" permission must be enabled for this key. The key must be new and not used anywhere else previously.

### Bind IP <Anchor :ids="['tc.BITMEX.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BINANCE

Connection to Binance exchange's Spot market in either Spot or Margin mode. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BINANCE.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Account type <Anchor :ids="['tc.BINANCE.account_type']" />

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### Margin account <Anchor :ids="['tc.BINANCE.margin']" />

Indicates that your account is a margin account. If enabling this flag, ensure your API key has the "Enable Margin" permission. This parameter is available only when `Account type = PORTOFLIO MARGIN`.

### API Key <Anchor :ids="['tc.BINANCE.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading". For margin trading, the "Enable Margin" permission should also be enabled. The key must be new and not used anywhere else previously.

### Secret <Anchor :ids="['tc.BINANCE.ws_secret_part']" />

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading". For margin trading, the "Enable Margin" permission should also be enabled. The key must be new and not used anywhere else previously.

### Bind IP <Anchor :ids="['tc.BINANCE.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BINANCEFUT

Connection to Binance exchange's USD-M Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BINANCEFUT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Account type <Anchor :ids="['tc.BINANCEFUT.account_type']" />

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### Conn type <Anchor :ids="['tc.BINANCEFUT.conn_type']" />

Connection type selection. If there are no special arrangements with the exchange for direct connectivity, select REGULAR. If you have such an arrangement, contact support in advance to obtain the server IP address from which trading will occur; then, when creating the connection, choose one of the WHITELIST options.

### API Key <Anchor :ids="['tc.BINANCEFUT.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" и "Enable Future".

### Secret <Anchor :ids="['tc.BINANCEFUT.ws_secret_part']" />

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" и "Enable Future".

### Bind IP <Anchor :ids="['tc.BINANCEFUT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

### Описание потоков подключений BINANCEFUT

`binancefut_listen` - full-featured connection with order book. 

`binancefut_listen_0ms` - full-featured connection with order book using 0ms aggregation (since 0ms aggregation is NOT documented, use at your own risk).

`binancefut_listen_top` - full-featured connection without the order book, providing only best bid and ask prices (`top of book`) with fast updates.

**Important:**

- A "full-featured" connection means that enabling just this single stream is sufficient for the robot to operate properly.
- It is strongly NOT recommended to enable both `top of book` and order book streams simultaneously in the same robot, as they are NOT synchronized and may cause various side effects (such as trading based on stale prices — where prices in the `top of book` stream differ from those in the order book). 
- Note that the above is a recommendation, not a strict prohibition.

## BINANCECM

Connection to Binance exchange's COIN-M Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connection](getting-started.md#настройка-подключений). Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BINANCECM.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Account type <Anchor :ids="['tc.BINANCECM.account_type']" />

Account type selection. Options are `CLASSIC` and `PORTOFLIO MARGIN`. Detailed descriptions of these modes can be found on the Binance exchange website.

### Conn type <Anchor :ids="['tc.BINANCECM.conn_type']" />

Connection type selection. If there are no special arrangements with the exchange for direct connectivity, select REGULAR. If you have such an arrangement, contact support in advance to obtain the server IP address from which trading will occur; then, when creating the connection, choose one of the WHITELIST options.

### API Key <Anchor :ids="['tc.BINANCECM.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" and "Enable Future".

### Secret <Anchor :ids="['tc.BINANCECM.ws_secret_part']" />

First secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under API Management. The following permissions should be enabled: "Read Info", "Enable Trading" and "Enable Future".

### Bind IP <Anchor :ids="['tc.BINANCECM.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

### Описание потоков подключений BINANCECM

`binancecm_listen` - full-featured connection with order book. 

`binancecm_listen_0ms` - full-featured connection with order book using 0ms aggregation (since 0ms aggregation is NOT documented, use at your own risk).

`binancecm_listen_top` -  full-featured connection without the order book, providing only best bid and ask prices (`top of book`) with fast updates.

**Important:**

- A "full-featured" connection means that enabling just this single stream is sufficient for the robot to operate properly.
- It is strongly NOT recommended to enable both `top of book` and order book streams simultaneously in the same robot, as they are NOT synchronized and may cause various side effects (such as trading based on stale prices — where prices in the `top of book` stream differ from those in the order book). 
- Note that the above is a recommendation, not a strict prohibition.

## DERIBIT

The robot supports only Websocket API connections. There are two ways to add a market data connection:

1. Public market data connection — activated as described in the [Setting up connections](getting-started.md#настройка-подключений);
2. If you are creating a transactional connection, you can set the [Create fast data connection](creating-connection.md#create-fast-data-connection) flag, In this case, a market data connection will be created using the same credentials as the transactional connection. The market data connection created via the second method will react slightly faster to market changes. Additionally, such a paired connection can only be activated or deactivated together with the transactional connection. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.DERIBIT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Server <Anchor :ids="['tc.DERIBIT.url']" />

Select between live and test environments. By default, the connection is created to the live environment.

### Access Key <Anchor :ids="['tc.DERIBIT.username']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the API section. For this key, set permission "read_write" in the Trade field and "read" for all other fields.

### Access secret <Anchor :ids="['tc.DERIBIT.password_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the API section. For this key, set permission "read_write" in the Trade field and "read" for all other fields.

### Create fast data connection <Anchor :ids="['tc.DERIBIT.create_listen']" />

Set this flag if you want to create a fast market data connection using the same key pair as the transactional connection.

### Bind IP <Anchor :ids="['tc.DERIBIT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## OKX

Connection to OKX exchange platforms: SPOT, SWAP, FUTURES, OPTION, in cross, isolated, and cash modes. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.OKEX.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Conn type <Anchor :ids="['tc.OKEX.conn_type']" />

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### API Key <Anchor :ids="['tc.OKEX.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the API section. Permissions for reading and trading must be enabled. The "Order placement mode" field must be set to "Net". The key must be new and not used anywhere else previously.

### Secret Key <Anchor :ids="['tc.OKEX.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the API section. Permissions for reading and trading must be enabled. The "Order placement mode" field must be set to "Net". The key must be new and not used anywhere else previously.

### Password <Anchor :ids="['tc.OKEX.passphrase']" />

Password for accessing the exchange.

### Bind IP <Anchor :ids="['tc.OKEX.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BEQUANT

The robot supports BEQUANT connections via both Websocket/REST API and FIX protocol. Public market data connection via Websocket and REST API is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chaper. When creating a transactional connection, you can select which connection type to use. Adding a transactional FIX connection creates two FIX connections: market data and transactional. Such a pair can only be activated or deactivated together — attempting to deactivate the market data connection will also deactivate the transactional one, and vice versa. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BEQUANT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Conn type <Anchor :ids="['tc.BEQUANT.conn_type']" />

Connection type. Available options are FIX and WEBSOCKET. The WEBSOCKET connection can use keys generated by the user in the exchange's personal account. The FIX connection requires contacting exchange support to obtain access.

#### Поля для подключения FIX

The FIX connection requires establishing a VPN connection; therefore, contact support before adding the connection and provide the required VPN parameters.

##### Server <Anchor :ids="['tc.BEQUANT.ip']" />

Select the server to connect to. If the required address is not in the list, contact support.

##### Exchange account id <Anchor :ids="['tc.BEQUANT.exchange_account_id']" />

User identifier on the exchange. Can be found in the user’s personal account or requested from exchange support. Enter only the identifier itself, without prefixes such a "login_", "user_" etc.

##### Password <Anchor :ids="['tc.BEQUANT.password']" />

Password for the FIX connection. Provided by the exchange along with other FIX connection parameters.

#### Поля для подключения WEBSOCKET

##### API <Anchor :ids="['tc.BEQUANT.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in account settings under the "API keys" section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

##### Secret <Anchor :ids="['tc.BEQUANT.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in account settings under the "API keys" section. The following permissions should be enabled: "Order book, History, Trading balance", "Place/cancel orders", "Payment information". The key must be new and not used anywhere else previously.

### Bind IP <Anchor :ids="['tc.BEQUANT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## KRAKENFUT

Connection to Kraken exchange's Futures market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.KRAKENFUT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Conn type <Anchor :ids="['tc.KRAKENFUT.conn_type']" />

Select the connection type. If there are no special arrangements with the exchange for direct connectivity, choose REGULAR. If you have such an arrangement, contact support in advance to obtain the server IP address from which trading will occur, then select DIRECT when creating the connection.

### API Key <Anchor :ids="['tc.KRAKENFUT.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located in settings under the API section. Access level must be set to "Full access". The key must be new and not used anywhere else previously.

### Secret <Anchor :ids="['tc.KRAKENFUT.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located in settings under the API section. Access level must be set to "Full access". The key must be new and not used anywhere else previously.

### Cancel on disconnect <Anchor :ids="['tc.KRAKENFUT.cod']" />

Flag that controls automatic order cancellation by the exchange upon disconnection between the exchange and the robot.

### Bind IP <Anchor :ids="['tc.KRAKENFUT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## KUCOIN

The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.KUCOIN.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Passphrase <Anchor :ids="['tc.KUCOIN.passphrase']" />

Password phrase for accessing the exchange.

### Key <Anchor :ids="['tc.KUCOIN.api_key']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Secret <Anchor :ids="['tc.KUCOIN.secret_key_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.KUCOIN.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## HUOBI

Connection to the Spot market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.HUOBI.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Server <Anchor :ids="['tc.HUOBI.api_url ws_url']" />

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the option api-aws.huobi.pro

### Access Key <Anchor :ids="['tc.HUOBI.api_key']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Secret Key <Anchor :ids="['tc.HUOBI.secret_key_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.HUOBI.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## HUOBIFUT

Connection to the Coin-M Futures market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений)chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.HUOBIFUT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Server <Anchor :ids="['tc.HUOBIFUT.url']" />

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### Access Key <Anchor :ids="['tc.HUOBIFUT.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Secret Key <Anchor :ids="['tc.HUOBIFUT.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.HUOBIFUT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## HUOBIFUTCM

Connection to the Coin-M Swaps market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений)chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.HUOBIFUTCM.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Server <Anchor :ids="['tc.HUOBIFUTCM.url']" />

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### Access Key <Anchor :ids="['tc.HUOBIFUTCM.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Secret Key <Anchor :ids="['tc.HUOBIFUTCM.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.HUOBIFUTCM.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## HUOBIFUTUM

Connection to the USDT-M market of Huobi Global exchange. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.HUOBIFUTUM.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Server <Anchor :ids="['tc.HUOBIFUTUM.url']" />

Select the server to connect to. If you plan to trade from a server hosted on AWS, choose the AMAZON option.

### Access Key <Anchor :ids="['tc.HUOBIFUTUM.ws_id']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Secret Key <Anchor :ids="['tc.HUOBIFUTUM.ws_secret_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.HUOBIFUTUM.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## VIKINGTRADE

The robot supports only Websocket API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.VIKINGTRADE.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Conn type <Anchor :ids="['tc.VIKINGTRADE.conn_type']" />

Select between live and test environments. By default, the connection is created to the live environment.

### Public key id <Anchor :ids="['tc.VIKINGTRADE.api_key']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Located under Account → API. When creating the key, trading permission must be enabled.

### Access secret <Anchor :ids="['tc.VIKINGTRADE.password_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Located under Account → API. When creating the key, trading permission must be enabled.

### Bind IP <Anchor :ids="['tc.VIKINGTRADE.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BYBIT

Connection to Bybit exchange markets: Inverse Perpetual, USDT Perpetual, and Inverse Futures. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BYBIT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Public key id <Anchor :ids="['tc.BYBIT.api_key']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Access secret <Anchor :ids="['tc.BYBIT.secret_key_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.BYBIT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## BYBITSPOT

Connection to Bybit exchange's Spot market. The robot supports only Websocket and REST API connections. Market data connection is activated as described in the [Setting up connections](getting-started.md#настройка-подключений) chapter. Transactional connection parameters are described below.

### Name <Anchor :ids="['tc.BYBITSPOT.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`

### Public key id <Anchor :ids="['tc.BYBITSPOT.api_key']" />

Public API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding secret key. Usually located under Settings → Security → API.

### Access secret <Anchor :ids="['tc.BYBITSPOT.secret_key_part']" />

Secret API key for accessing the exchange API. Created in the user account on the exchange website together with the corresponding public key. Usually located under Settings → Security → API.

### Bind IP <Anchor :ids="['tc.BYBITSPOT.bind_ip']" />

If the agreement does not require connection from a fixed IP address, set the value to `Automatic`. Otherwise, contact support to confirm the server address. The address specified in this field should not be provided to the exchange as the server address.

## CTRADER

The robot supports only FIX connections to the cTrader broker. When adding a transactional connection, two FIX connections are created: market data and transactional. Such a pair can be activated or deactivated only together — attempting to deactivate the market data connection will also deactivate the corresponding transactional connection, and vice versa.

### Name <Anchor :ids="['tc.CTRADER.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### Conn type <Anchor :ids="['tc.CTRADER.conn_type']" />

Selects the server to which the connection will be established. All servers are identical in terms of protocol and provided information. The difference lies only in their geographical location.

### SenderCompID <Anchor :ids="['tc.CTRADER.sender_comp_id']" />

Unique client identifier, provided by the broker.

### Login <Anchor :ids="['tc.CTRADER.login']" />

cTrader account number.

### Password (trade) <Anchor :ids="['tc.CTRADER.password']" />

Password for both trading and market data FIX connections; matches the password of the cTrader account.

### Try to use only one position for one instrument <Anchor :ids="['tc.CTRADER.one_pos']" />

A flag that, when enabled, prevents the robot from placing more than one order per instrument if no open position exists. As soon as this order is executed and an open position is created, all restrictions on placing further orders for that instrument are lifted.

### Bind IP <Anchor :ids="['tc.EXANTE.bind_ip']" />

To obtain the correct IP address, please contact support. The address entered in this field should not be provided to the exchange as a server address.

## IMEX

### Market Data (binary protocol)

The market data connection consists of several data streams. You can activate only the streams you need and disable the unnecessary ones.
If an instrument's name starts with IMEX_MM_, it represents IMEX liquidity only (orders and trades directly from IMEX exchange). If the name starts with IMEX_AGGR_, it represents aggregated liquidity from various exchanges. If the instrument name starts with IMEX_OKX_, it represents liquidity from OKX exchange.

#### Definitions

Instrument definition stream. To ensure proper operation of the connection, this stream must be set to "Enable" status. In addition to instrument definitions, trading statuses and price limits are also transmitted through this stream.

#### Top of book

Best bid and ask prices stream. We recommend NOT enabling it simultaneously with the Orderbook stream.

#### Orderbook

Order book stream. We recommend NOT enabling it simultaneously with the Top of book stream.

### Транзакционный шлюз бинарного протокола

Make sure you ordered a binary, not a FIX login. Only one active connection is allowed per login.

#### Name <Anchor :ids="['tc.IMEX.name']" />

A field for specifying the connection name. This value is set for convenience, to make it easier to identify the connection within the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

#### Login <Anchor :ids="['tc.IMEX.login']" />

Login for accessing the exchange, taken from the exchange agreement.

#### Password  <Anchor :ids="['tc.IMEX.password']" />

Password for accessing the exchange, taken from the exchange agreement.

#### Trading account(s) <Anchor :ids="['tc.IMEX.account']" />

Trading account, taken from the exchange agreement. Multiple accounts can be added, separated by commas.

#### Member ID <Anchor :ids="['tc.IMEX.member_id']" />

Participant identifier; defaults to 0. If this value does not work, clarify with the exchange.

#### IMEX comment <Anchor :ids="['tc.IMEX.comment']" />

Text comment added to every order submitted via this connection.

#### Client ID <Anchor :ids="['tc.IMEX.client_id']" />

Client code identifier, taken from the exchange agreement.

#### Market ID  <Anchor :ids="['tc.IMEX.market_id']" />

Used for routing orders to the appropriate liquidity pool; the correct value should be clarified with the exchange.

#### Prime exchange  <Anchor :ids="['tc.IMEX.prime_exchange']" />

Used for routing orders to the appropriate liquidity pool; the correct value should be clarified with the exchange.

#### Comment <Anchor :ids="['tc.IMEX.comment']" />

Client comment for orders.

#### Bind IP <Anchor :ids="['tc.IMEX.bind_ip']" />

The IP address from which the connection to the exchange will be established. The IP address must be specified in the agreement.

## J2T

The robot supports only FIX connectivity to the broker JUST2TRADE.

### Name <Anchor :ids="['tc.J2T.name']" />

A field for setting the connection name. This value is set for convenience, to make it easier to identify the connection in the list of transactional connections. Allowed characters: `_ a-z A-Z 0-9`.

### Server <Anchor :ids="['tc.J2T.conn_type']" />

Selects the server to which the connection will be established. Currently, only one server is available.

### SenderCompID <Anchor :ids="['tc.J2T.sender_comp_id']" />

The client's unique identifier, provided by the broker. The broker JUST2TRADE confuses the FIX protocol fields `SenderCompID` and `TargetCompID`. Therefore, from the two fields provided by the broker (`SenderCompID` and `TargetCompID`), you must use the one whose value is different from `J2TT`.

### Login <Anchor :ids="['tc.J2T.login']" />

The client account name for JUST2TRADE.

### Password <Anchor :ids="['tc.J2T.password']" />

Password for the trading FIX connection; may be the same as the JUST2TRADE account password.

### Use SSL/TLS <Anchor :ids="['tc.J2T.secure']" />

A flag indicating whether SSL/TLS encryption should be used. Information about whether encryption is enabled for a given login is provided by the broker.

### Bind IP <Anchor :ids="['tc.J2T.bind_ip']" />

To clarify the IP address, please contact support. The address specified in this field should not be provided to the exchange as the server address.

## SPIMEX

Description is under development

## LMAX

Description is under development
