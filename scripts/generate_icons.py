import os
import base64
from PIL import Image, ImageOps, ImageFilter
import numpy as np

def generate_all_icons():
    src_path = '/Users/bruno/.gemini/antigravity/brain/a8403342-c541-4474-853e-65a99809f1b4/.user_uploaded/media_1792096077170_63efbf78.png'
    raw = Image.open(src_path)
    bbox = raw.getbbox()
    logo = raw.crop(bbox) # 542 x 260
    
    # Create public directory if not exists
    os.makedirs('public', exist_ok=True)
    
    # 1. Save transparent logo.png
    logo.save('public/logo.png', 'PNG')
    logo.save('public/logo-csag.png', 'PNG')
    print('Generated public/logo.png and public/logo-csag.png')
    
    # Helper to add a subtle high-contrast outline on dark bubble for dark backgrounds
    def get_logo_with_dark_outline(scale=1.0, outline_width=2, outline_color=(75, 75, 80, 255)):
        w = int(logo.width * scale)
        h = int(logo.height * scale)
        scaled = logo.resize((w, h), Image.Resampling.LANCZOS)
        
        arr = np.array(scaled)
        d_mask = (arr[:, :, 0] < 50) & (arr[:, :, 1] < 50) & (arr[:, :, 2] < 50) & (arr[:, :, 3] > 80)
        
        mask_img = Image.fromarray((d_mask * 255).astype(np.uint8))
        dilated = mask_img.filter(ImageFilter.MaxFilter(outline_width * 2 + 1))
        
        outline_arr = np.zeros_like(arr)
        outline_arr[:, :, :3] = outline_color[:3]
        outline_arr[:, :, 3] = np.array(dilated)
        outline_img = Image.fromarray(outline_arr)
        
        return Image.alpha_composite(outline_img, scaled)

    # 2. Function to generate square app icons with dark theme background (#09090b)
    def make_app_icon(size, logo_scale_ratio=0.75, outline_width=3):
        bg = Image.new('RGBA', (size, size), (9, 9, 11, 255)) # #09090b
        
        target_w = int(size * logo_scale_ratio)
        target_h = int(target_w * (logo.height / logo.width))
        
        scale = target_w / logo.width
        scaled_logo = get_logo_with_dark_outline(scale=scale, outline_width=outline_width, outline_color=(80, 80, 85, 255))
        
        # Center logo
        offset_x = (size - scaled_logo.width) // 2
        offset_y = (size - scaled_logo.height) // 2
        
        bg.paste(scaled_logo, (offset_x, offset_y), scaled_logo)
        return bg

    # Apple Touch Icon (180x180)
    apple_icon = make_app_icon(180, logo_scale_ratio=0.74, outline_width=2)
    # RGB format without alpha as recommended by Apple
    apple_icon_rgb = apple_icon.convert('RGB')
    apple_icon_rgb.save('public/apple-touch-icon.png', 'PNG')
    print('Generated public/apple-touch-icon.png (180x180)')
    
    # Android PWA Icons (192x192, 512x512)
    icon_192 = make_app_icon(192, logo_scale_ratio=0.74, outline_width=2)
    icon_192.save('public/icon-192.png', 'PNG')
    print('Generated public/icon-192.png')

    icon_512 = make_app_icon(512, logo_scale_ratio=0.74, outline_width=4)
    icon_512.save('public/icon-512.png', 'PNG')
    print('Generated public/icon-512.png')

    # Maskable icons (central 80% circle safe zone -> ratio ~ 0.60)
    icon_maskable_192 = make_app_icon(192, logo_scale_ratio=0.62, outline_width=2)
    icon_maskable_192.save('public/icon-maskable-192.png', 'PNG')
    print('Generated public/icon-maskable-192.png')

    icon_maskable_512 = make_app_icon(512, logo_scale_ratio=0.62, outline_width=4)
    icon_maskable_512.save('public/icon-maskable-512.png', 'PNG')
    print('Generated public/icon-maskable-512.png')

    # Favicon PNGs (transparent with subtle outline for dark browser tabs)
    def make_transparent_favicon(size, outline_width=1):
        target_w = size
        target_h = int(target_w * (logo.height / logo.width))
        scale = target_w / logo.width
        scaled = get_logo_with_dark_outline(scale=scale, outline_width=outline_width, outline_color=(120, 120, 125, 255))
        
        fav = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        offset_y = (size - scaled.height) // 2
        fav.paste(scaled, (0, offset_y), scaled)
        return fav

    fav_16 = make_transparent_favicon(16, outline_width=1)
    fav_16.save('public/favicon-16x16.png', 'PNG')

    fav_32 = make_transparent_favicon(32, outline_width=1)
    fav_32.save('public/favicon-32x32.png', 'PNG')

    fav_48 = make_transparent_favicon(48, outline_width=1)
    fav_48.save('public/favicon-48x48.png', 'PNG')
    print('Generated public/favicon-16x16.png, 32x32.png, 48x48.png')

    # Multi-resolution favicon.ico
    fav_16.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('Generated public/favicon.ico')

    # Favicon SVG: embedding high-res PNG into scalable vector canvas with 0.8 padding
    with open('public/favicon-48x48.png', 'rb') as f:
        png_b64 = base64.b64encode(f.read()).decode('utf-8')
    
    # We can also build a pure vector SVG!
    # Let's inspect the SVG code:
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 542 260" fill="none">
  <!-- Balão Amarelo Superior -->
  <path d="M 98.5 0 L 332.5 0 C 386.9 0 431 44.1 431 98.5 C 431 152.9 386.9 197 332.5 197 L 134 197 L 134 197 L 134 197 L 96 150 C 44.1 148 0 105 0 98.5 C 0 44.1 44.1 0 98.5 0 Z" fill="#F7D406"/>
  <!-- Image overlay with exact antialiased source -->
  <image href="data:image/png;base64,{png_b64}" x="0" y="0" width="542" height="260" />
</svg>'''

    # For maximum fidelity, let's create a clean SVG embedding the high-res transparent logo
    with open('public/logo.png', 'rb') as f:
        full_b64 = base64.b64encode(f.read()).decode('utf-8')

    clean_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 542 260">
  <image href="data:image/png;base64,{full_b64}" x="0" y="0" width="542" height="260"/>
</svg>
'''
    with open('public/favicon.svg', 'w') as f:
        f.write(clean_svg)
    print('Generated public/favicon.svg')

if __name__ == '__main__':
    generate_all_icons()
