# Logo Setup Instructions

## ✅ What's Been Done

1. **Supabase Integration**
   - Installed `@supabase/supabase-js`
   - Configured Supabase client with your credentials
   - Created service methods for auth, profiles, storage, and real-time features
   - Project URL: `https://jaspfotwnmjqqwoujnfm.supabase.co`

2. **Color Theme Updated**
   - Primary color: `#8B1538` (Burgundy from logo)
   - Secondary color: `#C41E3A` (Lighter burgundy/red)
   - Accent color: `#D4AF37` (Gold from logo arrow)
   - Updated in `src/utils/constants.ts`

3. **Icon Generation Script Created**
   - Script ready at `scripts/generate_app_icons.py`
   - Will generate all required icon sizes

---

## 📋 Steps to Complete Logo Setup

### Step 1: Save the Logo File

1. Save your logo image (the one with "ARE YOU THE ONE?" text and heart with arrow)
2. Save it to: `C:\Users\SULATECH\Desktop\Are you the On App\assets\logo_source.png`
3. Make sure it's a PNG file with transparent background if possible

### Step 2: Generate App Icons

Open PowerShell in the project directory and run:

```powershell
python scripts/generate_app_icons.py
```

This will create:
- `assets/icon.png` (1024x1024) - Main app icon
- `assets/adaptive-icon.png` (1024x1024) - Android adaptive icon
- `assets/favicon.png` (48x48) - Web favicon
- `assets/splash.png` (1284x2778) - Splash screen with burgundy background

### Step 3: Verify the Icons

Check the `assets` folder to ensure all icons were generated correctly.

### Step 4: Test the App

```powershell
npx expo start
```

You should see:
- New burgundy/gold color scheme throughout the app
- New logo on splash screen
- Updated app icon

---

## 🎨 Color Scheme Reference

Your new app colors (from the logo):

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Burgundy** | `#8B1538` | Primary buttons, headers, main brand color |
| **Red** | `#C41E3A` | Secondary actions, highlights |
| **Gold** | `#D4AF37` | Accents, premium features, CTAs |

---

## 🗄️ Supabase Database Setup

Don't forget to set up your database schema:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/jaspfotwnmjqqwoujnfm
2. Click **SQL Editor** in the left sidebar
3. Open `SUPABASE_SETUP.md` in this project
4. Copy the SQL schema (lines 29-145)
5. Paste and run in Supabase SQL Editor

This creates:
- `profiles` table
- `photos` table
- `matches` table
- `messages` table
- Row Level Security policies
- Storage bucket for photos

---

## 📦 Next Steps After Logo Setup

1. **Commit Changes**
   ```powershell
   git add .
   git commit -m "Add Supabase integration and update logo/colors"
   git push origin main
   ```

2. **Test Supabase Connection**
   - Run the app
   - Try signing up a test user
   - Check Supabase dashboard to see if user was created

3. **Build for iOS**
   ```powershell
   eas build --platform ios --profile preview
   ```

---

## 🐛 Troubleshooting

### If Python script fails:
- Make sure Python is installed: `python --version`
- Install Pillow: `pip install Pillow`
- Verify logo file exists at `assets/logo_source.png`

### If colors don't update:
- Clear Metro bundler cache: `npx expo start -c`
- Restart the development server

### If Supabase connection fails:
- Check `app.json` has correct credentials
- Verify your Supabase project is active
- Check console for error messages

---

## 📞 Support

If you encounter any issues:
1. Check the error messages in the console
2. Verify all files are in the correct locations
3. Ensure all dependencies are installed: `npm install`
