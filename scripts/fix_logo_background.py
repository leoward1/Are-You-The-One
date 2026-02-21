from PIL import Image
import os

# Paths
assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
source_logo = os.path.join(assets_dir, "Are you the one.jpg")
output_logo = os.path.join(assets_dir, "logo_source.png")

print("Loading logo...")
logo = Image.open(source_logo)
logo = logo.convert('RGBA')

print(f"Original size: {logo.size}")

# The logo has a darker burgundy square background
# We need to crop to just the heart logo and make the background match the app color
# or make it transparent

# Get the bounding box of the actual logo content (the heart)
# We'll crop out the darker square background

# The image is 1024x1024, and the logo appears to be centered
# Let's crop to remove the darker background square
width, height = logo.size

# The darker square appears to be roughly in the center
# Let's crop to a smaller area that contains just the heart logo
# Based on the image, the heart logo is roughly in the center 60% of the image

crop_margin = int(width * 0.15)  # 15% margin on each side
cropped = logo.crop((crop_margin, crop_margin, width - crop_margin, height - crop_margin))

print(f"Cropped size: {cropped.size}")

# Now we need to replace the darker burgundy background with transparency
# or with the app's burgundy color (#8B1538)

# Get pixel data
pixels = cropped.load()
width, height = cropped.size

# Define the darker burgundy color range to replace
# The darker square appears to be around RGB(90, 20, 40) to RGB(120, 40, 60)
dark_burgundy_range = {
    'r_min': 70, 'r_max': 130,
    'g_min': 10, 'g_max': 50,
    'b_min': 30, 'b_max': 70
}

# App burgundy color
app_burgundy = (139, 21, 56, 255)  # #8B1538

print("Replacing dark background with app burgundy color...")
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Check if pixel is in the dark burgundy range
        if (dark_burgundy_range['r_min'] <= r <= dark_burgundy_range['r_max'] and
            dark_burgundy_range['g_min'] <= g <= dark_burgundy_range['g_max'] and
            dark_burgundy_range['b_min'] <= b <= dark_burgundy_range['b_max']):
            # Replace with app burgundy
            pixels[x, y] = app_burgundy

# Resize back to 1024x1024 with the logo centered on app burgundy background
final_logo = Image.new('RGBA', (1024, 1024), app_burgundy)

# Center the cropped logo
x_offset = (1024 - cropped.width) // 2
y_offset = (1024 - cropped.height) // 2
final_logo.paste(cropped, (x_offset, y_offset), cropped)

# Save
final_logo.save(output_logo)
print(f"✓ Saved seamless logo to: {output_logo}")
print("✓ Background now matches app burgundy (#8B1538)")
