import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def build_icons():
    # 1. Pure Vector SVG (512 x 512 square)
    # Centered: scale 0.835, translated to (31, 148)
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(31, 148) scale(0.835)">
    <!-- Balão Amarelo Superior -->
    <path d="M 76 0 L 357 0 A 75 75 0 0 1 432 75 A 75 75 0 0 1 357 150 L 135 150 L 135 197 L 96 146 A 75 75 0 0 1 1 75 A 75 75 0 0 1 76 0 Z" fill="#F7D406"/>
    
    <!-- Balão Grafite com traço de contraste elegante para modo escuro -->
    <path d="M 270 109 L 483 109 A 57 57 0 0 1 540 166 A 57 57 0 0 1 483 223 L 464 221 L 439 258 L 439 223 L 270 223 A 57 57 0 0 1 213 166 A 57 57 0 0 1 270 109 Z" fill="#1D1D1B" stroke="#66666e" stroke-width="5" stroke-linejoin="round"/>
  </g>
</svg>'''

    with open('public/favicon.svg', 'w') as f:
        f.write(svg_content)
    print('Generated pure vector public/favicon.svg')

    # Load the high-res PNG for raster icon generation
    src_path = '/Users/bruno/.gemini/antigravity/brain/a8403342-c541-4474-853e-65a99809f1b4/.user_uploaded/media_1792096077170_63efbf78.png'
    raw = Image.open(src_path)
    bbox = raw.getbbox()
    logo = raw.crop(bbox) # 542 x 260
    
    # Function to add stroke around dark bubble
    def add_dark_bubble_stroke(img, stroke_color=(100, 100, 110, 255), thickness=3):
        arr = np.array(img)
        d_mask = (arr[:, :, 0] < 50) & (arr[:, :, 1] < 50) & (arr[:, :, 2] < 50) & (arr[:, :, 3] > 80)
        mask_img = Image.fromarray((d_mask * 255).astype(np.uint8))
        dilated = mask_img.filter(ImageFilter.MaxFilter(thickness * 2 + 1))
        
        outline_arr = np.zeros_like(arr)
        outline_arr[:, :, :3] = stroke_color[:3]
        outline_arr[:, :, 3] = np.array(dilated)
        outline_img = Image.fromarray(outline_arr)
        return Image.alpha_composite(outline_img, img)

    logo_with_stroke = add_dark_bubble_stroke(logo, stroke_color=(120, 120, 130, 255), thickness=3)

    # 2. Save public/logo.png and public/logo-csag.png
    logo_with_stroke.save('public/logo.png', 'PNG')
    logo_with_stroke.save('public/logo-csag.png', 'PNG')
    print('Generated public/logo.png and public/logo-csag.png with contrast stroke')

    # 3. Square App Icon Generator (#09090b background)
    def make_app_icon(size, scale_ratio=0.74, stroke_width=3):
        bg = Image.new('RGBA', (size, size), (9, 9, 11, 255))
        target_w = int(size * scale_ratio)
        target_h = int(target_w * (logo.height / logo.width))
        
        scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        stroked = add_dark_bubble_stroke(scaled, stroke_color=(140, 140, 150, 255), thickness=stroke_width)
        
        offset_x = (size - stroked.width) // 2
        offset_y = (size - stroked.height) // 2
        bg.paste(stroked, (offset_x, offset_y), stroked)
        return bg

    # Apple Touch Icon (180x180 RGB)
    apple_icon = make_app_icon(180, scale_ratio=0.74, stroke_width=2).convert('RGB')
    apple_icon.save('public/apple-touch-icon.png', 'PNG')
    print('Generated public/apple-touch-icon.png (180x180)')

    # Android PWA Icons
    make_app_icon(192, scale_ratio=0.74, stroke_width=2).save('public/icon-192.png', 'PNG')
    make_app_icon(512, scale_ratio=0.74, stroke_width=4).save('public/icon-512.png', 'PNG')
    make_app_icon(192, scale_ratio=0.60, stroke_width=2).save('public/icon-maskable-192.png', 'PNG')
    make_app_icon(512, scale_ratio=0.60, stroke_width=4).save('public/icon-maskable-512.png', 'PNG')
    print('Generated PWA icons (192, 512, maskable)')

    # Square Favicon PNGs (transparent with stroke)
    def make_square_favicon(size, stroke_width=1):
        fav = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        target_w = size
        target_h = int(target_w * (logo.height / logo.width))
        scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        stroked = add_dark_bubble_stroke(scaled, stroke_color=(160, 160, 170, 255), thickness=stroke_width)
        offset_y = (size - stroked.height) // 2
        fav.paste(stroked, (0, offset_y), stroked)
        return fav

    fav_16 = make_square_favicon(16, stroke_width=1)
    fav_16.save('public/favicon-16x16.png', 'PNG')

    fav_32 = make_square_favicon(32, stroke_width=1)
    fav_32.save('public/favicon-32x32.png', 'PNG')

    fav_48 = make_square_favicon(48, stroke_width=2)
    fav_48.save('public/favicon-48x48.png', 'PNG')

    # Multi-resolution favicon.ico
    fav_48.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('Generated favicon-16x16.png, 32x32.png, 48x48.png and favicon.ico')

if __name__ == '__main__':
    build_icons()
