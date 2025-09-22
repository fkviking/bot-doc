---
title: 9. Ошибки выставления, снятия и изменения заявок
section: 9
---

# Ошибки выставления, снятия и изменения заявок <Anchor :ids="['errors']" />

## Общие положения <Anchor :ids="['errors.general']" />

Во время работы робота могут возникать ошибки при выставлении, перемещении и снятии заявок. Такие ошибки сами по себе не являются показателем неправильной работы робота. Это штатное поведение.
Ошибки, отображаемые пользователю могут быть трансляцией сообщений от биржи или результатом проверки, выполненной в самом роботе. Так, часть проверок, аналогичных проверкам на бирже, робот выполняет на своей стороне,
не отправляя на биржу те приказы, которые заведомо будут отклонены. Если приказ не прошел проверку на стороне робота (и на биржу не отправлялся), то к причине ошибки добавляется постфикс `LOCAL`, например, `REASON_FLOOD_LOCAL`. 
Все ошибки, не имеющие постфикса `LOCAL` являются ответом биржи на попытку выставления, снятия или изменения заявки, робот лишь транслирует пользователю полученные от биржи сообщения.

Ошибки снятия заявки чаще всего возникают тогда, когда после отправления приказа на снятие заявки и до обработки этого приказа биржей, заявка успевает пройти в сделку.

## Категоризация ошибок <Anchor :ids="['errors.categories']" />

Все ошибки выставления, снятия и переставления заявок, получаемые с биржи или генерируемые самим роботом, классифицируются на несколько категорий для удобства их обработки (например, на Московской бирже есть более десяти различных кодов ошибок, суть которых сводится к тому, что у клиента не хватает денег для выставления заявки). Далее будут рассмотрены категории ошибок выставления и переставления заявок.

