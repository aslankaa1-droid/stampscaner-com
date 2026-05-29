# StampScaner — лендинг (локальный макет)

Премиум-лендинг для проекта **StampScaner** Аслана Каа.
Стек: vanilla HTML + CSS + минимум JS (как у `aslankaa.com`, `sintem.app`, `dpfsd.ru`).

## Структура

```
_landing_local/
├── index.html                    # главная страница (RU/EN/AR)
├── css/style.css                 # дизайн-система + 3 темы (Light/Sepia/Dark)
├── js/app.js                     # i18n, тема, валюта, мобильное меню
├── i18n/
│   ├── ru.json
│   ├── en.json
│   └── ar.json
├── cert/                         # реестр сертификатов (пустой пока)
├── img/                          # картинки (пока пусто, SVG inline)
└── README.md
```

Языки: 3 готовы (RU, EN, AR — приоритет по решению 5 стратсинтеза).
FR и CN — добавлю на следующей итерации.

## Локальный запуск

Из `_landing_local/`:

```bash
# любой статический сервер, например:
python -m http.server 8000
# или
npx serve .
# или Bun
bunx serve .
```

Открыть в браузере: http://localhost:8000

## Что готово

- Премиум-дизайн-система: палитра (бургунди + кремовый + матовое золото), типографика (Cormorant Garamond + Inter), 3 темы.
- Главная страница: Hero, Услуги, Postman, Сертификат (макет), Тарифы (USD/RUB переключатель), Доверие, Об основателе, CTA, Footer.
- i18n с переключением языков на лету (RU/EN/AR), RTL для арабского.
- Темы Light / Sepia / Dark (Dark — auto при `prefers-color-scheme: dark`).
- Sticky header, мобильное меню, fade-up анимация при скролле.
- Виджет Postman — placeholder с заглушкой (полная интеграция в Спринте 2).
- Дисклеймер про независимость от UPU/Scott/SG/Michel/Yvert/Colnect/StampWorld/Philately.ru.
- Без форм / без GA / без Метрики — соответствует правилу 152-ФЗ для публичных сайтов Аслана.
- Контакты: mailto / Telegram / WhatsApp.

## Что нужно от Аслана

1. **Подтвердить дизайн** — посмотреть локально, сказать что нравится / что переделать.
2. **Зарегистрировать домен** `stampscaner.com` на reg.ru.
3. **Макет сертификата** (фирменный бланк) — рисунок или PDF, как обещал в ТЗ. Если нет — сделаю 2–3 варианта дизайна сам и предложу.
4. **Сгенерировать Ed25519-ключ** для подписи сертификатов (могу через ssh-keygen / openssl). Приватная часть остаётся на aslankaa, публичная — на сайте.
5. **Контактные данные для контактной секции** — официальный Telegram-handle, WhatsApp-номер (сейчас в коде placeholder `https://wa.me/79000000000`).

## Деплой на GitHub Pages (следующий шаг)

```bash
# создать репозиторий
gh repo create aslankaa1-droid/stampscaner-com --public --description "StampScaner premium landing"

# из _landing_local/
git init
git add .
git commit -m "Initial premium landing — Sprint 1.1"
git branch -M main
git remote add origin git@github.com:aslankaa1-droid/stampscaner-com.git
git push -u origin main

# включить Pages
gh api -X PATCH repos/aslankaa1-droid/stampscaner-com/pages -F source.branch=main -F source.path=/

# домен (после регистрации stampscaner.com на reg.ru)
echo "stampscaner.com" > CNAME
echo "" > .nojekyll
git add CNAME .nojekyll
git commit -m "Add custom domain stampscaner.com"
git push

# A-записи на reg.ru на 4 GitHub Pages IPs:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
# (через zone/add_alias с ipaddr — паттерн из памяти проекта)
```

SSL Let's Encrypt автоматически выпустится GitHub Pages через 5–60 минут после привязки.

## Следующие задачи (после правок Аслана)

- **Спринт 1.3** — добавить языки FR, CN.
- **Спринт 1.4** — страницы `terms.html`, `privacy.html`, реестр `cert/`.
- **Спринт 1.5** — деплой на GitHub Pages + домен.
- **Спринт 2** — бэкенд Postman (Hono на ai-server) + интеграция чата.

## Атрибуция

Подготовлено по поручению Аслана Каа · StampScaner · 2026-05-29.
