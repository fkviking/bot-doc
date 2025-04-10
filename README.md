# Как вести работу с документацией

### Документация должна располагаться в папке `assets`

Заголовки нумеровать не надо, они автоматически сгенерируются на основе markdown разметки:

```
#   -> 1.
##  -> 1.1.
### -> 1.1.1.
##  -> 1.2.
### -> 1.2.1.
### -> 1.2.2.
...
```


### При создании раздела, обязательно указывать meta-данные в начале `.md` файла:

```yaml
---
title: 1. История изменений
section: 1
ignore-section-number: true
---
```
> где:
>- `title` - Заголовок раздела, который будет отображен в сайдбаре документации
>- `section` - Номер раздела, этот номер будет учитываться при генерации номеров заголовков
>- `ignore-section-number` - опциональное поле, можно либо вовсе не указывать его, либо указывать `false`. Если оно `true` - в этом файле не будет генерироваться нумерация, а просто файл будет использован как есть

**При изменении порядка раздела нужно будет обновить meta-данные изменяемого раздела**

### Для обращения к папке с картинками писать путь `@images/{имя подпапки?}/{имя картинки.формат}`:

```md
[Viking robot scheme](@images/bot-scheme.svg)
[Settings icon](@images/icons/settings.svg)
```

### Для ссылки на документацию указывать имя файла в формате `.md` или `.html`:

```md
1 вариант: 05-params-description.md     // <--- предпочтительнее использовать .md
2 вариант: 05-params-description.html  
```
> если указать формат `.md`, тогда в среде разработки возможны подсказки ссылок по заголовкам

### При генерации, для каждого заголовка будет сгенерирован свой `slug` и добавлен `<Anchor :ids="[slug]" />`

### Чтобы ссылаться на заголовки документации, можно использовать правило преобразования заголовка в slug:
```md
Пробелы станут тире. А буквы станут строчными <-> пробелы-станут-тире.-а-буквы-станут-строчными
```
 *Например,  `Подписка на список доступных портфелей`, станет  `подписка-на-список-доступных-портфелей`*
  
```md
# Описание параметров                   <-- 05-params-description.md#описание-параметров
## Параметры транзакционных подключений <-- 05-params-description.md#параметры-транзакционных-подключений
#### Conn type                          <-- 05-params-description.md#conn-type
```

### Для запуска на локальной машине

To install packages
```
yarn install
```

To start test server
```
NODE_OPTIONS=--openssl-legacy-provider yarn run dev
```
