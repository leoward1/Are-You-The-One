from PIL import Image, ImageDraw, ImageFont
import os

# Create assets directory if it doesn't exist
assets_dir = "src/assets"
os.makedirs(assets_dir, exist_ok=True)

# App colors
PRIMARY_COLOR = (255, 107, 157)  # #FF6B9D
BACKGROUND_COLOR = (139, 21, 56)  # #8B1538

def create_icon(size, filename):
    """Create a simple gradient icon with heart emoji"""
    img = Image.new('RGB', (size, size), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect
    for i in range(size):
        color = tuple(int(BACKGROUND_COLOR[j] + (PRIMARY_COLOR[j] - BACKGROUND_COLOR[j]) * i / size) for j in range(3))
        draw.rectangle([0, i, size, i+1], fill=color)
    
    # Draw a heart shape (simplified)
    center_x, center_y = size // 2, size // 2
    heart_size = size // 3
    
    # Draw circle for heart top-left
    draw.ellipse([center_x - heart_size, center_y - heart_size//2, 
                  center_x, center_y + heart_size//2], fill=(255, 255, 255))
    # Draw circle for heart top-right
    draw.ellipse([center_x, center_y - heart_size//2, 
                  center_x + heart_size, center_y + heart_size//2], fill=(255, 255, 255))
    # Draw triangle for heart bottom
    draw.polygon([
        (center_x - heart_size, center_y),
        (center_x + heart_size, center_y),
        (center_x, center_y + heart_size)
    ], fill=(255, 255, 255))
    
    img.save(os.path.join(assets_dir, filename))
    print(f"Created {filename} ({size}x{size})")

def create_splash(filename):
    """Create splash screen"""
    width, height = 1284, 2778
    img = Image.new('RGB', (width, height), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Create gradient
    for i in range(height):
        color = tuple(int(BACKGROUND_COLOR[j] + (PRIMARY_COLOR[j] - BACKGROUND_COLOR[j]) * i / height) for j in range(3))
        draw.rectangle([0, i, width, i+1], fill=color)
    
    # Draw large heart in center
    center_x, center_y = width // 2, height // 2
    heart_size = 200
    
    draw.ellipse([center_x - heart_size, center_y - heart_size//2, 
                  center_x, center_y + heart_size//2], fill=(255, 255, 255))
    draw.ellipse([center_x, center_y - heart_size//2, 
                  center_x + heart_size, center_y + heart_size//2], fill=(255, 255, 255))
    draw.polygon([
        (center_x - heart_size, center_y),
        (center_x + heart_size, center_y),
        (center_x, center_y + heart_size)
    ], fill=(255, 255, 255))
    
    img.save(os.path.join(assets_dir, filename))
    print(f"Created {filename} ({width}x{height})")

# Create all required assets
create_icon(1024, "icon.png")
create_icon(1024, "adaptive-icon.png")
create_icon(48, "favicon.png")
create_icon(96, "notification-icon.png")
create_splash("splash.png")

print("\n✅ All placeholder images created successfully!")
print("📁 Location: src/assets/")
