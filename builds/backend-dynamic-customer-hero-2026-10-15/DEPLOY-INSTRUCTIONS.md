# Customer home hero backend update

Deploy the contents of this folder over the Laravel application root. Keep the live `.env`, uploads, and database unchanged.

Then run:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

No migration is required. The existing `settings` table stores these keys automatically:

- `customer_hero_title`
- `customer_hero_button_text`
- `customer_hero_image`

After deployment, open **Admin → Settings → Customer Home Hero**. If no hero image has been uploaded, the customer app keeps using its bundled placeholder image.
