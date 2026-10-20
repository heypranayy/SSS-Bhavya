import os
from PIL import Image, ImageDraw, ImageFont

def create_favicon(size=512):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded rectangle background
    # Royal Palatial Maroon #722F37 gradient / solid with subtle bevel
    bg_color = (114, 47, 55, 255) # #722F37
    dark_wine = (74, 19, 26, 255) # #4A131A
    gold_light = (223, 184, 108, 255) # #DFB86C
    gold_main = (197, 160, 89, 255) # #C5A059
    ivory = (250, 247, 242, 255) # #FAF7F2

    # Draw rounded square
    radius = int(size * 0.22)
    # Background gradient
    for y in range(size):
        factor = y / size
        r = int(bg_color[0] * (1 - factor) + dark_wine[0] * factor)
        g = int(bg_color[1] * (1 - factor) + dark_wine[1] * factor)
        b = int(bg_color[2] * (1 - factor) + dark_wine[2] * factor)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Mask to rounded rectangle
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    margin = int(size * 0.04)
    mask_draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=radius,
        fill=255
    )
    
    # Apply mask
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask)
    draw = ImageDraw.Draw(output)

    # Gold borders
    inner_m1 = margin + int(size * 0.04)
    draw.rounded_rectangle(
        [(inner_m1, inner_m1), (size - inner_m1, size - inner_m1)],
        radius=int(radius * 0.8),
        outline=gold_main,
        width=max(2, int(size * 0.015))
    )

    # Try loading a serif font, or fallback to default
    font_bf = None
    font_sub = None
    
    font_candidates = [
        "C:\\Windows\\Fonts\\georgiab.ttf",
        "C:\\Windows\\Fonts\\timesbd.ttf",
        "C:\\Windows\\Fonts\\palabi.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf"
    ]
    for font_path in font_candidates:
        if os.path.exists(font_path):
            try:
                font_bf = ImageFont.truetype(font_path, int(size * 0.44))
                font_sub = ImageFont.truetype(font_path, int(size * 0.08))
                break
            except Exception:
                pass

    if not font_bf:
        font_bf = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Draw "BF" Monogram
    text_bf = "BF"
    bbox_bf = draw.textbbox((0, 0), text_bf, font=font_bf)
    w_bf = bbox_bf[2] - bbox_bf[0]
    h_bf = bbox_bf[3] - bbox_bf[1]
    
    pos_x = (size - w_bf) / 2 - bbox_bf[0]
    pos_y = (size - h_bf) / 2 - bbox_bf[1] - int(size * 0.05)

    # Shadow for depth
    draw.text((pos_x + int(size * 0.01), pos_y + int(size * 0.01)), text_bf, fill=(20, 5, 8, 200), font=font_bf)
    # Main gold text
    draw.text((pos_x, pos_y), text_bf, fill=gold_light, font=font_bf)

    # Draw "BHAVYA" text below
    text_sub = "BHAVYA"
    bbox_sub = draw.textbbox((0, 0), text_sub, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    sub_x = (size - w_sub) / 2 - bbox_sub[0]
    sub_y = pos_y + h_bf + int(size * 0.06)

    draw.text((sub_x, sub_y), text_sub, fill=ivory, font=font_sub)

    # Top & bottom diamond accents
    cx = size // 2
    top_y = margin + int(size * 0.08)
    d_size = int(size * 0.025)
    draw.polygon([(cx, top_y - d_size), (cx + d_size, top_y), (cx, top_y + d_size), (cx - d_size, top_y)], fill=gold_light)

    bot_y = size - margin - int(size * 0.06)
    draw.polygon([(cx, bot_y - d_size), (cx + d_size, bot_y), (cx, bot_y + d_size), (cx - d_size, bot_y)], fill=gold_light)

    return output

if __name__ == '__main__':
    base_img = create_favicon(512)
    
    # Save 512x512 PNG
    base_img.save('public/icon-512.png')
    
    # Save 192x192 PNG
    img_192 = base_img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save('public/icon.png')
    img_192.save('src/app/icon.png')

    # Save 180x180 Apple Touch Icon
    img_180 = base_img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save('public/apple-icon.png')
    img_180.save('src/app/apple-icon.png')

    # Save 32x32 and 16x16 PNGs
    img_32 = base_img.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save('public/favicon-32x32.png')
    
    img_16 = base_img.resize((16, 16), Image.Resampling.LANCZOS)
    img_16.save('public/favicon-16x16.png')

    # Save multi-resolution .ico (16, 32, 48, 64)
    base_img.save(
        'public/favicon.ico',
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    base_img.save(
        'src/app/favicon.ico',
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print("Favicon files generated successfully!")
