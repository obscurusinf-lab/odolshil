# Одолжил / Owly

Одна задача: помнить, кому и что ты отдал, и напомнить забрать. Всё офлайн —
без аккаунта, без сервера, без синхронизации. Полное ТЗ — в задаче, из которой
выросла эта сессия; здесь — состояние кода.

**Название разное по рынкам:** «Одолжил» — для RuStore/RU-аудитории, **Owly**
— для App Store/международной аудитории (было "Lent", отказались — это ещё и
название христианского поста, плохо для англоязычной выдачи). Технически это
одно приложение: `t('app.name')` уже переключается по языку сам
(`src/i18n/translations.ts`), а `app.json → ios.infoPlist.CFBundleDisplayName`
задаёт "Owly" как подпись под иконкой на iOS отдельно от общего `name`,
которое остаётся «Одолжил» (и определяет ярлык на Android/RuStore). Само
название в сторе (App Store Connect / RuStore Консоль) настраивается отдельно
при первой публикации — в коде это не хранится.

## Стек

Expo SDK 57, TypeScript, expo-router (file-based навигация), expo-sqlite,
expo-notifications, expo-contacts, expo-image-picker, expo-file-system,
react-native-iap (iOS) + react-native-rustore-billing (Android/RuStore),
react-native-gesture-handler + reanimated (свайп «Вернули»).

## Запуск

```sh
npm install
npx expo start          # для быстрых итераций по UI без нативных модулей
```

SQLite, уведомления, контакты, фото и обе платёжные SDK — нативный код,
которого нет в Expo Go. Для полноценного запуска нужен dev client:

```sh
npx expo prebuild                 # генерирует android/ и ios/ (в .gitignore, не коммитятся)
npx expo run:android              # или run:ios — требует Android Studio / Xcode
# либо через облако, без локального тулчейна:
eas build --profile development --platform android
```

## Что проверено в этой сессии

Песочница, в которой писался код, — без Android SDK, без эмулятора/устройства,
без Xcode, без аккаунтов Apple Developer/RuStore Console. Поэтому проверено
то, что можно проверить без них:

- **`tsc --noEmit`** — чисто по всему проекту.
- **`npx expo export --platform android`** и **`--platform ios`** — оба бандла
  Metro собираются без ошибок (весь граф импортов резолвится, платформенные
  файлы `.ios.ts`/`.android.ts` подключаются как надо).
- **`npx expo prebuild`** для обеих платформ проходит чисто — конфиг-плагины
  (expo-router, expo-sqlite, expo-notifications, expo-image-picker,
  expo-contacts, expo-build-properties) не падают. Проверено, что генерируемый
  `AndroidManifest.xml` получает intent-filter на scheme `odolshil` — это то,
  что требует RuStore Billing SDK для диплинков возврата из SberPay/СБП.
- **SQL-слой** (`src/db/migrations.ts`, `src/db/items.ts`) прогнан против
  `node:sqlite` с тестовыми данными: сортировка (просроченные сверху, самые
  просроченные — первые, дальше по возрастанию срока, бессрочные — в конце),
  фильтрация по направлению и по архиву, upsert в `settings` — всё ведёт себя
  как задумано (см. историю сессии, тестовый скрипт не коммитился).

## Что НЕ проверено — нужен человек с устройством и консолями

Это не «доделать мелочи», это ровно то, что нельзя было проверить в песочнице
без выхода за её пределы:

1. **RuStore Billing SDK** (`src/iap/useIap.android.ts`,
   `react-native-rustore-billing`). Пакет официальный
   (rustore-dev/react-native-rustore-billing-sdk), установлен из GitHub-зеркала
   (у gitflic.ru, откуда пакет ставится по инструкции из README, нет доступа
   из песочницы) и **собран локально** (`lib/commonjs`, `lib/module` —
   сгенерированы вручную через `react-native-builder-bob`, потому что в
   репозитории нет `tsconfig.build.json` для автогенерации типов; типы описаны
   вручную в `src/types/react-native-rustore-billing.d.ts` по README пакета).
   Дальше нужно: завести приложение в консоли RuStore, подставить
   `consoleApplicationId` в `useIap.android.ts` (сейчас там плейсхолдер),
   завести non-consumable продукт `odolshil_full_version`, собрать dev client
   и пройти покупку на реальном Android-устройстве с установленным RuStore.
   **Если сборка не пойдёт за разумное время** — запасной вариант из ТЗ уже
   заложен в архитектуре: `iap.state.unavailable` отключает кнопку покупки, и
   версию для RuStore можно просто выпустить платной без начинки IAP.
