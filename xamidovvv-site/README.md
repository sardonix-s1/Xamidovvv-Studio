# XAMIDOVVV

Сайт студии: Next.js 14 (App Router) + Supabase (отзывы, контакты, админка). Языки EN / RU / UZ.

## Запуск локально
```bash
npm install
cp .env.example .env.local   # впиши ключи Supabase (можно оставить пустыми: сайт работает, отзывы выключены)
npm run dev                  # http://localhost:3000
```

## Supabase (по желанию, нужен для отзывов и контактов)
1. Создай проект на supabase.com.
2. SQL Editor: вставь и выполни `supabase/schema.sql`.
3. Authentication -> Providers -> Email: **выключи Sign ups** (иначе кто угодно сможет зарегистрироваться).
4. Authentication -> Users -> Add user: создай себя (email + пароль). Это единственный админ.
5. Project Settings -> API: скопируй `Project URL` и `anon public` key.

## Деплой на Vercel
1. Залей проект в GitHub, на vercel.com: Add New -> Project -> выбери репозиторий.
2. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.

## Как это работает
- `/` отдаёт страницу (`components/markup.ts` + `public/site.js`); контакты и одобренные отзывы подтягиваются из Supabase раз в минуту.
- `/admin` вход по email и паролю: одобрить, отклонить или удалить отзывы, изменить ссылки (Telegram, канал, Instagram, TikTok, телефон).
- Отзыв с сайта попадает в статус `pending` и появляется на сайте только после одобрения.
- Защита формы: проверка полей на сервере, ссылка только http(s), скрытое поле-ловушка, лимит частоты, RLS в базе.

## Что где менять
- Тексты и переводы, стили, услуги, шаги: `public/site.js` (словари `T`, `STYLES`, `SERVICES`, `STEPS`).
- Вёрстка секций: `components/markup.ts`. Стили: `app/globals.css`.
- Иллюстрации: `public/img/*.jpg` (замени на свои, размер 760x475).
- Логотип: путь в SVG внутри `components/markup.ts` (вектор, трассированный с оригинала). Лучше заменить на оригинальный SVG.
- Заголовок и описание сайта: `app/layout.tsx`.
