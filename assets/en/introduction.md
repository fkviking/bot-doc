---
title: 2. About the Platform
section: 2
---

# About the Platform

![Doc](@images/bot-scheme-en.svg)

## Platform Overview

In simplified terms, the platform consists of trading robots and a system for managing them. From the client's perspective, the robot management system includes the API and the website [https://bot.fkviking.com/](https://bot.fkviking.com/).  The API is the only programmatic interface that enables communication between the user and the robots. The website [https://bot.fkviking.com/](https://bot.fkviking.com/) uses the same API available to third-party developers for implementing their own custom user interfaces. The platform implements a user permission system by assigning specific roles to each user. Access to the platform via the API or website is governed by restrictions imposed by the role under which authentication is performed. It is assumed that each user has only one account on the platform, as the role-based model allows simultaneous access to multiple robot portfolios, even if the robots belong to different companies. Below are the system requirements for client devices, along with brief descriptions of the robot, the website interface, and the role-based model.

## System Requirements <Anchor :ids="['requirements']" />

The primary means of interaction between users and robots is the website [https://bot.fkviking.com/](https://bot.fkviking.com/). The site is available in desktop and mobile versions. Although the mobile version provides functionality close to the desktop version, it is less convenient due to the limitation of displaying only one widget at a time. Simultaneous display of multiple widgets in the desktop version requires transmitting and storing large amounts of data. Therefore, it is recommended to use the desktop version on a computer meeting the following requirements:

- A processor with at least four cores (not below Intel Core i3-10100 or AMD Ryzen 3 3100);
- At least 8 GB of RAM;
- Internet connection speed of no less than 30 Mbps;
- An up-to-date version of a modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Opera) with JavaScript enabled and ad/script blockers disabled (the Viking platform does not contain ads, but such extensions may negatively affect page performance);
- Firewall must allow access to the website [https://bot.fkviking.com/](https://bot.fkviking.com/).

Note that these requirements assume a scenario where only one browser window with a single tab open to [https://bot.fkviking.com/](https://bot.fkviking.com/) is running, and the entire internet bandwidth is dedicated to data exchange between the site and the server. If multiple instances (browser tabs) of our site are used, if the internet connection is shared among multiple devices and/or applications, or if other resource-intensive applications (trading terminals, spreadsheets, video players, computer games, etc.) are running in parallel, the overall system requirements increase. Additionally, using VPN or proxy servers may reduce the effective internet channel bandwidth. The requirements listed above are recommended; it is possible to use the desktop version on a computer that does not meet these specifications, but in such cases, the interface may experience "freezing" when interacting with certain widgets.

## Brief Description of the Robot

Each robot can trade multiple identical algorithms. An algorithm, along with all its settings, will hereafter be referred to as a portfolio. Each robot's portfolio must contain the financial instruments intended for trading or for use in calculations. A portfolio must contain at least one instrument, and all instruments within a portfolio are unique.

One of the instruments in the portfolio must be marked with the [Is first](params-description.md#is-first) flag; this instrument will be referred to as the main instrument or the first leg of the portfolio. Instruments in the portfolio not marked with the [Is first](params-description.md#is-first) flag will be referred to as the second leg of the portfolio. Each robot's portfolio has parameters that apply to the entire portfolio; these are called [portfolio parameters](params-description.md#параметры-портфеля).
 In addition, there are parameters set individually for each instrument in the portfolio; these are called [instrument-specific portfolio parameters](params-description.md#параметры-инструментов-портфеля).
Also defined for the entire portfolio are [notification parameters](params-description.md#параметры-уведомлений) (Notifications).

There are several additional parameters set for each instrument on every transaction connection ([instrument position parameters](params-description.md#параметры-позиций-по-инструментам) and [currency position parameters](params-description.md#параметры-позиций-по-валютам)).
Parameters are divided into editable ones (i.e., actual settings) and display-only or calculated ones (e.g., financial result).

For greater flexibility, certain portfolio and instrument parameters can be defined as formulas written in the [ C++ programming language](c-api.md#c).

For each of the robot's portfolios, you can select the [Type](params-description.md#p.portfolio_type) of the algorithm to be used. The robot’s primary algorithm is arbitrage-based. Bid and ask prices for the main instrument are generally calculated based on the prices of other instruments in the portfolio. Two operating modes are supported. In quoting mode (the [Quote](params-description.md#p.quote) flag is enabled), after trading is activated, bid and ask orders are maintained in the order book for the portfolio's main instrument. The quoting order is moved when certain conditions are met, such as when the price of the placed order deviates from the calculated price. If quoting is disabled, orders for the main instrument are placed only upon receiving a signal (i.e., when a specific condition is satisfied).

Orders for second-leg instruments are placed after a trade is executed on the first leg. The direction of orders for second-leg instruments is determined by the direction of the trade on the first leg and the value of the [On buy](params-description.md#on-buy) parameter of the corresponding instrument.

The robot can be configured either to place second-leg orders after every first-leg trade, or to place them less frequently. The volume for placing an order on each second-leg financial instrument is calculated based on the current portfolio position on the first leg and the [Count](params-description.md#count) parameter values of both financial instruments, such that the ratio of the "new" position of the given financial instrument (which will exist after execution of the yet-to-be-placed, but currently being submitted, order) to the first-leg position equals the ratio of the [Count](params-description.md#count) parameter of the second leg to the [Count](params-description.md#count) parameter of the first leg. When determining the "new" position for a financial instrument in the portfolio, any outstanding unexecuted orders are assumed to be fully filled.

All orders placed by the robot are limit quote orders on all supported exchanges.

## Brief Description of the Interface

The main interface page consists of a set of table-widgets located in the dropdown menu `Widgets`. All widgets can be opened and closed in any quantity and order, except for the `Robot logs` widget, which is always open and only one instance is allowed. 

During robot operation, various "errors" may occur when placing or canceling orders. Such situations are not considered abnormal robot behavior and may be caused by factors unrelated to incorrect robot operation—for example, insufficient funds in the client's account. All "errors" and additional program-related information can be viewed in the `Robot logs` widget. Some messages that arrive too frequently will not be displayed individually; instead, they will appear once every 10 seconds and will be marked at the end with the suffix xN, where N is the number of grouped messages not shown. Certain commands that would inevitably be rejected by the exchange are not sent to the exchange at all. Such "errors" are marked with the postfix `_LOCAL`.

Historical logs can be viewed using the `Robot logs history` widget. In the widget settings, you can select one of the predefined periods: today, yesterday, 5 days, week, 10 days, month—or manually specify a custom period with minute precision.  

The widgets `Robot logs`, `Robot logs history`, `Financial result for today`, `Finres history`, `Deals for today`, `Deals history`, and `Trade connections orders` display the user's local time.

The main robot interface includes an important messaging feature that displays messages as modal windows, blocking user interaction with the site until the user confirms via a button that they have read the message. If the user is online, the message appears immediately after being sent. If the user is offline, the message will appear upon their next login. If a particular message occurs no less than once every 20 seconds and continues for 10 minutes, the user will receive a popup notification about it. This type of notification appears on top of all other windows and remains visible until the user clicks `ok`, confirming they have read it. The initial timeout for receiving such a notification is 10 minutes, then 30 minutes, 1 hour, 3 hours, and 6 hours, after which it resets back to 10 minutes, and so on. The list of sent notifications is also available for viewing in the `Notifications` menu in the user's personal cabinet under the icon in the upper-right corner.

Note that all widgets are customizable. Column order can be changed, column widths adjusted, and unnecessary columns hidden via `Columns`. It is possible to open multiple instances of the same widget with different settings. The configured workspace can be saved in `Workspaces` and later loaded on other devices. Additionally, there is functionality to export and import `Workspaces` via file. This allows users with multiple roles to transfer configured `Workspaces` from one role to another.

To begin working with the robot, you must activate the required data connections for market data and add necessary transaction connections. Market data connections are activated in the `Data connections` widget. Transaction connections are added in the `Trade connections` widget. To create a portfolio, use the `Portfolios table` widget.

## Brief Description of the Role Model <Anchor :ids="['roles']" />

The platform uses a role-based access control model to manage user permissions. To understand this model, certain entities must first be defined and their relationships clarified. In addition to the robot, portfolio, and user, the entity "company" is introduced. This entity serves as the binding point for robots—that is, a robot is created for a specific company and belongs to it thereafter. Creating a robot without specifying a company is not possible. A portfolio is created by a user within a specific robot. The user who creates the portfolio becomes its owner (creator) and automatically gains rights to that portfolio. Thus, a user has rights to all portfolios they have created within a given robot. Access to a portfolio created by a user can only be revoked together with access to the robot.

Upon registration, a user automatically receives the `Demo` role in the `public` company. This is a special role and a special company; under this role in this company, only free robots with virtual trading are available. The `Demo` role is not available in other companies. All other roles are assigned to a user within a specific, already "real" company. A user may hold the same role across multiple companies, and within each company, they may have one or several roles. Currently, besides the `Demo` role, there exist the roles `Trader`, `Head of traders`, and `Head view only`. The `Trader` role is intended solely for executing trading operations. Under the `Head of traders` role, both trading and administrative operations can be performed. Under the `Head view only` role, a user can view trading and administrative information but cannot edit it. After a trader is added to a company under the `Trader` role, the `Head of traders` may grant them access to one or more robots and one or more portfolios. A single robot may be accessible to multiple users with the `Trader` role. A user under the `Trader` role has access only to those portfolios of the robots available to them for which they are the owner (creator), and to those portfolios to which explicit access has been granted by the `Head of traders`.

The `Head of traders` can assign roles to themselves and other users within the company where they hold the `Head of traders` role. Subsequently, they can grant access to robots and portfolios to users who have the `Trader` role in that company. The `Head of traders` has access to all robots and portfolios within the company.

The `Head view only` role is a read-only counterpart of the `Head of traders` role. Under this role, the same data is visible as under `Head of traders`, but modifications are prohibited. Under the `Head view only` role, a user can edit only their own user settings.

Thus, robots are no directly linked to users, but rather connected through an intermediate layer—the company: robots belong to a company, and users receive roles within the company, based on which they may be granted access to robots and portfolios belonging to that company.

During authentication, the user specifies the role under which they are logging in. Authentication occurs under a role without explicitly specifying a company—i.e., after login, the user will gain access according to the selected role across all companies where this role has been assigned to them.