- **Ошибка:** `Order adding error on *, error: REASON_NO_MONEY`<Anchor :ids="['error.no_money']" />

    **Описание:** Нехватка денег на счете. Такая ошибка всегда является ответом биржи, варианта ошибки с постфиксом `LOCAL` не существует, так как робот не следит за счётом клиента и не проверяет достаточность суммы на счёте для выставления заявки. В данную группу ошибок попадают ошибки с разными текстами сообщений от биржи, например, `Account has insufficient Available Balance`, `Value of position and orders exceeds position Risk Limit` и т.д. Сообщение или код ошибки, непосредственно присланные биржей, вы можете найти в в виджетах [Robot logs](interface.md#robot_logs) [Robot logs history](interface.md#) графического интерфейса платформы. Для рынков Московской биржи значения биржевых кодов ошибок можно посмотреть [тут](order-error.md#errors.codes) При получении такой ошибки следует проверить достаточно ли денег на счете для выставления заявки по данному финансовому инструменту данного объема, если денег на счёте достаточно, то для получения комментариев по ситуации следует обращаться к старшему трейдеру, брокеру или бирже. При получении такой ошибки торговля будет остановлена автоматически.

- **Ошибка:** `order adding error on *, continue trading, error: REASON_FLOOD`<Anchor :ids="['error.flood']" />

    **Описание:** Флуд-контроль, превышен лимит максимально разрешенного количества транзакций (приказов на выставление/переставление/снятие заявок) в единицу временни для данного логина или биржа прислала сообщение в
    духе `Биржа перегружена, попробуйте позже` или некоторые другие сообщения от биржи, которые говорят о том, что биржа сейчас испытывает некоторые трудности, но в принципе работает. Для данного робота
    совершить `30` транзакций в секунду (единица транзакционной активности Московской биржи, принятая на текущий момент) - это элементарно. Ошибка бывает как в варианте с постфиксом `LOCAL`, так и без него.

    Стоит понимать, что робот копит некую очередь сообщений о транзакциях прежде чем передать их в лог на сайте. Есть некий лаг во времени, между событием и отображением информации о нем в логе.
    Наличие флуда, это скорее общий признак избыточной активности. Именно на нее стоит обращать внимание, т.к. она не даст торговать в "нужный момент", если производительность логина исчерпана непродуктивными
    транзакциями в каждый момент времени.

- **Ошибка:** `order adding error on *, error: REASON_UNDEFINED`<Anchor :ids="['error.undefined']" />

    **Описание:** Вы получите эту ошибку в том случае, если ошибка выставления заявки, которую присылает биржа, никак не классифицирована роботом. Такая ошибка всегда является ответом биржи, варианта ошибки с постфиксом `LOCAL` не существует в связи с самим определением данной категории ошибок. В случае данной
    ошибки в лог графической части робота приходит сообщение, которое прислала биржа, читайте его внимательнее. Если вы понимаете что данное сообщение должно быть как-то конкретно обработано роботом, например,
    как `REASON_FLOOD` или `REASON_NO_MONEY`, то напишите в поддержку.При получении такой ошибки торговля будет остановлена автоматически.

- **Ошибка:** `order adding error on *, continue trading, error: REASON_PRICE_WRONG`<Anchor :ids="['error.price_wrong']" />

    **Описание:** Данная ошибка в общем смысле означает ошибочность цены, указанной в заявке. В эту категорию попадают как заявки, цена которых находится вне лимита цен, установленного биржей, так и заявки с флагом [Only maker](params-description.md#p.maker) с ценой, соответствующей противоположной стороне торгового стакана. Цены финансовых инструментов в некоторых случаях рассчитываются и зависят от ваших настроек, поэтому, возможно, при получении подобной ошибки следует поменять настройки портфеля. Ошибка бывает как в варианте с постфиксом `LOCAL`, так и без него. Локальная проверка проводится только на соответствие лимитам цен, проверить на стороне робота, будет ли заявка после выставления только пассивной, возможным не представляется.

- **Ошибка:** `order adding error on *, continue trading, error: REASON_CROSS`<Anchor :ids="['error.cross']" />

    **Описание:** Данная ошибка возникает когда вы пытаетесь торговать сами с собой или с другими трейдерами/роботами, торгующими на том же счёте и/или ИНН. Такая ошибка всегда является ответом биржи, варианта ошибки с постфиксом `LOCAL` не существует в связи с самим определением данной категории ошибок. При возникновении данной ошибки на инструменте первой ноги, заявка не выставится, робот продолжит работу по алгоритму.
    При возникновении данной ошибки на инструментах второй ноги, робот попробует выставить заявку снова по новой цене, сместившись на один шаг цены вглубь своей стороны стакана, при этом в рамках
    переставления одной заявки может быть совершено не более `100` попыток выставления, закончившихся ошибкой `REASON_CROSS`, если этот лимит достигнут, то заявка выставлена не будет.

- **Ошибка:** `order adding error on *, continue trading, error: REASON_ZERO_AMOUNT_TO_MULTIPLE`<Anchor :ids="['error.zero_amount_to_multiple']" />

    **Описание:** Для некоторых бирж (к примеру Deribit) объем заявки должен быть кратным размеру лота. Перед выставлением заявки происходит округление объёма до целого числа лотов. Округление всегда
    происходит в меньшую сторону. Если объем выставляемой заявки меньше размера лота, то после округления объём выставляемой заявки будет равен нулю, робот видит это и возвращает ошибку. Для предотвращения
    подобных ошибок можно установить [Overlay](/docs/params-description.html#p.overlay) равным единице и выше. Такая ошибка бывает только в варианте с постфиксом `LOCAL`.
    
- **Ошибка:** `order adding error on *, continue trading, error: REASON_NO_SESSION`<Anchor :ids="['error.no_session']" />

    **Описание:** Данная ошибка означает, что торговая сессия по инструменту не идёт. Ошибка бывает как в варианте с постфиксом `LOCAL`, так и без него.

- **Ошибка:** `order adding error on *, error: REASON_TEMPORARY_PROHIBITED_LOCAL, original err_code=666666`<Anchor :ids="['error.temporary_prohibited']" />

    **Описание:** Данная ошибка обязательно c `err_code=666666` означает, что выставление заявок временно недоступно, т.к. превышен дневной лимит виртуальных сделок, совершенных роботом.

**ВАЖНО!** 

Если в логе есть `Stop trading!!!` при наличии ошибки выставления заявки, то если ошибка была именно на не [Is first](params-description.md#s.is_first) финансовом инструменте, то включается поведение аналогичное `hard stop`,
т.е. робот будет пытаться снять вообще все заявки по данному портфелю и не выставлять новые по всем финансовым инструментам.


## Коды ошибок <Anchor :ids="['errors.codes']" />

### MOEX FORTS

Актуальный справочник кодов ошибок для Срочного рынка находится в открытом доступе на ftp Московской биржи. Ознакомиться можно по [ссылке](http://ftp.moex.ru/pub/TWIME/Spectra/prod/doc/spectra_twime_ru.pdf)

**MOEX SPECTRA ERRORS**  
-1 Error performing operation.  
0 Operation successful.  
1 User not found.  
2 Brokerage Firm code not found.  
3 Session inactive.  
4 Session halted.  
5 Error performing operation.  
6 Insufficient rights to perform operation.  
7 Cannot perform operation: incorrect Clearing Firm account.  
8 Insufficient rights to perform order deletion.  
9 Operations with orders are blocked for the firm by the Clearing Administrator.  
10 Insufficient funds to reserve.  
12 Options premium exceeds the limit allowed.  
13 Total amount of positions exceeds the market limit.  
14 Order not found.  
25 Unable to add order: prohibited by the Trading Administrator.  
26 Unable to open position: prohibited by Trading Administrator.  
27 Unable to open short position: prohibited by Trading Administrator.  
28 Unable to perform operation: insufficient rights.  
31 Matching order for the same account/ITN is not allowed.  
32 Trade price exceeds the limit allowed.  
33 Operations with orders are blocked for this firm by the Clearing Administrator.  
34 Cannot perform operation: wrong client code.  
35 Invalid input parameters.  
36 Cannot perform operation: wrong underlying.  
37 Multi-leg orders cannot be moved.  
38 Negotiated orders cannot be moved.  
39 Price is not a multiple of the tick size.  
40 Unable to add Negotiated order: counterparty not found.  
41 User's trading rights have expired or are not valid yet.  
42 Operations are prohibited by Chief Trader of Clearing Firm.  
43 The 'Lock Mode' flag is not set by the Trading Administrator.  
44 Clearing Firm's Chief Trader flag not found for this firm.  
45 Unable to add Negotiated orders: no RTS code found for this firm.  
46 Only Negotiated orders are allowed for this security.  
47 There was no trading in this security during the session specified.  
48 This security is being delivered. Only Negotiated orders from all Brokerage Firms within the same Clearing Firm are allowed.  
49 Unable to add Negotiated order: a firm code must be specified.  
50 Order not found.  
53 Error setting input parameter: amount too large.  
54 Unable to perform operation: exceeded operations quota for this client.  
55 File not found.  
56 Unable to perform operations using this login/code pair: insufficient rights. Please contact the Trading Administrator.  
57 Unable to connect to the Exchange server: insufficient rights. Please contact the Trading Administrator.  
58 Unable to add orders without verifying client funds sufficiency: insufficient rights.  
60 Auction halted for all risk-netting instruments.  
61 Trading halted in all risk-netting instruments.  
62 Trading halted on the MOEX Derivatives Market.  
63 Auction halted in all risk-netting instruments with this underlying.  
64 Trading halted in all risk-netting instruments with this underlying.  
65 Trading halted on all boards in all securities with this underlying.  
66 Trading halted in this risk-netting instrument.  
67 Unable to open positions in this risk-netting instrument: prohibited by the Trading Administrator.  
68 Unable to add orders for all risk-netting instruments: prohibited by the Brokerage Firm.  
69 Unable to add orders for all risk-netting instruments: prohibited by the Chief Trader.  
70 Trading operation is not supported.  
71 Position size exceeds the allowable limit.  
72 Order is being moved.  
73 Aggregated buy order quantity exceeds the allowable limit.  
74 Aggregated sell order quantity exceeds the allowable limit.  
75 Non-trading operation was unsuccessful due to timeout.  
76 No record to delete.  
200 Collateral calculation parameters are being changed by the Trading Administrator.  
201 Collateral calculation parameters are being changed by the Trading Administrator.  
202 Collateral calculation parameters are being changed by the Trading Administrator.  
203 Collateral calculation parameters are being changed by the Trading Administrator.  
204 Collateral calculation parameters are being changed by the Trading Administrator.  
205 Collateral calculation parameters are being changed by the Trading Administrator.  
206 Collateral calculation parameters are being changed by the Trading Administrator.  
207 Collateral calculation parameters are being changed by the Trading Administrator.  
208 Collateral calculation parameters are being changed by the Trading Administrator.  
209 Collateral calculation parameters are being changed by the Trading Administrator.  
210 Collateral calculation parameters are being changed by the Trading Administrator.  
211 Collateral calculation parameters are being changed by the Trading Administrator.  
212 Collateral calculation parameters are being changed by the Trading Administrator.  
213 Collateral calculation parameters are being changed by the Trading Administrator.  
214 Collateral calculation parameters are being changed by the Trading Administrator.  
215 Collateral calculation parameters are being changed by the Trading Administrator.  
216 Collateral calculation parameters are being changed by the Trading Administrator.  
217 Collateral calculation parameters are being changed by the Trading Administrator.  
218 Collateral calculation parameters are being changed by the Trading Administrator.  
219 Collateral calculation parameters are being changed by the Trading Administrator.  
220 Collateral calculation parameters are being changed by the Trading Administrator.  
221 Collateral calculation parameters are being changed by the Trading Administrator.  
222 Collateral calculation parameters are being changed by the Trading Administrator.  
223 Collateral calculation parameters are being changed by the Trading Administrator.  
224 Collateral calculation parameters are being changed by the Trading Administrator.  
225 Collateral calculation parameters are being changed by the Trading Administrator.  
226 Collateral calculation parameters are being changed by the Trading Administrator.  
227 Collateral calculation parameters are being changed by the Trading Administrator.  
228 Collateral calculation parameters are being changed by the Trading Administrator.  
229 Collateral calculation parameters are being changed by the Trading Administrator.  
230 Code value not found.  
231 Bad 'num' sequence for code.  
232 There are no any futures data for code.  
233 There are no any key point for code.  
234 'minstep' parameter is 0 for code.  
235 'code' and 'num' values not found.  
236 No calculation result.  
237 fortsFutRisks library is not inited.  
238 settlement_price_last_clearing param is null for code.  
239 No spot for code.  
240 Market data params is incorrect for code.  
241 Collateral calculation parameters are being changed by the Trading Administrator.  
242 Collateral calculation parameters are being changed by the Trading Administrator.  
243 Collateral calculation parameters are being changed by the Trading Administrator.  
244 Collateral calculation parameters are being changed by the Trading Administrator.  
245 Collateral calculation parameters are being changed by the Trading Administrator.  
246 Collateral calculation parameters are being changed by the Trading Administrator.  
247 Collateral calculation parameters are being changed by the Trading Administrator.  
248 Collateral calculation parameters are being changed by the Trading Administrator.  
249 Collateral calculation parameters are being changed by the Trading Administrator.  
250 Collateral calculation parameters are being changed by the Trading Administrator.  
310 Unable to add order: prohibited by Clearing Administrator.  
311 Unable to open position: prohibited by Clearing Administrator.  
312 Unable to open short position: prohibited by Clearing Administrator.  
314 Unable to add orders in the client account: prohibited by the Trader.  
315 Unable to open position in the client account: prohibited by the Trader.  
316 Unable to open short position in the client account: prohibited by the Trader.  
317 Amount of buy/sell orders exceeds the limit allowed.  
318 Unable to add order for the client account: client does not have a deposit account for settlement of Money Market securities. Prohibited by Clearing Administrator.  
320 Amount of active orders exceeds the limit allowed for the client account for this security.  
331 Insufficient funds in the Settlement Account.  
332 Insufficient client funds.  
333 Insufficient Brokerage Firm funds.  
334 Insufficient Clearing Firm funds.  
335 Unable to buy: amount of securities exceeds the limit set for the client.  
336 Unable to buy: amount of securities exceeds the limit set for the Brokerage Firm.  
337 Unable to sell: amount of securities exceeds the limit set for the client.  
338 Unable to sell: amount of securities exceeds the limit set for the Brokerage Firm.  
339 Collateral recalculation in progress.  
380 Trading restricted while intraday clearing is in progress.  
381 Trading restricted while intraday clearing is in progress: cannot delete orders.  
382 Trading restricted while intraday clearing is in progress: cannot move orders.  
383 Non-trading operations restricted while intraday clearing is in progress.  
400 Incorrect request.  
401 Not authorized.  
403 Restricted. Client is not permitted to execute request.  
404 Not Found.  
405 Method is not supported.  
407 Proxy server authentication required.  
409 Conflict detected.  
415 Data type is not supported.  
422 Incorrect document body.  
500 Internal server error.  
501 Request is not implemented.  
600 Incorrect date of request.  
601 Outcoming number uniqueness violation.  
602 Unsupported request type.  
603 Incorrect UNICODE.  
680 Insufficient client funds.  
681 Insufficient Clearing Firm funds.  
682 Insufficient funds to increase position.  
2000 Unable to create SMA login: SMA login must be either of client login, or of Brokerage Firm login.  
2001 Unable to create SMA login: SMA logins must belong to trading participants.  
2002 Unable to add orders using this SMA login: the MASTER login does not belong to trading participants.  
4000 Invalid input parameters.  
4001 Unable to perform operation: insufficient rights.  
4002 Unable to change trading limit for the client: no active trading sessions.  
4004 Unable to change trading limit for the client: client code not found.  
4005 Unable to change the trading limit for the client: insufficient funds.  
4006 Unable to set trading limit for the client: error performing operation.  
4007 Unable to set trading limit for the client: error performing operation.  
4008 Unable to set trading limit for the client: error performing operation.  
4009 Unable to set trading limit for the client: error performing operation.  
4010 Unable to set trading limit for the client: error performing operation.  
4011 Unable to set trading limit for the client: error performing operation.  
4012 Unable to set trading limit for the client: error performing operation.  
4013 Unable to set trading limit for the client: error performing operation.  
4014 Unable to change parameters: no active trading sessions.  
4015 Unable to change parameters: client code not found.  
4016 Unable to change parameters: underlying's code not found.  
4017 Unable to set trading limit for the client: amount too large.  
4018 Collateral calculation parameters are being changed by the Trading Administrator.  
4019 Initial margin: error setting contract parameters.  
4020 Transaction is already active.  
4021 Unable to set requested amount of pledged funds for Clearing Firm: insufficient amount of free funds.  
4022 Unable to set requested amount of funds for Clearing Firm: insufficient amount of free funds.  
4023 Unable to change trading limit for the Brokerage Firm: no active trading sessions.  
4024 Unable to change trading limit for the Brokerage Firm: the Brokerage Firm is not registered for trading.  
4025 Unable to set requested amount of pledged funds for the Brokerage Firm: insufficient amount of free funds in the Clearing Firm.  
4026 Unable to set requested amount of funds for the Brokerage Firm: insufficient amount of free funds in the balance of the Separate Account.  
4027 Unable to set requested amount of pledged funds for the Clearing Firm: insufficient amount of pledged funds in the balance of the Separate Account.  
4028 Unable to set requested amount of funds for the Brokerage Firm: insufficient amount of free funds in the Clearing Firm.  
4030 Unable to change parameters for the Brokerage Firm: no active sessions.  
4031 Unable to change parameters for the Brokerage Firm: Brokerage Firm code not found.  
4032 Unable to change parameters for the Brokerage Firm: underlying's code not found.  
4033 Unable to change parameters for the Brokerage Firm: insufficient rights to trade this underlying.  
4034 Transfer of pledged funds from the Separate Account is prohibited.  
4035 Transfer of collateral is prohibited.  
4040 Unable to change Brokerage Firm limit on risk-netting: no active sessions.  
4041 Unable to change Brokerage Firm limit on risk-netting: Brokerage Firm is not registered for trading.  
4042 Unable to change Brokerage Firm limit on risk-netting: Brokerage Firm code not found.  
4043 Unable to change Brokerage Firm limit on risk-netting: error performing operation.  
4044 Unable to change Brokerage Firm limit on risk-netting: error performing operation.  
4045 Unable to delete Brokerage Firm limit on risk-netting: error performing operation.  
4046 Unable to remove Chief Trader's restriction on trading in risk-netting instruments: insufficient rights.  
4050 Unable to process the exercise request: restricted by the Chief Trader.  
4051 Unable to process the exercise request: restricted by the Brokerage Firm.  
4052 Unable to process the exercise request: wrong client code and/or security.  
4053 Unable to process the exercise request: cannot delete orders during the intraday clearing session.  
4054 Unable to process the exercise request: cannot change orders during the intraday clearing session.  
4055 Unable to process the exercise request: order number not found.  
4060 Unable to process the exercise request: insufficient rights.  
4061 Unable to process the exercise request: deadline for submitting requests has passed.  
4062 Unable to process the exercise request: client code not found.  
4063 Unable to process the exercise request: request not found.  
4064 Unable to process the exercise request: insufficient rights.  
4065 Unable to process the exercise request: option contract not found.  
4066 Unable to process the exercise request: request to disable automatic exercise may only be submitted on the option's expiration date.  
4067 Unable to process the exercise request: error performing operation.  
4068 Unable to process the exercise request: error performing operation.  
4069 Unable to process the exercise request: error performing operation.  
4070 Unable to process the exercise request: insufficient amount of positions in the client account.  
4090 No active sessions.  
4091 Client code not found.  
4092 Underlying's code not found.  
4093 Futures contract not found.  
4094 Futures contract does not match the selected underlying.  
4095 Partial selection of futures contracts not accepted: underlying flag set 'For all'.  
4096 Unable to remove restriction: no restriction set.  
4097 Unable to remove: the Chief Trader's restriction cannot be removed by Brokerage Firm trader.  
4098 Security not found in the current trading session.  
4099 Both securities must have the same underlying.  
4100 Exercise date of the near leg of a multi-leg order must not be later than that of the far leg.  
4101 Unable to make a multi-leg order: lots are different.  
4102 No position to move.  
4103 The FOK order has not been fully matched.  
4104 Anonymous repo order must contain a repo type.  
4105 Order containing a repo type is restricted in this multi-leg order.  
4106 Multi-leg orders can be added only on the Money Market.  
4107 This procedure is not eligible for adding orders for multi-leg securities.  
4108 Unable to trade risk-netting instruments in T0: insufficient rights.  
4109 Rate/swap price is not a multiple of the tick size.  
4110 The near leg price differs from the settlement price.  
4111 The rate/swap price exceeds the limit allowed.  
4112 Unable to set restrictions for multi-leg futures.  
4115 Unable to transfer funds between Brokerage Firm accounts: no active sessions.  
4116 Unable to transfer funds between Brokerage Firm accounts: the donor Brokerage Firm is not registered for trading.  
4117 Unable to transfer funds between Brokerage Firms: the receiving Brokerage Firm is not registered for trading.  
4118 Brokerage Firm does not have sufficient amount of free funds.  
4119 Brokerage Firm does not have sufficient amount of collateral.  
4120 Insufficient amount of free funds in the balance of the Separate Account.  
4121 Insufficient amount of collateral in the balance of the Separate Account.  
4122 Clearing Firm does not have sufficient amount of free funds.  
4123 Brokerage Firm does not have sufficient amount of collateral.  
4124 Brokerage Firm code not found.  
4125 Unable to transfer funds between accounts of different Clearing Firms.  
4126 Unable to transfer: error while transferring.  
4127 Insufficient free funds in the Settlement Account.  
4128 Brokerage firm does not have sufficient amount of free funds.  
4129 Insufficient amount of free funds in the balance of the Separate Account.  
4130 Clearing Firm does not have sufficient amount of free funds.  
4131 Brokerage Firm code not found.  
4132 Unable to withdraw: error in withdrawal logic.  
4133 No requests to cancel.  
4134 Brokerage Firm does not have sufficient amount of funds.  
4135 Clearing firm does not have sufficient amount of funds.  
4136 Prohibited to transfer pledged funds.  
4137 Brokerage Firm does not have sufficient amount of pledged funds.  
4138 Insufficient funds to withdraw from the Settlement Account.  
4139 Insufficient free collateral in the Settlement Account.  
4140 Unable to transfer: position not found.  
4141 Unable to transfer: insufficient number of open positions.  
4142 Cannot transfer positions from the client account to an account with a different ITN.  
4143 Unable to transfer position: the Brokerage Firms specified belong to different Clearing Firms.  
4144 Cannot transfer positions to 'XXYY000' Brokerage Firm account.  
4145 Unable to transfer positions for the selected Brokerage Firm: restricted by the Trading Administrator.  
4146 Transferring positions in the selected securities is prohibited.  
4147 Option contract not found.  
4148 Settlement Account does not have sufficient amount of pledged funds.  
4149 Settlement Account does not have sufficient amount of funds.  
4150 Unable to balance risk using specified futures instrument.  
4151 Specified FX Market Firm code not found.  
4152 Specified FX Market Settlement Account not found.  
4153 Specified FX Market financial instrument not found.  
4154 Unable to add request for FX Market: the required parameters are not registered in the system.  
4155 Required Administrator login for adding a risk balancing request is not registered in the system.  
4160 Funds transfer between settlement accounts is prohibited. Settlement account is included in the Unified Collateral Pool.  
4161 Withdrawal is prohibited. Settlement account is included in the Unified Collateral Pool.  
4162 Unable to perform operation. The Brokerage Firms must be of the same Settlement account.  
4163 Unable to perform operation. To transfer funds for Brokerage Firm with virtual limit, you are required to apply to NCC.  
4164 Unable to perform operation. It is prohibited to change settings for client accounts.  
4165 Unable to perform operation. Only Clearing Firm logins are able to perform the operation.  
4166 Incorrect combination of flag values.  
4167 Settlement Account not found.  
4168 Unable to transfer assets between Brokerage Firms of different settlement accounts outside of the main trading session.  
4169 Cannot perform operation: the operation is available for Clearing Firm/Brokerage Firm login only.  
4170 Cannot perform operation: incorrect Brokerage Firm account.  
4171 Cannot perform operation: incorrect client account.  
4172 Cannot perform operation: insufficient rights for the Clearing Member.  
4173 Cannot perform operation: insufficient rights for the Trading Member.  
4200 Cannot confirm request. Trading participant's MASTER login is not connected.  
4201 Cannot confirm request. Price value in request exceeded the current price value.  
4202 Cannot confirm request. Maximum number of contracts exceeded in request.  
4203 Cannot confirm request. Negotiated mode is not allowed.  
4204 Cannot confirm request. Maximum volume in Russian Ruble exceeded in request.  
4205 Cannot confirm request. Amount in Russian Ruble exceeded total available amount in requests per trading day.  
4206 Cannot confirm request. Number of buy orders exceeded maximum available number in position.  
4207 Cannot confirm request. Number of sell orders exceeded maximum available number in position.  
4208 Cannot confirm request. Total quantity of simultaneous restrictions on position size for different clearing register exceeded for given SMA login.  
4209 Cannot confirm request.  
4210 Cannot confirm request.  
4211 Cannot confirm request.  
4212 Cannot confirm request.  
4213 Cannot confirm request.  
4214 Cannot confirm request.  
4215 Cannot confirm request.  
4216 Cannot confirm request.  
4217 Cannot confirm request.  
4218 Cannot confirm request.  
4219 Cannot confirm request.  
4220 Trading operations for user are prohibited.  
4221 Unable to perform operation: Clearing Member and Trading Member represent the same entity.  
4222 Unable to perform operation with orders: insufficient rights for Clearing Member.  
4223 Unable to send request to NCC: insufficient rights for Trading Member.  
4224 Unable to perform operation: insufficient rights for active MASTER logins.  
4225 Reserve error code. The text will be updated later.  
4226 Reserve error code. The text will be updated later.  
4227 Reserve error code. The text will be updated later.  
4228 Reserve error code. The text will be updated later.  
4229 Reserve error code. The text will be updated later.  
4230 Orders will not be cancelled: collateral requirements are met for the Brokerage Firm.  
4231 Reserve error code. The text will be updated later.  
4232 Reserve error code. The text will be updated later.  
4233 Reserve error code. The text will be updated later.  
4234 Reserve error code. The text will be updated later.  
4235 Reserve error code. The text will be updated later.  
4236 Reserve error code. The text will be updated later.  
4237 Reserve error code. The text will be updated later.  
4238 Reserve error code. The text will be updated later.  
4239 Reserve error code. The text will be updated later.  
4240 Reserve error code. The text will be updated later.  
9999 Too many transactions sent from this login.  
10000 System level error while processing message.  
10001 Undefined message type.  
10004 Invalid message type.  
10005 MQ address is too large.  
10006 Error parsing message.  
11123 Deal accepted  
11124 Deal accepted & matched  
11125 Deal accepted (unvalidated)  
11129 Invalid security id  
11130 Negotiated deals not accepted for indices  
11131 Security is not trading yet  
11132 Security is in break period  
11133 Security is not currently trading  
11134 Trading in security is finished  
11135 Security is not trading today  
11136 Security is suspended  
11138 Instrument is suspended  
11139 Board is suspended  
11140 Invalid buy or sell indicator  
11141 Invalid counterparty firm  
11143 Invalid price  
11144 Invalid quantity  
11145 Invalid trading account  
11146 Trading account is suspended  
11147 Trading account's depository account is suspended  
11149 Account has insufficient balance to sell  
11155 Invalid deal number  
11156 Deal is currently unmatched  
11157 Deal is already validated  
11158 Deal is currently in an unknown state  
11159 Invalid order method for this security and board  
11160 Buy order accepted  
11161 Sell order accepted  
11162 Buy order accepted  
11163 Sell order accepted  
11164 Order quantity is incorrect  
11165 Buy order accepted (open period)  
11166 Sell order accepted (open period)  
11167 Minimum price step is set  
11168 Lot size is set  
11169 Buy order accepted (unvalidated)  
11170 Sell order accepted (unvalidated)  
11171 Invalid market order value  
11172 Orders not accepted for indices  
11173 Invalid order type  
11174 Invalid price split flag  
11175 Invalid fill flag  
11176 A market order must allow price splits  
11177 Market orders not accepted during security's open period  
11178 Single price orders not accepted during security's open period  
11179 Immediate orders not accepted during security's open period  
11180 Price may not be 0 for a limit order  
11181 Immediate option not allowed for a market order that will stay in order book  
11182 Price is out of range  
11187 Unable to match order  
11193 Invalid order number  
11194 You may not specify an order number and a user  
11197 You do not have access to this function  
11198 Trading System unavailable  
11199 Trading System is suspended  
11201 Unable to service request  
11202 You do not have access to the Trading System  
11210 Order withdrawn  
11211 Deal withdrawn  
11213 Invalid price operator  
11218 Invalid firm code  
11219 No orders withdrawn, rejection(s)  
11222 No negotiated deals to withdraw  
11230 Order value is incorrect  
11231 Only main board orders may be entered during primary auction  
11234 Order may not have immediate flag in primary auction  
11235 Only issuer agent may enter primary auction sell order  
11239 Sell order may not be a single price order in primary auction  
11240 Sell order should have zero quantity in primary auction  
11241 Auction bidding period is finished for security  
11242 Price must be 0 for market orders in primary auction  
11243 Market orders percentage limit will be breached  
11244 Firm cash limit will be breached for this instrument  
11245 Firm total cash limit will be breached  
11246 Buy order accepted  
11247 Sell order accepted  
11252 Security is in primary distribution  
11263 Trading account limit will be exceeded  
11271 Negotiated deals are not allowed during this period  
11361 Invalid order method for firm  
11363 Only negotiated deal orders are accepted for this trading account  
11364 Buy orders are not accepted for this trading account  
11365 Sell orders are not accepted for this trading account  
11368 Unable to match Force Partial Withdraw Order  
11376 Orders canceled successfully  
11407 Invalid order method for trdacc  
11408 Fill Withdraw option not allowed for a market order  
11409 No weighted average price exists  
11413 Firm and Counterparty must be the same for deals on this board  
11414 Price is outside of allowed range  
11415 One side of the deal must have a client account  
11416 One side of the deal must have a members own account  
11419 No bid or offer price exists for the source security and board  
11424 No Second Part Price exists for REPO  
11425 No Rate Of Interest exists for REPO  
11429 REPO Upper limit breached  
11438 REPO rate out of range  
11439 REPO second part period is not closed  
11443 Yield is outside of allowed range  
11445 Cross trades not allowed for this instrument  
11446 Firm cash limit for the Second Part of REPO will be breached  
11447 Total cash limit for REPO operations will be breached  
11448 Invalid settle code specified  
11449 Invalid number of trades  
11450 Invalid trade number  
11451 You can not validate this trade  
11452 These trades can not be validated  
11453 Trade is already validated  
11454 There is a report for buy trade  
11456 Report accepted  
11457 Report accepted & matched  
11458 Invalid report number specified  
11459 Report withdrawn  
11460 No reports to withdraw  
11461 There already exists a buy quote for specified security and settlement code  
11462 There already exists a sell quote for specified security and settlement code  
11463 Quote withdrawn  
11464 No quotes to withdraw  
11465 Reports are not allowed during this period  
11486 Order value is incorrect  
11497 Invalid character in brokerref  
11498 Invalid character in matchref  
11499 Invalid character in extref  
11507 Order quantity doesn't match security's granularity ( lots)  
11508 Account has insufficient convsecurity balance to sell  
11509 Immediate WAPrice orders not accepted during security's open period  
11510 Immediate WAPrice orders not accepted during primary auction  
11511 Immediate WAPrice orders could not be queued  
11512 Buy order accepted  
11513 Sell order accepted  
11515 Refund rate is not allowed for the settle code specified  
11516 Incomplete repo order  
11517 Invalid refund rate  
11518 Invalid REPO rate  
11519 Invalid price2  
11520 Negative or zero price2 resulted  
11521 Can't send report to trade due to invalid price  
11522 Invalid combination of market, board, instrument and security  
11523 REPO rate must not exceed  
11533 Invalid client code  
11536 Order must be a limit order  
11537 Order may not be a single price order  
11538 Order should have zero quantity  
11539 Buy order already entered  
11540 Price must be 0 for market orders in auction  
11543 Auction price can not be calculated  
11548 Repo Rate is incorrect  
11549 Repo Rate is incorrect  
11550 Limit will be breached for position  
11554 Invalid discount specified  
11555 Invalid lower discount specified  
11556 Invalid upper discount specified  
11557 Invalid block collateral flag  
11558 Invalid repo value specified  
11559 Invalid price resulted  
11560 Invalid quantity resulted  
11561 Invalid REPO value resulted  
11562 Invalid REPO repurchase value resulted  
11563 Main board is not defined for the security  
11565 Market price is not defined for the security  
11566 Starting discount can not be less than lower discount limit  
11567 Starting discount can not be greater than upper discount limit  
11568 This report can not be cleanly accepted  
11573 Invalid settlement code or REPO term specified  
11575 Buy Order accepted. Balance withdrawn to avoid a cross trade  
11576 Sell Order accepted. Balance withdrawn to avoid a cross trade  
11577 This order causes a cross trade  
11578 Total order value at single repo rate can not exceed limit.  
11579 For this instrument price is less than allowed  
11580 For this instrument price is greater than allowed  
11581 Starting discount is less than allowed  
11582 Starting discount is greater than allowed  
11583 Lower discount limit is incorrect  
11584 Upper discount limit is incorrect  
11585 Lower discount limit must not be specified  
11586 Upper discount limit must not be specified  
11587 Block collateral option must be set  
11588 Repo Rate is greater than allowed  
11594 REPO base condition is incorrect for this board  
11599 Invalid price2 resulted  
11600 Minimum rate step is incorrect  
11601 Minimum discount step is incorrect  
11602 REPO value for this instrument is incorrect  
11603 REPO repurchase value for this instrument is incorrect  
11608 Not allowed client code type for this trading account.  
11609 Not allowed client code type for this trading account.  
11612 Order value is larger than allowed  
11613 Order value is less than allowed  
11615 Invalid deal number  
11616 Unable to accept deal - deal is not active  
11617 Unable to accept deal  
11618 Unable to accept deal. Invalid security specified  
11619 Unable to accept deal. Invalid price specified  
11620 Unable to accept deal. Invalid quantity specified  
11621 Unable to accept deal. Invalid settlecode specified  
11622 Unable to accept deal. Invalid refundrate specified  
11623 Unable to accept deal. Invalid matchref specified  
11624 Unable to accept deal. Invalid buy/sell specified  
11625 Warning: this will breach REPO limit. If sure, set firm's limit check flag to 'N' for position and retry  
11626 Invalid trading account for marketmaker order  
11627 Marketmaker orders accepted only in normal trading period  
11628 Invalid order type for marketmaker order  
11629 Buy Order accepted. Balance withdrawn to avoid a trade between marketmakers  
11630 Sell Order accepted. Balance withdrawn to avoid a trade between marketmakers  
11631 This order causes a trade between marketmakers  
11632 Is in breach of MGF  
11633 Is in breach of MGF  
11635 Discount limits can not be set  
11636 Margin call does not need any counterpart's acceptance  
11647 Total sell quantity of a security for a firm can not exceed of its issue size on this board  
11648 Clearing session is in progress  
11649 Trade is already canceled -  
11650 There is a cancel report for buy trade  
11651 There is a cancel report for sell trade  
11652 Trade can not be canceled  
11653 Cancel report accepted & matched  
11654 Cancel report accepted  
11655 Unable to select boards  
11658 Invalid client code specified for this security  
11660 External trade registered:  
11661 Invalid settle date specified  
11662 External trades withdrawn  
11663 Invalid external trade number  
11664 Invalid large trade flag  
11665 No external trades to withdraw  
11666 This trade have to be large  
11667 Invalid large flag specified  
11668 Invalid clearing type specified  
11669 Only one trade can be included in simple clearing report  
11670 Simple clearing is not currently available  
11671 Specified tradesuccessfully settled  
11672 Invalid trade number specified: '  
11673 Trade already settled  
11674 Trade unvalidated  
11675 Trade is not in simple clearing mode  
11676 REPO first part trade is not validated yet for trade  
11677 REPO first part trade is not settled yet for trade  
11678 Simple clearing is not allowed for position  
11679 Margin calls can not be included in simple clearing  
11680 Trade value must be not less than for simple clearing  
11694 Simple clearing is not allowed for this security and board  
11695 Simple clearing is not allowed for the same trading accounts  
11699 Counter price is not defined  
11700 Order must be entered with counter price flag  
11701 Order price is incorrect  
11702 Settlement date of the REPO second part trade is not a working day  
11703 Invalid date specified  
11704 Only BUY orders are allowed at this moment  
11705 Only SELL orders are allowed at this moment  
11706 You are not an underwriter. Only security underwriters are allowed to enter order at this moment  
11707 Invalid transaction reference  
11718 There is a confirm report for trade  
11719 Trade is not included into clearing  
11720 Special report a not available now  
11721 ClientCode is not allowed for this trading account  
11730 The price of the buy order should be less then the best offer price for this type of order  
11731 The price of the sell order should be greater then the best bid price for this type of order  
11732 The quantity of lots is less than allowed  
11733 The quantity of lots is greater than allowed  
11734 Volume of the order is less than allowed  
11735 Volume of the order is greater than allowed  
11736 Signature validation error.  
11737 Used wrong signature or EXKEYUSAGEOID  
11740 Clients without signature are not supported  
11741 The trading account and the secutity belong to different depositories  
11742 Only NegDeals addressed to everyone available in that trading period  
11743 This settle code is unavailable  
11744 The second part of REPO trade cannot be canceled.  
11745 The transfer cannot be canceled.  
11746 Specified tradesuccessfully canceled  
11747 Unable to determine price move limit for this security  
11748 The price for this security should be in range from to  
11749 Only one of RepoValue or Quantity can be specified  
11750 REPO price is not defined  
11751 Starting discount must not be specified.  
11752 Discount limits must not be specified.  
11754 You have got a deferred money debt. This debt should be settled by the end of this day or tomorrow during the settlement with the Central counterparty.  
11755 You have got deferred security debts. These debts should be settled by the end of this day or tomorrow during the settlement with the Central counterparty.  
11756 You have got a default on collaterals. All the defaults on collaterals must be settled by 15:00 today.  
11757 You have got an unsettled deferred money debt. The default settlement procedure will be enforced.  
11758 You have got an unsettled collaterals default. The default settlement procedure will be enforced.  
11759 You have got a deferred money claim. This claim will be satisfied by the Central counterparty either by the end of this day or tomorrow during the settlement with CC.  
11760 You have got deferred security claims. Claims will be satisfied by the Central counterparty either by the end of this day or tomorrow during the settlement with CC.  
11761 The firm's limit on liabilities to the Central counterparty has been exceeded.  
11782 Simple report can not be complex  
11783 Client code is suspended  
11784 Specified tradesuccessfully notified as payment pended  
11786 Operations suspended by Firm Manager or Trading System Superviser  
11787 User successfully suspended  
11788 User successfully suspended. Orders withdrawn  
11789 User successfully Unsuspended  
11790 The total amount of deferred debts of the unconscionable clearing participants exceeds the limit set for the settlement with the Central counterparty. CC's own assets will not be used during the settlement.  
11791 There are no deferred debts for the settlement with the Central counterparty  
11792 You have got deferred security claims on the board for the position caused by the default on this position. Claims will be settled by the Central counterparty after the default settlement.  
11793 You have got a deferred money claim on the board for the position caused by the default on this position. Claim will be settled by the Central counterparty after the default settlement.  
11794 The total amount of deferred debts of the unconscionable clearing participants does not exceed the limit set for the settlement with the Central counterparty. CC's own assets will be used during the settlement.  
11795 United limit breached  
11796 Trading limit breached  
11797 Limit for currency  
11802 Cash position for currency will be breached  
11804 Value must not be specified for position withdraw flag  
11805 Value must be negative for specified position withdraw flag  
11807 Bank Account is in default mode  
11808 Bank Account is not in default mode  
11809 Bank Account is in early settle mode  
11810 Bank Account is in trading closed mode  
11812 Limits will be breached for position  
11813 Cannot cancel trade. Parent trade should be canceled  
11814 Maximum order hidden quantity ratio is incorrect  
11815 Minimum order visible quantity value is incorrect  
11816 Hidden quantity can not be specified for market maker order  
11817 Minimum order visible quantity is less than allowed  
11819 Buy order accepted (closing auction)  
11820 Sell order accepted (closing auction)  
11821 Events in past time are not allowed  
11822 Buy order accepted (dark pool)  
11823 Sell order accepted (dark pool)  
11824 Client code type must a legal entity  
11826 Matchref must not be specified for this type of counter party  
11827 Allowed only trades with the same bank account for this period  

### MOEX spot and currencies

Актуальный справочник кодов ошибок для Фондового и Валютного рынков находится в открытом доступе на ftp Московской биржи. Ознакомиться можно по [ссылке](https://ftp.moex.com/pub/ClientsAPI/ASTS/docs/asts_message_list.csv)

**MOEX ASTS ERRORS**  
(001) Message #%d sent  
(065) Invalid market: %s  
(071) Invalid board: %s  
(076) Invalid security: %s  
(090) Invalid firm: %s  
(098) Invalid limit2: %s  
(101) Invalid user: %s  
(107) Invalid depository account: %s  
(110) Invalid trading account: %s  
(123) Deal #%ld accepted  
(124) Deal #%ld accepted and matched  
(125) Deal #%ld accepted (unvalidated)  
(128) Order table is full  
(129) Invalid security id  
(130) Negotiated deals not accepted for indices  
(131) Security is not trading yet  
(132) Security is in break period  
(133) Security is not currently trading  
(134) Trading in security is finished  
(135) Security is not trading today  
(136) Security is suspended  
(137) Market is suspended  
(138) Instrument is suspended  
(139) Board is suspended  
(140) Invalid buy or sell indicator  
(141) Invalid counterparty firm  
(142) Invalid custodian firm  
(143) Invalid price  
(144) Invalid quantity  
(145) Invalid trading account  
(146) Trading account is suspended  
(147) Trading account's depository account is suspended  
(148) Holdings table is full  
(149) Account has insufficient balance to sell  
(150) Foreign ownership limit will be breached  
(151) Buy limit for account will be breached  
(152) Sell limit for account will be breached  
(153) Holdings limit for security will be breached  
(154) Invalid user id  
(155) Invalid deal number  
(156) Deal is currently unmatched  
(157) Deal is already validated  
(158) Deal is currently in an unknown state  
(159) Invalid order method for this security and board  
(160) Buy order #%ld accepted  
(161) Sell order #%ld accepted  
(162) Buy order #%ld accepted (%ld matched)  
(163) Sell order #%ld accepted (%ld matched)  
(164) Order quantity must not be more than %ld  
(165) Buy order #%ld accepted (open period)  
(166) Sell order #%ld accepted (open period)  
(167) Minimum price step: %.*f  
(168) Lot size is %d  
(169) Buy order #%ld accepted (unvalidated)  
(170) Sell order #%ld accepted (unvalidated)  
(171) Invalid market order value: %.0f  
(172) Orders not accepted for indices  
(173) Invalid order type  
(174) Invalid price split flag  
(175) Invalid fill flag  
(176) A market order must allow price splits  
(177) Market orders not accepted during this trading period  
(178) Single price orders not accepted during this trading period  
(179) Immediate orders not accepted during this trading period  
(180) Price may not be 0 for a limit order  
(181) Immediate option not allowed for a market order that will stay in order book  
(182) Price is out of range  
(183) Invalid hidden quantity  
(184) Hidden quantity not accepted during this trading period  
(185) Market orders may not have a hidden quantity  
(186) Trades table is full  
(187) Unable to fill the 'Fill or Kill' order. Order rejected.  
(188) System error in Buy  
(189) System error in Sell  
(190) Invalid user code  
(193) Invalid order number  
(194) You may not specify an order number and a user  
(195) Your user id is suspended  
(196) Your firm is suspended  
(197) You do not have access to this function  
(198) Trading System unavailable  
(199) Trading System is suspended  
(200) Invalid request  
(201) Unable to service request  
(202) You do not have access to the Trading System  
(203) User id cannot be used from this network address  
(204) User id is already in use  
(205) IP address in use by %.12s  
(206) Logon OK (firm: %.12s). %s  
(207) Invalid password. %s  
(208) Current password incorrectly entered  
(209) Password successfully changed  
(210) %d order(s) with total balance %ld withdrawn  
(211) %d deal(s) withdrawn  
(212) Invalid withdraw operation  
(213) Invalid price operator  
(214) Invalid account code  
(215) Invalid security code  
(216) Only a firm manager or trading supervisor may specify a user  
(217) Only a trading supervisor may specify a firm  
(218) Invalid firm code  
(219) No orders withdrawn  
(220) You may not specify a user and a deal number  
(221) You may not specify a firm and user  
(222) No negotiated deals to withdraw  
(227) An instrument or a board must be specified  
(228) Invalid expiry date  
(229) Order may not expire before today  
(230) Order value must not be more than %.0f  
(231) Only main board orders may be entered during primary auction  
(232) Hidden quantity not allowed in primary auction  
(233) Order must expire today in primary auction  
(234) Order may not have immediate flag in primary auction  
(235) Only issuer agent may enter primary auction sell order  
(236) Sell order may only be entered when security is closed  
(237) Sell order already entered for primary auction  
(238) Sell order must be a limit order in primary auction  
(239) Sell order may not be a single price order in primary auction  
(240) Sell order should have zero quantity in primary auction  
(241) Auction bidding period is finished for security  
(242) Price must be 0 for market orders in primary auction  
(243) Market orders percentage limit will be breached  
(244) Firm cash limit will be breached for this instrument  
(245) Firm total cash limit will be breached  
(246) Buy order #%ld accepted (%ld matched  
(247) Sell order #%ld accepted (%ld matched  
(250) %d order(s) validated  
(251) Invalid order entry date  
(252) Security is in primary distribution  
(253) Invalid currency: %s  
(254) Invalid allow breach flag  
(255) Existing limit not found  
(256) First limit will be breached  
(257) Second limit will be breached  
(258) Order is not able to be amended  
(259) Unable to reduce order quantity  
(260) Invalid language code  
(261) Language is not available  
(262) Language successfully changed  
(263) Trading account limit will be exceeded  
(269) Trading Engine temporarily unavailable  
(271) Negotiated deals are not allowed during this period  
(272) Only closing period orders are accepted during security's closing period  
(273) Only an issuer agent may enter orders in security's final close period  
(274) Invalid account for closing period order  
(275) Order may only be from an investor account during security's closing period  
(276) Buy order #%ld accepted (close period)  
(277) Sell order #%ld accepted (close period)  
(281) No permission for this operation  
(282) User %s is not from your firm  
(283) User %s is not from your exchange  
(284) Invalid position tag %.4s  
(285) User cash limit exceeded  
(286) User cash limit(s) would be breached  
(287) User cash limit(s) has updated OK  
(296) Invalid F&O security type %s  
(345) Price not allowed on market order in open period  
(350) Firm %s does not have a position for tag %s  
(351) Invalid trade  
(352) Invalid order  
(360) No sell order for security in Primary Auction  
(361) Invalid order method for firm  
(363) Only negotiated deal orders are accepted for this trading account  
(364) Buy orders are not accepted for this trading account  
(365) Sell orders are not accepted for this trading account  
(367) Order method Force Partial Withdraw is not valid for a REPO firm  
(368) Unable to match Force Partial Withdraw Order  
(369) Invalid to exchange id: %s  
(370) Only one address type must be specified  
(371) Broadcast messages not allowed  
(372) Firm %s is not on users exchange  
(373) Exchange %s is not valid for this user  
(374) Firm %s is not users firm  
(375) Your client  
(376) Orders canceled successfully  
(377) Trading Account specified is not a valid for currency trading  
(378) Trading Account specified is not the same currency as the security been traded  
(379) Trading Account specified is not a depository  
(388) No Firm permission record exists  
(394) Yield Order not valid for this type of Trading Account  
(401) is in breach of MGF for buy  
(402) is in breach of MGF for sell  
(403) is no longer in breach of MGF for buy  
(404) is no longer in breach of MGF for sell  
(407) Invalid order method for trdacc  
(408) Fill Withdraw option not allowed for a market order  
(409) No weighted average price exists  
(412) Only weighted average price orders are accepted for this trading account  
(413) Firm and Counterparty must be the same for deals on this board  
(414) Price is outside of allowed range  
(415) One side of the deal must have a client account  
(416) One side of the deal must have a members own account  
(424) No Second Part Price exists for REPO  
(425) No Rate Of Interest exists for REPO  
(429) REPO Upper limit breached  
(438) REPO rate out of range:  %.2f (%.2f - %.2f)  
(439) REPO second part period is not closed  
(443) Yield is outside of allowed range  
(445) Cross trades not allowed for this instrument  
(446) Firm cash limit for the Second Part of REPO will be breached  
(448) Invalid settle code specified  
(449) Number of trades for single report can not exceed %d  
(450) Invalid trade number - %.12s %c  
(451) You can not validate this trade - %ld  
(452) These trades can not be validated"  
(453) Trade is already validated - %ld  
(454) There is a report for buy trade %ld"  
(455) Report table is full  
(456) Report #%ld accepted  
(457) Report #%ld accepted and matched  
(458) Invalid report number specified  
(459) %d report(s) withdrawn  
(460) No reports to withdraw  
(461) There already exists a buy quote for specified security and settlement code"  
(462) There already exists a sell quote for specified security and settlement code"  
(463) %d quote(s) withdrawn  
(464) No quotes to withdraw  
(465) Reports are not allowed during this period  
(485) Your client  
(486) Order value must not be less than %.2f  
(489) Invalid TEClient: %s  
(492) Transfer is not allowed  
(497) Invalid character in brokerref - '%c'  
(498) Invalid character in matchref - '%c'  
(499) Invalid character in extref - '%c'  
(507) Order quantity doesn't match security's granularity (%d lots)  
(508) Account has insufficient convsecurity balance to sell  
(509) Immediate WAPrice orders not accepted during security's open period  
(510) Immediate WAPrice orders not accepted during primary auction  
(511) Immediate WAPrice orders could not be queued  
(512) Buy order #%ld accepted (%ld matched  
(513) Sell order #%ld accepted (%ld matched  
(515) Refund rate is not allowed for the settle code specified  
(516) Incomplete REPO order  
(517) Invalid refund rate  
(518) Invalid REPO rate  
(519) Invalid price2  
(520) Negative or zero price2 resulted  
(521) Can't send report to trade %ld due to invalid price  
(522) Invalid combination of market  
(523) REPO rate must not exceed %.2f%%  
(529) Close Price is not defined  
(533) Invalid client code  
(536) Order must be a limit order"  
(537) Order may not be a single price order"  
(538) Order should have zero quantity"  
(539) Buy order already entered  
(540) Price must be 0 for market orders in auction  
(543) Auction price can not be calculated  
(547) Invalid price  
(548) REPO rate must not be less than %.*f%%  
(549) REPO rate must be equal to %.*f%%  
(550) %.12s limit will be breached for '%.4s' position  
(551) Invalid client Bank Account ID %s  
(554) Invalid discount specified  
(555) Invalid lower discount specified  
(556) Invalid upper discount specified  
(557) Invalid block collateral flag  
(558) Invalid REPO value specified  
(559) Invalid price resulted  
(560) Invalid quantity resulted  
(561) Invalid REPO value resulted  
(562) Invalid REPO repurchase value resulted  
(563) Main board is not defined for the security  
(564) Security is not defined on the main board  
(565) Market price is not defined for the security  
(566) Starting discount (%.*f%%) can not be less than lower discount limit (%.*f%%)  
(567) Starting discount (%.*f%%) can not be greater than upper discount limit (%.*f%%)  
(568) This report can not be cleanly accepted  
(569) There is a report for sell trade %ld"  
(570) There is an unsettled margin call for trade #%ld  
(573) Invalid settlement code or REPO term specified  
(574) Invalid trading account selected for the specified block_collateral option  
(575) Buy Order #%ld accepted. %ld matched. Balance withdrawn to avoid a cross trade  
(576) Sell Order #%ld accepted. %ld matched. Balance withdrawn to avoid a cross trade  
(577) This order causes a cross trade  
(578) Total order value at single REPO rate can not exceed %.2f limit.  
(579) For this instrument price can not be less than %.*f  
(580) For this instrument price can not be greater than %.*f  
(581) Starting discount can not be less than %.*f%%  
(582) Starting discount can not be greater than %.*f%%  
(583) Lower discount limit must be %.*f%%  
(584) Upper discount limit must be %.*f%%  
(585) Lower discount limit must not be specified  
(586) Upper discount limit must not be specified  
(587) Block collateral option must be set  
(588) REPO rate must not be greater than %.*f%%  
(589) Invalid order activation time  
(590) Invalid activation time order type  
(591) Cannot set lifetime for activation time orders  
(592) Buy order #%ld accepted. Activation time - %d:%.2d:%.2d  
(593) Sell order #%ld accepted. Activation time - %d:%.2d:%.2d  
(595) Total buy orders value can not exceed %.2f limit  
(596) Total sell orders value can not exceed %.2f limit  
(599) Invalid price2 resulted  
(600) Minimum rate step: %.*f  
(601) Minimum discount step: %.*f  
(602) REPO value for this instrument can not exceed %.0f  
(603) REPO repurchase value for this instrument can not exceed %.0f  
(608) Only the following client code types are valid for this trading account: %s  
(609) Invalid client code type for this type of trading account  
(612) Order value can not be larger than %.2f  
(613) Order value can not be less than %.2f  
(615) Invalid deal number  
(616) Unable to accept deal - deal is not active  
(617) Unable to accept deal  
(618) Unable to accept deal. Invalid security specified  
(619) Unable to accept deal. Invalid price specified  
(620) Unable to accept deal. Invalid quantity specified  
(621) Unable to accept deal. Invalid settlecode specified  
(622) Unable to accept deal. Invalid refundrate specified  
(623) Unable to accept deal. Invalid matchref specified  
(624) Unable to accept deal. Invalid buy/sell specified  
(625) Warning: this will breach REPO limit. If sure  
(626) Invalid trading account for marketmaker order  
(627) Marketmaker orders accepted only in normal trading period  
(628) Invalid order type for marketmaker order  
(629) Buy Order #%ld accepted. %ld matched. Balance withdrawn to avoid a trade between marketmakers  
(630) Sell Order #%ld accepted. %ld matched. Balance withdrawn to avoid a trade between marketmakers  
(631) This order causes a trade between marketmakers  
(632) is in breach of MGF  
(633) is in breach of MGF  
(634) Invalid TC  
(635) Discount limits can not be set  
(636) Margin call does not need any counterpart's acceptance  
(646) Issuer of a security can not sell it on this board  
(647) Total sell quantity of a security for a firm can not exceed %.2f%% of its issue size on this board  
(648) Clearing session is in progress  
(649) Trade is already canceled - %ld  
(650) There is a cancel report for buy trade %ld  
(651) There is a cancel report for sell trade %ld  
(652) Trade %ld can not be canceled  
(653) Cancel report #%ld accepted and matched  
(654) Cancel report #%ld accepted  
(655) Boards: %d selected  
(656) Invalid number of boards  
(657) REPOORDER table is full  
(658) Invalid client code specified for this security  
(659) ExtTrades table is full  
(660) External trade registered: %ld  
(661) Invalid settle date specified  
(662) %d external trades withdrawn  
(663) Invalid external trade number - %.12s  
(664) Invalid large trade flag  
(665) No external trades to withdraw  
(666) This trade have to be large  
(667) Invalid large flag specified  
(668) Invalid clearing type specified  
(669) Only one trade can be included in simple clearing report  
(670) Simple clearing is not currently available  
(671) Specified trade(s) successfully settled  
(672) Invalid trade number specified: '%s'  
(673) Trade #%s already settled  
(674) Trade #%s unvalidated  
(675) Trade #%s is not in simple clearing mode  
(676) REPO first part trade is not validated yet for trade #%ld  
(677) REPO first part trade is not settled yet for trade #%ld  
(678) Simple clearing is not allowed for %.4s position  
(679) Margin calls can not be included in simple clearing  
(680) Trade value must be not less than %.2f for simple clearing  
(694) Simple clearing is not allowed for this security and board  
(695) Simple clearing is not allowed for the same trading accounts  
(699) Counter price is not defined  
(700) Order must be entered with counter price flag  
(701) Order price must be equal to %.*f  
(702) Settlement date of the REPO second part trade - %02d.%02d.%4d - is not a working day  
(704) Only BUY orders are allowed at this moment  
(705) Only SELL orders are allowed at this moment  
(706) You are not an underwriter. Only security underwriters are allowed to enter order at this moment  
(707) Invalid transaction reference  
(709) You can not have more than %d active orders for this instrument  
(715) You can not have more than %d active market orders for this instrument  
(718) There is a confirm report for trade %ld  
(719) Trade %ld is not included into clearing  
(720) Special reports are not available now  
(721) ClientCode is not allowed for this trading account  
(730) The price of the buy order should be less then the best offer price for this type of order  
(731) The price of the sell order should be greater then the best bid price for this type of order  
(732) Minimum available value of the quantity is: %d of lots  
(733) Maximum available value of the quantity is: %ld of lots  
(734) Minimum available volume of the order is: %f  
(735) Maximum available volume of the order is: %f  
(736) Signature validation error: %s  
(737) Used wrong signature or EXKEYUSAGEOID  
(740) Clients without signature are not supported  
(741) The trading account and the security belong to different depositories  
(742) Only NegDeals addressed to everyone available in that trading period  
(743) This settle code is unavailable after %d:%.2d:%.2d  
(744) The second part of REPO trade cannot be canceled. Trade № %ld  
(745) The transfer cannot be canceled. Trade № %ld  
(746) Specified trade(s) successfully canceled  
(747) Unable to determine price move limit for this security  
(748) The price for this security should be in range from %.*f to %.*f  
(749) Only one of RepoValue or Quantity can be specified  
(750) REPO price is not defined  
(751) Starting discount must not be specified.  
(752) Discount limits must not be specified.  
(754) You have got a deferred money debt on the board '%s' for the position: %s. This debt should be settled by the end of this day or tomorrow during the settlement with the Central counterparty.  
(755) You have got %d deferred security debts on the board '%s' for the position: %s. These debts should be settled by the end of this day or tomorrow during the settlement with the Central counterparty.  
(756) You have got a default on collateral for position %s. All the defaults on collateral must be settled by 15:00 today.  
(757) You have got an unsettled deferred money debt on the board '%s' for the position %s. The default settlement procedure will be enforced.  
(758) You have got an unsettled collateral default for the position %s. The default settlement procedure will be enforced.  
(759) You have got a deferred money claim on the board '%s' for the position %s. This claim will be satisfied by the Central counterparty either by the end of this day or tomorrow during the settlement with CC.  
(760) You have got %d deferred security claims on the board '%s' for the position %s. Claims will be satisfied by the Central counterparty either by the end of this day or tomorrow during the settlement with CC.  
(761) The firm's limit on liabilities to the Central counterparty has been exceeded.  
(782) Simple report can not be complex  
(783) Client code is suspended  
(786) Operations suspended by Firm Manager or Trading System Superviser"  
(787) User successfully suspended  
(788) User successfully suspended. Orders withdrawn  
(789) User successfully Unsuspended  
(790) The total amount of deferred debts of the unconscionable clearing participants (%.2f rub.) exceeds the limit set for the settlement with the Central counterparty (%.2f rub.). CC's own assets will not be used during the settlement.  
(792) You have got %d deferred security claims on the board '%s' for the position %s caused by the default on this position. Claims will be settled by the Central counterparty after the default settlement.  
(793) You have got a deferred money claim on the board '%s' for the position %s caused by the default on this position. Claim will be settled by the Central counterparty after the default settlement.  
(794) The total amount of deferred debts of the unconscionable clearing participants (%.2f rub.) does not exceed the limit set for the settlement with the Central counterparty (%.2f rub.). CC's own assets will be used during the settlement.  
(795) Single Limit for Bank Account %12.12s breached: %.2f  
(796) Trading limit for Bank Account %12.12s breached: %.2f.  
(797) Limit for currency %.4s breached: %.2f  
(807) Bank Account is in default mode  
(808) Bank Account is not in default mode  
(809) Bank Account is in early settle mode  
(810) Bank Account is in trading closed mode  
(812) Limits will be breached for position %.30s  
(813) Cannot cancel trade <%ld>. Parent trade <%ld> should be canceled  
(814) Maximum order hidden quantity ratio is %d  
(815) Minimum order visible quantity value is %.2f  
(816) Hidden quantity can not be specified for market maker order  
(817) Minimum order visible quantity is %d  
(819) Buy order #%ld accepted (closing auction)  
(820) Sell order #%ld accepted (closing auction)  
(822) Buy order #%ld accepted (dark pool)  
(823) Sell order #%ld accepted (dark pool)  
(824) Client code type must a legal entity  
(826) Matchref must not be specified for this type of counter party  
(827) Allowed only trades with the same bank account for this period  
(828) Trading Account has not enough permissions for that type of reports  
(829) Either price or volume must be specified in the order  
(830) Counterparty should be specified for orders by value  
(831) Invalid price resulted  
(832) Buy order #%ld accepted (discrete auction)  
(833) Sell order #%ld accepted (discrete auction)  
(834) Начался дискретный аукцион по финансовому инструменту %16.16s."  
(835) Закончился дискретный аукцион по финансовому инструменту %16.16s. Торги будут продолжены в режиме Normal Trading.  
(836) Закончился дискретный аукцион по финансовому инструменту %16.16s  
(837) Закончился дискретный аукцион по финансовому инструменту %16.16s.  
(839) Either quantity or volume must be specified in the order  
(840) Collateral position has been breached: %.2f  
(841) Transfer #%ld accepted  
(843) Offering qty updated  
(844) Delivery obligations on buy are not specified. Order rejected.  
(845) Delivery obligations on sell are not specified. Order rejected.  
(846) Delivery obligations exceeded on %ld securities. Order rejected.  
(847) For specific trading account could not found CCP trading account  
(848) CCP trading account is suspending  
(849) Trading in securities not allowed for the trading account  
(850) Sell Market orders specified by value are not allowed  
(851) For Market orders on buy allowed specification by value only in current trade period."  
(852) Close Auction Price is not defined. Order rejected.  
(853) Only orders with Close Auction Price are available. Close Auction Price is %.*f.  
(854) Activation time orders cannot have other type event activation  
(855) Buy order #%ld accepted (Activation at the closing auction)  
(856) Sell order #%ld accepted (Activation at the closing auction)  
(857) For the odd lots board the order balance can not exceed the security's lot size on main board  
(858) Unable to accept deal. Invalid baseprice specified  
(859) Baseprice can not be specified for this sec  
(862) Trading with TODAY settlement is over  
(863) Limit order specified by value is not allowed  
(864) Fill Withdraw option of order is not allowed for selected Trading Period  
(865) For this instrument BasePrice can not be less than %.*f  
(866) For this instrument BasePrice can not be more than %.*f  
(867) For this instrument Price can not be less than %.*f  
(868) For this instrument Price can not be more than %.*f  
(869) Firm limits successfully updated [Planned #%.2f]  
(870) Too many boundary securities specified  
(871) At least one boundary security should be specified  
(872) Order-list request is available for linked-list type securities only"  
(873) The security is not in the list"  
(874) Only linked-list orders available for this type of security"  
(875) Order for CCP REPO available only T+ trading account  
(876) First limit will be breached  
(877) Second limit will be breached [planned %.2f]  
(878) Invalid allow breach flag  
(879) Uncovered flag successfully updated in Trading account  
(880) Uncovered flag successfully updated in Bank account  
(881) Holdings full covered limit for security will be breached for this firm  
(882) Position full covered limit will be breached for firm %12.12s. Asset %12.12s (%.2f < 0)  
(883) The security %10.10s already in the list of boundaries  
(884) The boundary of the %10.10s is bigger then overall REPO value. Calculated REPO value %.2f  
(885) Linked order reference table full. The new Order-list type order can't be entered.  
(886) Holdings full covered limit for security will be breached for this security holdings  
(887) Holdings full covered limit for security will be breached for this trading account  
(888) Holdings full covered limit for security will be breached for this security  
(889) Position full covered limit will be breached for bankacc %12.12s. Asset %12.12s (%.2f < 0)  
(890) Trading account has no cash account for this security and board  
(891) Buy linked-list order #%ld accepted  
(892) Sell linked-list order #%ld accepted  
(893) Amend orders available only in the normal trading period  
(894) Amend not allowed for REPO orders  
(895) Amend not allowed for Orders to close auction  
(896) Amend not allowed for Olinked-list orders  
(897) Only limit orders can be amended  
(898) Amend not allowed for orders specified by value  
(899) Amend not allowed for iceberg-orders  
(900) Amend not allowed for partial matched orders  
(901) Amend not allowed for time activated orders  
(903) Order quantity must not be less than %d  
(904) Game ASTS is offline  
(905) Invalid asset: %s  
(906) Market orders by value not allowed  
(907) Operations in this securities is not allowed for the trading account %12.12s.  
(908) Invalid extended security id  
(909) Too many securities specified in the list-order. Available not more then %d securities  
(911) Unable to accept deal. Invalid Trade No specified  
(912) Counterparty already sent new modification order for this trade. OrderNo #%ld  
(913) There is the modification order for that trade. OrderNo #%ld  
(914) The key parameters specified is not correspond to parameters of the modified trade  
(915) Can't withdraw order. The order already matched.  
(916) Can't withdraw order. The specified order is not active. Current status is '%c'  
(918) FullCovered for asset successfully set  
(919) Market order is not allowed for specified trading period.  
(920) Full covered limit will be breached (deficit %.2f) for asset %12.12s  
(921) Full covered limit1 will be breached for bankacc %12.12s. Asset %12.12s (deficit %.2f)  
(922) Cancel on disconnect mode ON  
(923) User HEARTBEAT OK  
(924) You are sending HEARTBEATs too often  
(925) %d orders canceled for inactive or disconnected user  
(926) Full covered limit2 will be breached for bankacc %12.12s. Asset %12.12s (deficit %.2f)  
(927) Price stabilization orders cannot be entered using the trust management account.  
(928) Incorrect compensation for trade cancellation  
(932) Price stabilization orders cannot be entered using Force Partial Withdraw Order  
(933) Amount of compensation may not exceed the amount of the trade  
(934) Trade cancellation reports are not allowed on this trading board  
(935) Settlement report cannot include both T0 trades and trades with CCP at the same time  
(936) Cancel on disconnect mode OFF"  
(937) Client code %12.12s must be used with this bank account  
(938) Transfer between bank accounts of different clearing members is not allowed  
(939) Clearing Member %12.12s is suspended  
(941) Clearing Bank Account suspended  
(943) Client specified in Client Code must be a bank  
(944) Client specified in Client Code must have the currency license  
(945) Subdetails value is required for the specified client code type  
(946) Invalid client code. Clientcode should have the following details for this bankacc: '%.20s'%s'%.20s'.  
(947) This bankacc linked to the client of the client of Clearing Member and can be used only when Clearing and Trading firms are the same firm"  
(948) Buy order #%ld accepted (open auction)  
(949) Sell order #%ld accepted (open auction)  
(950) Transaction rejected by trading system. Price move limits are not defined for that security  
(955) %12.12s trading is not allowed for the depacc %12.12s  
(956) Cash transfer #%ld accepted  
(957) Specified instrument is not cash  
(958) Asset is not accepted as collateral  
(959) Auction Price is not defined. Order rejected."  
(960) REPO rate for calculated REPO value %f can not be less than %.*f  
(961) REPO rate for calculated REPO value %f can not be more than %.*f  
(962) This function is available only for own trading accounts of authorized banks  
(963) Report for trades with different currencies denied  
(964) Risk Management rates are invalid for asset %12.12s  
(966) There are no active SMA Master Users. %d orders were canceled by Cancel-On-Drop-Copy-Disconnect.  
(967) There are no active SMA Master Users. Order rejected.  
(972) This security is not allowed to be traded by clients of the given type.  
(973) Fullcovered flag cannot be reset for this trading account.  
(974) Transfer of asset %12.12s for GC Pool %12.12s is not allowed.  
(975) Transfers that affect GC Pool trading accounts are only allowed between linked trading accounts.  
(976) Fullcovered limit for GC Pool trading account cannot be negative.  
(977) Orders with GC Pool cannot be entered using trdacc that is not linked to a pool trdacc.  
(978) Trades with GC Pool cannot be included in simple clearing report.  
(979) The transfer allowed only for linked accounts inside of one clearing bankacc.  
(980) Fullcovered flag cannot be reset for this bankacc.  
(982) Trading account at the stage of closing. Orders cannot be entered.  
(983) Transfer from bank account of a segregated protected client is not allowed  
(984) Price move limits are not set for security %12.12s. Market orders not allowed.  
(993) Invalid character in systemref - '%c'  
(996) Entering  
(997) Sell orders cannot be addressed to this counterparty.  
(998) Orders with this settlement code cannot be addressed to this counterparty.  
(999) Время для ввода заявок окончилось.  
(1000) The withdraw orders is prohibited in that stage.  
(1007) The maximum amount of funds available is %f  
(1008) The maximum quantity of securities available is %ld  
(1009) Invalid TranType Id  
(1010) User order limits table full  
(1011) User holding limits table full"  
(1012) User position limits table full  
(1013) User limit set successfully  
(1014) User limit updated successfully  
(1015) User security access table full  
(1016) User secuniq access table full  
(1017) User board access table full  
(1018) User access updated successfully. %d records updated.  
(1019) User access white list set successfully. Items in the list: %d.  
(1020) User access black list set successfully. Items in the list: %d.  
(1021) List too long. Max size is %d items.  
(1022) Exceeded the maximum order price limit. Maximum available price is %.2f.  
(1023) Exceeded the minimum order price limit. Minimum available price is %.2f.  
(1024) Exceeded the maximum order quantity limit. Maximum available quantity for order is %ld securities.  
(1025) Exceeded the maximum order value limit. Maximum available volume %.2f.  
(1026) Exceeded the maximum market order quantity limit. Maximum available quantity for order is %ld securities.  
(1027) Exceeded the maximum market order value limit. Maximum available volume %.2f.  
(1028) Exceeded the maximum day value limit. Maximum available volume %.2f.  
(1029) Exceeded the maximum planned position value limit for account. Maximum available volume %.2f.  
(1030) Exceeded the minimum planned position value limit for account. Maximum available volume %.2f.  
(1031) Exceeded the maximum planned long position limit for account. Maximum available quantity for order is %ld securities.  
(1032) Exceeded the maximum planned short position limit for account. Maximum available quantity for order is %ld securities"  
(1033) User clientcode table full  
(1034) User limit record not found"  
(1035) Maximum transaction rate exceeded"  
(1036) Security is not allowed  
(1037) Board is not allowed  
(1038) Security on the selected board is not allowed  
(1039) Transfer type is not allowed for settle code '%.12s'  
(1041) Position not found  
(1042) This option can be applied to SMA users only  
(1043) The field value must be greater than %f  
(1044) The field value must be greater than or equal to %f  
(1045) The field value must be less than %f  
(1046) The field value must be less than or equal to %f  
(1047) Exceeded the maximum/minimum order price limit. Reason: The legal current price undefined.  
(1048) User has open orders  
(1049) Orders with REPO value and discount are not allowed in this mode.  
(1050) Orders with quantity and discount are not allowed in this mode.  
(1052) Orders with quantity and REPO value are not allowed in this mode.  
(1053) Amount step for this order is %.2f  
(1059) Total Single Limit for Bank Account %12.12s breached: %.2f  
(1061) Only Fill Withdraw orders are allowed  
(1068) Transactions disabled. TradeEngine in synchronize state.  
(1069) Clearing system timeout.  
(1070) Clearing system not available.  
(1071) Clearing system connection already established  
(1072) Clearing system connection established  
(1076) Clearing System is suspended  
(1078) Clearing System Order table is full  
(1085) Minimum base price step: %.*f  
(1086) Market order is rejected by Risk Management System  
(1087) Order rejected. No connection to liquidity provider.  
(1090) The broker license of firm %12.12s was suspended  
(1091) The trust management license of firm %12.12s was suspended  
(1092) The dealer license of firm %12.12s was suspended  
(1093) For the selected trading mode you can only accept already submitted counter orders  
(1103) Password too short. Minimum length is %d characters.  
(1104) Password must contain at least three of: lower case  
(1105) Password mustn't contain %d or more repeating characters.  
(1106) Using one of old passwords is not allowed."  
(1107) Check executed successfully. Single Limit is not negative.  
(1108) Check executed successfully. All orders withdrawn. Single Limit is not negative.  
(1109) Password expires in %d day(s). Please change password!!!  
(1110) Password expired. Only password change available. Please change password and log in again!!!  
(1113) User blocked till %d:%.2d:%.2d.  
(1116) Request for trade conclusion is prohibited for settlement acccounts of the 'On behalf of clearing member' type  
(1117) All orders withdrawn. Single Limit is negative.  
(1118) Transaction is allowed only for the clearing model 'Clearing Broker'.  
(1119) The Clearing Member is not allowed to manage Level 3.  
(1120) Baseprice can not be specified for counterparty 'Any'  
(1122) Invalid client code of a clearing broker  
(1123) Invalid client code of a clearing member  
(1124) The client was found in a clearing firm's stop-list  
(1125) The specified participant is managed by another clearing member  
(1126) Transaction is allowed only for the clearing member  
(1127) Only Clearing Member for trade %ld may include the trade in report  
(1128) Transaction is not allowed with 1st level bank account  
(1129) Unable to accept deal. Invalid REPO value specified  
(1138) Second part of REPO may be early settled the next day after settle of the first part REPO  
(1139) Early settlement is allowed only for the second parts of addressed CCP REPO"  
(1143) Only orders with activation time are allowed on this board  
(1151) Only T+ settlement codes are allowed for requests for trade  
(1158) Only requests for trade are allowed for trading account without trading access  
(1159) Early settlement is not allowed for REPO  
(1161) Offers for the conclusion of OTC trades are available only for the Clearing Member  
(1162) OfferringQty cannot be set to a value  
(1163) Offers for the conclusion of OTC trades are not available for the Clearing Member with this clearing mode
