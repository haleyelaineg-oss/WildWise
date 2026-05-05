# /assets/images

Place all site images here. Organize by context:

```
assets/images/
  noodle/          ← Noodle photos (see noodle.html gallery)
  founder/         ← Founder portrait (used in about.html)
  wildlife/        ← Species / education content images
  events/          ← School visits, events, programs
  og/              ← Open Graph / social share images (1200×630)
```

## Recommended formats

- Photos: JPEG or WebP (prefer WebP for smaller file sizes)
- Illustrations / icons: SVG
- Open Graph images: PNG or JPEG, 1200×630px

## Where images are used

| Page          | Image slot                  | Recommended size       |
|---------------|-----------------------------|------------------------|
| about.html    | Founder portrait            | ~600×750px (4:5)       |
| noodle.html   | Noodle hero portrait        | ~480×640px (3:4)       |
| noodle.html   | Gallery grid (6 images)     | ~800×800px (square)    |
| noodle.html   | Gallery featured            | ~800×1000px (4:5 tall) |
| index.html    | OG share image              | 1200×630px             |

## Optimization tips

- Run images through [Squoosh](https://squoosh.app) or ImageOptim before committing
- Use descriptive alt text for all `<img>` tags
- Add `loading="lazy"` to below-fold images
- Replace `<div class="img-placeholder">` divs with real `<img>` tags when photos are ready
