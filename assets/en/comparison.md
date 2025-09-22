---
title: 12. Comparison of C++ Formulas and WebSocket API
section: 12
---

# Comparison of C++ Formulas and WebSocket API

Extending the robot's functionality is possible in two ways: using [С++ формул](c-api.md#cpp) or the [WebSocket API](api.md#api). These are different mechanisms designed for different purposes, although they share some similarities. For user convenience, the table below compares [С++ формул](c-api.md#cpp) and [WebSocket API](api.md#api) across several key parameters.

|FEATURE|[С++ FORMULAS](c-api.md#cpp)|[WEBSOCKET API](api.md#api)|
|---|---|---|
|Programming Language|C++|Any programming language. It is recommended to use high-level languages with standard libraries for WebSocket protocol support|
|Capabilities|Limited. There are restrictions on formula source code length. You can retrieve financial instrument data and modify certain portfolio parameters. [пользовательские поля](params-description.md#p.user_fields), not used in the main algorithm, are provided for use in formulas. File system access and network operations (e.g., socket creation) are prohibited. Time-consuming operations are strongly discouraged. No access to external data sources (databases, Excel sheets, etc.) is possible|Full. You can automate everything available through the platform’s web interface. No architectural limitations or restrictions on using external data sources
|Interactions Between Portfolios|Possible only between portfolios within the same robot, and only if the accessed portfolios have the [Shared formulas](params-description.md#p._sh_f) flag enabled|One application can interact with all available portfolios regardless of which robot they belong to|
|Execution Method|Native code, compiled into a dynamically loaded library that runs in the same thread as the robot’s main algorithm|Separate application running on an external server|
|Impact on Robot Performance|Can slow down the robot, as formulas are an integral part of the main algorithm and run in the same thread|No impact on robot performance, as calculations occur independently and in parallel|
|Data Access Speed|Formulas are recalculated immediately after any order book update triggers the main pricing calculation. No rate limits apply to data accessible within formulas|Requires sending explicit requests to get or modify data; subject to [ограничения](api.md#api.rate_limits) . When subscribed to data updates, the server sends changes in batches at a [определенной частотой](api.md#api.updates_rate) , not on every change|
|Fault Tolerance|Errors in formulas can cause the entire robot to crash|A crash in the external application affects only its own calculations; the robot continues trading according to its internal logic and last received parameters. Note that automation via WebSocket carries the risk of connection loss — in such cases, the robot will continue trading with the last applied settings

