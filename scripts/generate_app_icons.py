from PIL import Image
import os

# Create assets directory if it doesn't exist
assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
os.makedirs(assets_dir, exist_ok=True)

# Load the source logo
source_logo_path = os.path.join(assets_dir, "logo_source.png")

if not os.path.exists(source_logo_path):
    print(f"Error: Source logo not found at {source_logo_path}")
    print("Please save the logo as 'logo_source.png' in the assets folder first.")
    exit(1)

# Load and process the logo
logo = Image.open(source_logo_path)

# Convert to RGBA if not already
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

print(f"Source logo size: {logo.size}")

# Define the sizes we need
sizes = {
    'icon.png': (1024, 1024),
    'adaptive-icon.png': (1024, 1024),
    'favicon.png': (48, 48),
    'splash.png': (1284, 2778),  # iPhone 14 Pro Max size
}

# Generate icon.png (1024x1024)
print("\nGenerating icon.png...")
icon = logo.copy()
icon.thumbnail((1024, 1024), Image.Resampling.LANCZOS)

# Create a new 1024x1024 image with transparent background
icon_final = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))

# Center the logo
x = (1024 - icon.width) // 2
y = (1024 - icon.height) // 2
icon_final.paste(icon, (x, y), icon)

icon_final.save(os.path.join(assets_dir, 'icon.png'))
print(f"✓ Created icon.png (1024x1024)")

# Generate adaptive-icon.png (same as icon for now)
print("\nGenerating adaptive-icon.png...")
icon_final.save(os.path.join(assets_dir, 'adaptive-icon.png'))
print(f"✓ Created adaptive-icon.png (1024x1024)")

# Generate favicon.png (48x48)
print("\nGenerating favicon.png...")
favicon = logo.copy()
favicon.thumbnail((48, 48), Image.Resampling.LANCZOS)

favicon_final = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
x = (48 - favicon.width) // 2
y = (48 - favicon.height) // 2
favicon_final.paste(favicon, (x, y), favicon)

favicon_final.save(os.path.join(assets_dir, 'favicon.png'))
print(f"✓ Created favicon.png (48x48)")

# Generate splash.png (1284x2778 - iPhone 14 Pro Max)
print("\nGenerating splash.png...")
# Use the burgundy background color from the logo
splash_bg_color = (139, 21, 56, 255)  # #8B1538
splash = Image.new('RGBA', (1284, 2778), splash_bg_color)

# Resize logo for splash (make it prominent but not too large)
splash_logo = logo.copy()
splash_logo.thumbnail((800, 800), Image.Resampling.LANCZOS)

# Center the logo on splash
x = (1284 - splash_logo.width) // 2
y = (2778 - splash_logo.height) // 2
splash.paste(splash_logo, (x, y), splash_logo)

splash.save(os.path.join(assets_dir, 'splash.png'))
print(f"✓ Created splash.png (1284x2778)")

print("\n✅ All app icons generated successfully!")
print(f"📁 Location: {assets_dir}")
