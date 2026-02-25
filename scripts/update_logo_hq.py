from PIL import Image
import os


def remove_near_black_background(img: Image.Image, threshold: int = 28) -> Image.Image:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue

            if r <= threshold and g <= threshold and b <= threshold:
                pixels[x, y] = (r, g, b, 0)

    return img

# Paths
assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
print(f"Assets directory: {assets_dir}")

# Instructions for the user
print("\n" + "="*60)
print("HIGH-QUALITY LOGO UPDATE")
print("="*60)
print("\nPlease save your new high-quality logo as:")
print(f"  {os.path.join(assets_dir, 'logo_hq.png')}")
print("\nMake sure it's a PNG file with transparent background.")
print("\nOnce saved, this script will:")
print("  1. Generate icon.png (1024x1024)")
print("  2. Generate adaptive-icon.png (1024x1024)")
print("  3. Generate favicon.png (48x48)")
print("  4. Generate notification-icon.png (96x96)")
print("  5. Generate splash.png (1284x2778)")
print("="*60)

# Check if logo exists
logo_path = os.path.join(assets_dir, "logo_hq.png")
if not os.path.exists(logo_path):
    print(f"\n❌ Logo not found at: {logo_path}")
    print("\nPlease save the logo and run this script again.")
    exit(1)

print("\n✓ Logo found! Processing...\n")

# Load the high-quality logo
logo = Image.open(logo_path)
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

logo = remove_near_black_background(logo, threshold=28)

print(f"Source logo size: {logo.size}")
print(f"Source logo mode: {logo.mode}")

# App burgundy background color
app_burgundy = (139, 21, 56, 255)  # #8B1538

# 1. Generate icon.png (1024x1024)
print("\n1. Generating icon.png (1024x1024)...")
icon = Image.new('RGBA', (1024, 1024), app_burgundy)
# Resize logo to fit nicely (leave some padding)
logo_resized = logo.copy()
logo_resized.thumbnail((900, 900), Image.Resampling.LANCZOS)
# Center it
x = (1024 - logo_resized.width) // 2
y = (1024 - logo_resized.height) // 2
icon.paste(logo_resized, (x, y), logo_resized)
icon.save(os.path.join(assets_dir, 'icon.png'))
print("   ✓ Created icon.png")

# 2. Generate adaptive-icon.png (1024x1024)
print("\n2. Generating adaptive-icon.png (1024x1024)...")
# For adaptive icon, we need to account for Android's safe zone (66% of the icon)
adaptive_icon = Image.new('RGBA', (1024, 1024), app_burgundy)
logo_adaptive = logo.copy()
# Make it smaller to fit in the safe zone
logo_adaptive.thumbnail((700, 700), Image.Resampling.LANCZOS)
x = (1024 - logo_adaptive.width) // 2
y = (1024 - logo_adaptive.height) // 2
adaptive_icon.paste(logo_adaptive, (x, y), logo_adaptive)
adaptive_icon.save(os.path.join(assets_dir, 'adaptive-icon.png'))
print("   ✓ Created adaptive-icon.png")

# 3. Generate favicon.png (48x48)
print("\n3. Generating favicon.png (48x48)...")
favicon = Image.new('RGBA', (48, 48), app_burgundy)
logo_favicon = logo.copy()
logo_favicon.thumbnail((40, 40), Image.Resampling.LANCZOS)
x = (48 - logo_favicon.width) // 2
y = (48 - logo_favicon.height) // 2
favicon.paste(logo_favicon, (x, y), logo_favicon)
favicon.save(os.path.join(assets_dir, 'favicon.png'))
print("   ✓ Created favicon.png")

# 4. Generate notification-icon.png (96x96)
print("\n4. Generating notification-icon.png (96x96)...")
notification = Image.new('RGBA', (96, 96), app_burgundy)
logo_notification = logo.copy()
logo_notification.thumbnail((80, 80), Image.Resampling.LANCZOS)
x = (96 - logo_notification.width) // 2
y = (96 - logo_notification.height) // 2
notification.paste(logo_notification, (x, y), logo_notification)
notification.save(os.path.join(assets_dir, 'notification-icon.png'))
print("   ✓ Created notification-icon.png")

# 5. Generate splash.png (1284x2778 - iPhone 14 Pro Max)
print("\n5. Generating splash.png (1284x2778)...")
splash = Image.new('RGBA', (1284, 2778), app_burgundy)
logo_splash = logo.copy()
# Make logo prominent but not too large
logo_splash.thumbnail((800, 800), Image.Resampling.LANCZOS)
x = (1284 - logo_splash.width) // 2
y = (2778 - logo_splash.height) // 2
splash.paste(logo_splash, (x, y), logo_splash)
splash.save(os.path.join(assets_dir, 'splash.png'))
print("   ✓ Created splash.png")

print("\n" + "="*60)
print("✅ ALL APP ICONS GENERATED SUCCESSFULLY!")
print("="*60)
print(f"\n📁 Location: {assets_dir}")
print("\nGenerated files:")
print("  • icon.png (1024x1024)")
print("  • adaptive-icon.png (1024x1024)")
print("  • favicon.png (48x48)")
print("  • notification-icon.png (96x96)")
print("  • splash.png (1284x2778)")
print("\nAll icons use the app's burgundy background (#8B1538)")
print("="*60 + "\n")
