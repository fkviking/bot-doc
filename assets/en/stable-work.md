---
title: 5. Providing Feedback
section: 5
---

# Ensuring Informative Feedback from the Robot to the Trader via the Website Interface

With a high degree of robot autonomy, the website serves not only as a control tool for robots but also as the primary means of receiving feedback. During robot operation, situations undesirable for the trader and/or requiring the trader’s attention and actions may arise (e.g., removing expired financial instruments, deleting trading connections with invalid authentication data, etc.). These situations may be related to a specific portfolio or a specific connection.

To notify the trader about such situations, the website interface employs various mechanisms - partially duplicating each other—such as displaying pop-up notifications and creating entries in logs shown in the Robot `logs` and `Logs history` widgets. If a situation persists systematically over a certain period, it is escalated, and the user is shown a message that can only be dismissed by clicking a button. This behavior is designed to draw the trader’s attention to the issue.

We assume that any messages displayed on the site which do not disappear automatically and can only be closed by pressing a button will be read by the trader before dismissal. For this reason, the site does not include a "Mark all as read" button or similar mechanisms.

Our goal is to make robot-generated messages as informative as possible for the trader. We understand that there may be cases where identical robot messages become routine and cease to convey useful information. In a stream of such repetitive messages, the trader might miss those requiring immediate action. Since robots can use connections to dozens of exchanges, and portfolios may have different configurations and be customized with formulas, the problem of redundant, non-informative messages cannot be solved universally.

Nevertheless, traders can reduce the number of messages that carry no relevant information and do not require action. To achieve this, it is sufficient to follow these "best practices":

- Timely remove expired instruments from portfolios.
- Timely remove or set to `Disabled` trading connections that fail to connect due to authentication errors.
- Configure trading schedules for all portfolios by defining trading intervals and trading days.
- In case of frequent `REASON_FLOOD` errors, try resolving the issue by adjusting parameters in the `Anti "spam"` group.
- When using formulas, handle exceptions within the formula code.