2. **iOS IAP** (`src/iap/useIap.ios.ts`, `react-native-iap`). Библиотека v16
   активно меняет форму API между минорными версиями и требует Nitro Modules
   + dev client — типы объявлены как `any` намеренно
   (`src/types/react-native-iap.d.ts`), чтобы не утверждать точную сигнатуру
   `useIAP`/`requestPurchase`, которую нельзя перепроверить без macOS/Xcode.
   Перед релизом: сверить актуальный API на openiap.dev, завести
   non-consumable `odolshil_full_version` в App Store Connect, пройти покупку
   в песочнице StoreKit.
3. **Локальные уведомления на устройстве** — код (`src/notifications/index.ts`)
   написан по документации `expo-notifications`, но реальное планирование,
   срабатывание в фоне и сверка при старте не наблюдались вживую.
4. **Иконка, сплэш, скриншоты** — сейчас в `assets/` лежат заглушки из
   дефолтного шаблона Expo. Нужен реальный дизайн под тему («гроссбух», см.
   ниже) и скриншоты под требования обеих консолей.
5. **EAS-проект** — `eas.json` с профилями `development`/`preview`/`production`
   готов, но `eas init`/`eas build:configure` не запускались (нужен
   залогиненный Expo-аккаунт), поэтому в `app.json` нет `extra.eas.projectId`.

## Палитра и типография

Первая версия («Гроссбух», тёплый графит/бумага с одним кирпичным акцентом)
пересмотрена по итогам ревью — владелец не принял тёплый рыжий тон. Текущая
схема (`src/theme/palette.ts`):

- **Фон и поверхности — чистый нейтральный серый**, без тёплого оттенка, в
  обеих темах. Никаких одинаковых карточных теней — границы в один пиксель.
- **Цвет несёт только статус срока**, не бренд: просрочено — плоский красный
  бейдж (`colors.danger`/`dangerInk`, `#A82A1E`), до срока — приглушённый
  обесцвеченный зелёный бейдж (`colors.success`/`successInk`, `#5F7A68`).
  Бейдж рисуется в `ItemCard` рядом с заголовком; если срока нет — простой
  серый текст, без бейджа.
- **Кнопки, ссылки, FAB, счётчик «Просрочено» — монохромные** (`colors.ink`
  на `colors.background`/`colors.surfaceRaised`), никакого третьего
  «брендового» акцента поверх статусных цветов. `dangerText` — тот же
  красный, но подобранный для текста/рамки (не заливки): используется в
  ошибке валидации формы и в подписи «Просрочено» над списком.
- **Табличные цифры** (`fontVariant: tabular-nums`, `src/theme/typography.ts`)
  для дат и сумм по-прежнему в силе — не «гуляют» по ширине при обновлении
  списка.
- Системные шрифты, без загрузки лишних ассетов — решение не пересматривалось.

## Структура

```
app/                    — экраны (expo-router, file-based routing)
  index.tsx             — список, вкладки Отдал/Взял
  item/[id].tsx          — добавление/редактирование ("new" — создание)
  archive.tsx, settings.tsx, paywall.tsx, privacy.tsx
src/
  db/                   — schema_version, migrate(), CRUD для items/settings
  notifications/        — планирование, отмена, сверка при старте
  iap/                  — общий интерфейс покупки + useIap.ios.ts/useIap.android.ts
  i18n/                 — ru/en, определение языка по системе + ручной выбор
  theme/                — палитра, типографика, ThemeProvider (light/dark)
  components/, hooks/, utils/
```

## Лимит и покупка

5 активных записей бесплатно (`src/constants.ts`), архив и просмотр не
ограничены никогда. Флаг покупки — в таблице `settings`, синхронизируется с
`getPurchases()`/`useIAP` при каждом запуске экрана настроек/пейвола.

## Приватность

Текст — в `app/privacy.tsx` (ru/en в `src/i18n/translations.ts`): данные не
покидают устройство, аналитики нет, единственный сетевой вызов — проверка
покупки.
