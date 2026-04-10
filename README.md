# Interview App

Angular 20 приложение для платформы собеседований.

## Возможности

- Аутентификация через IdentityServer (OIDC)
- Главная страница со слоганом "Собеседования без обязательств"
- Информация о пользователе (для авторизованных)
- Возврат по Return URL после логина

## Структура проекта

```
src/
├── app/
│   ├── components/
│   │   └── top-nav/          # Верхнее меню
│   ├── guards/
│   │   └── auth.guard.ts     # Guard для защиты маршрутов
│   ├── pages/
│   │   ├── home/             # Главная страница
│   │   ├── user-info/        # Информация о пользователе
│   │   └── callback/         # Callback для OIDC
│   ├── app.component.ts      # Корневой компонент
│   └── app.routes.ts         # Маршрутизация
├── assets/
├── styles.css                # Глобальные стили
├── main.ts                   # Точка входа
└── index.html
```

## Настройка IdentityServer

Отредактируйте `src/main.ts` и укажите параметры вашего IdentityServer:

```typescript
provideAuth({
  config: {
    authority: 'https://your-identity-server.com',
    clientId: 'interview-app',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
  },
}),
```

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm build
```

## Маршруты

| Путь | Описание | Доступ |
|------|----------|--------|
| `/` | Главная страница | Все |
| `/user-info` | Информация о пользователе | Авторизованные |
| `/callback` | OIDC callback | Все |
