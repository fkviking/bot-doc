(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{279:function(t,o,s){t.exports=s.p+"assets/img/bot-scheme.dd3da835.svg"},312:function(t,o,s){"use strict";s.r(o);var _=s(13),r=Object(_.a)({},(function(){var t=this,o=t._self._c;return o("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[o("h1",{attrs:{id:"_2-введение",tabindex:"-1"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#_2-введение"}},[t._v("#")]),t._v(" 2. Введение "),o("Anchor",{attrs:{ids:["введение"]}})],1),t._v(" "),o("p",[o("img",{attrs:{src:s(279),alt:"Doc"}})]),t._v(" "),o("h2",{attrs:{id:"_2-1-краткое-описание-робота",tabindex:"-1"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-краткое-описание-робота"}},[t._v("#")]),t._v(" 2.1. Краткое описание робота "),o("Anchor",{attrs:{ids:["краткое-описание-робота"]}})],1),t._v(" "),o("p",[t._v("Данный робот может торговать несколькими одинаковыми алгоритмами. Один алгоритм, со всеми его настройками, далее будем называть портфелем. Каждый портфель робота должен содержать биржевые инструменты, которыми предполагается торговать или использовать их в расчётах. В портфеле может содержаться минимум один инструмент.")]),t._v(" "),o("p",[t._v("Один из инструментов портфеля должен быть отмечен признаком "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#is-first"}},[t._v("Is first")]),t._v(", такой инструмент будем называть главным или первой ногой портфеля. Инструменты портфеля, не отмеченные признаком "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#is-first"}},[t._v("Is first")]),t._v(", будем называть второй ногой портфеля. В каждом портфеле робота есть параметры, которые задаются на весь портфель, назовём их "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#параметры-портфеля"}},[t._v("параметры портфеля")]),t._v(". Кроме них в портфеле есть параметры, которые задаются отдельно для каждого из инструментов портфеля, будем называть их "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#параметры-инструментов-портфеля"}},[t._v("параметры инструментов портфеля")]),t._v(". Так же, для всего портфеля задаются "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#параметры-уведомлений"}},[t._v("параметры уведомлений")]),t._v(" (Notifications).")],1),t._v(" "),o("p",[t._v("Есть еще несколько параметров, которые задаются для каждого используемого инструмента каждого транзакционного подключения ("),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#параметры-позиций-по-инструментам"}},[t._v("параметры позиций по инструментам")]),t._v(" и "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#параметры-позиций-по-валютам"}},[t._v("параметры позиций по валютам")]),t._v("). Параметры делятся на редактируемые (т.е. собственно настройки) и отображаемые или расчётные (например, финансовый результат).")],1),t._v(" "),o("p",[t._v("Некоторые параметры портфеля и инструментов для большей гибкости могут быть заданы как формулы на "),o("RouterLink",{attrs:{to:"/docs/08-c-api.html#c"}},[t._v("Языке программирования C++")]),t._v(".")],1),t._v(" "),o("p",[t._v("Для каждого из портфелей робота можно выбрать "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#p.portfolio_type"}},[t._v("Type")]),t._v(" используемого алгоритма. Основной алгоритм робота арбитражный. Цена заявок на покупку и продажу по главному инструменту в общем случае рассчитывается на основе цен других инструментов портфеля. Поддерживается работа в двух режимах. В режиме котирования (флаг "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#p.quote"}},[t._v("Quote")]),t._v(" взведен) после включения торговли на покупку и продажу, в стакане по главному инструменту портфеля держатся заявки на покупку и продажу соответственно. Котирующая заявка переставляется при выполнении определенных условий, например, при отклонении цены выставленной заявки от расчетной цены. Если котирование отключено, то заявки по главному инструменту выставляются при появлении сигнала (выполнении определенного условия).")],1),t._v(" "),o("p",[t._v("Заявки по инструментам второй ноги выставляются после прохождения сделки по первой ноге. Направление заявок по инструментам второй ноги определяется направлением сделки по первой ноге, а также значением параметра "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#on-buy"}},[t._v("On buy")]),t._v(" соответствующего инструмента.")],1),t._v(" "),o("p",[t._v("Робот может быть настроен как на выставление заявок второй ноги после прохождения каждой сделки по первой ноге, так и на более редкое выставление заявок по второй ноге. Объем для выставления по каждому инструменту (бумаге) второй ноги вычисляется исходя из текущей позиции портфеля по первой ноге и значения параметра "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#count"}},[t._v("Count")]),t._v(' обеих бумаг таким образом, чтобы отношение "новой" позиции текущей бумаги (которая будет после прохождения сделки по еще невыставленной, но выставляемой в данный момент заявке) к позиции первой ноги было равно отношению значения параметра '),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#count"}},[t._v("Count")]),t._v(" второй ноги к значению параметра "),o("RouterLink",{attrs:{to:"/docs/05-params-description.html#count"}},[t._v("Count")]),t._v(' первой ноги. Причем, если при определении "новой" позиции по бумаге в портфеле есть неисполненные заявки, то исходим из того, что они будут полностью сведены в сделку.')],1),t._v(" "),o("p",[t._v("Все заявки, выставляемые роботом, являются лимитными котировочными на всех поддерживаемых биржах.")]),t._v(" "),o("h2",{attrs:{id:"_2-2-краткое-описание-интерфеиса",tabindex:"-1"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-краткое-описание-интерфеиса"}},[t._v("#")]),t._v(" 2.2. Краткое описание интерфейса "),o("Anchor",{attrs:{ids:["краткое-описание-интерфейса"]}})],1),t._v(" "),o("p",[t._v("Основная страница интерфейса представлена набором таблиц-виджетов, которые расположены в выпадающем списке "),o("code",[t._v("Widgets")]),t._v(". Все виджеты могут быть открыты и закрыты в любом количестве и порядке, кроме виджета "),o("code",[t._v("Robot logs")]),t._v(", который открыт всегда.")]),t._v(" "),o("p",[t._v('Во время работы робота могут возникать различные "ошибки" при выставлении и удалении заявок, такие ситуации не являются нештатной работой робота и могут быть вызваны причинами, не связанными с некорректной работой торгового робота, например, отсутствием денег на счете клиента. Все "ошибки" и еще некоторую информацию, связанную с работой программы, можно посмотреть в виджете '),o("code",[t._v("Robot logs")]),t._v('. Некоторые слишком часто приходящие сообщения будут отображаться в таблице не все, а 1 раз в 10 секунд и будут отмечены в конце сообщения символом xN, где N - количество не показанных сообщений. Некоторые приказы, которые заведомо будут отклонены биржей, на биржу не отправляются. Такие "ошибки" помечены постфиксом "_LOCAL".')]),t._v(" "),o("p",[t._v("Исторические логи можно посмотреть, используя виджет "),o("code",[t._v("Robot logs history")]),t._v(". В настройках виджета можно выбрать один из предложенных периодов: сегодня, вчера, 5 дней, неделя, 10 дней, месяц или задать интересующий период самостоятельно с точностью до минуты.")]),t._v(" "),o("p",[t._v("В виджетах "),o("code",[t._v("Robot logs")]),t._v(", "),o("code",[t._v("Robot logs history")]),t._v(", "),o("code",[t._v("Financial result for today")]),t._v(", "),o("code",[t._v("Finres history")]),t._v(", "),o("code",[t._v("Deals for today")]),t._v(", "),o("code",[t._v("Deals history")]),t._v(" отображается локальное время пользователя.")]),t._v(" "),o("p",[t._v("В основном интерфейсе робота есть функционал важных сообщений, которые показываются в виде модального окна, блокирующего взаимодействие пользователя с сайтом до подтверждения им кнопкой, что он ознакомился с сообщением. Сообщение появляется в момент отправки. Если в момент отправки пользователь был offline, то при ближайшем входе в приложение.\nЕсли какое-то сообщение приходит в лог не реже, чем каждые 20 секунд и длится 10 минут, то пользователь получит об этом сообщение. Такое сообщение всплывает поверх всех окон и держится до тех пор, пока пользователь не нажмет ok. Первоначальный таймаут для получения такого сообщения 10 минут, потом 30 минут, 1 час, 3 часа и 6 часов, затем снова 10 минут и т.д.\nСписок отправленных сообщений также доступен для просмотра в меню "),o("code",[t._v("Notification")]),t._v(" в личном кабинете пользователя под иконкой справа сверху.")]),t._v(" "),o("p",[t._v("Стоит заметить, что все виджеты настраиваемые. Можно менять местами столбцы, регулировать их ширину, а так же скрывать ненужные "),o("code",[t._v("Columns")]),t._v(". Возможно одновременное открытие нескольких одинаковых виджетов с использованием в них разных настроек. Настроенное рабочее пространство можно сохранить в "),o("code",[t._v("Workspaces")]),t._v(" и позже загружать его на другие устройства. Также есть возможность экспорта и импорта "),o("code",[t._v("Workspaces")]),t._v(" через файл. Это позволяет пользователям с несколькими ролями перенести настроенные "),o("code",[t._v("Workspaces")]),t._v(" из одной роли в другую.")]),t._v(" "),o("p",[t._v("Для начала работы с роботом необходимо активировать нужные подключения для получения маркет-даты и добавить необходимые транзакционные подключения.\nМаркет-дата подключения активируются в виджете "),o("code",[t._v("Data connections")]),t._v(". Транзакционные подключения добавляются в виджете "),o("code",[t._v("Trade connections")]),t._v(". Для создания портфеля необходимо выбрать виджет "),o("code",[t._v("Portfolios table")]),t._v(".")])])}),[],!1,null,null,null);o.default=r.exports}}]);