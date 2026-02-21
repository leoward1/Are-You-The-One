# Assets Folder

## Logo Files

Please save the logo image as `logo_source.png` in this folder, then run:

```bash
python scripts/generate_app_icons.py
```

This will generate:
- `icon.png` (1024x1024) - App icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon
- `splash.png` (1284x2778) - Splash screen

## Manual Steps Required

Since I cannot directly save images from screenshots, please:

1. Save the logo image you provided to: `assets/logo_source.png`
2. Run: `python scripts/generate_app_icons.py`

Alternatively, if you have the logo as a file on your computer, you can:
1. Copy it to the `assets` folder
2. Rename it to `logo_source.png`
3. Run the script
