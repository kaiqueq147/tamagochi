"""Remove o fundo branco da imagem do Purin e recorta, gerando public/assets/purin-base.png.

Uso: python tools/prep-image.py caminho/da/imagem.png
Requer: pip install pillow
"""
import sys
from collections import deque
from PIL import Image

SRC = sys.argv[1]
OUT = "public/assets/purin-base.png"

im = Image.open(SRC).convert("RGB")
W, H = im.size
px = im.load()


def is_bg(c, tol=28):
    return c[0] >= 255 - tol and c[1] >= 255 - tol and c[2] >= 255 - tol


# 1) flood fill do fundo branco a partir das bordas
bg = [[False] * W for _ in range(H)]
dq = deque()
for x in range(W):
    for y in (0, H - 1):
        if is_bg(px[x, y]) and not bg[y][x]:
            bg[y][x] = True
            dq.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        if is_bg(px[x, y]) and not bg[y][x]:
            bg[y][x] = True
            dq.append((x, y))
while dq:
    x, y = dq.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and not bg[ny][nx] and is_bg(px[nx, ny], 40):
            bg[ny][nx] = True
            dq.append((nx, ny))

# cor do contorno = média dos pixels mais escuros
dark = sorted((sum(px[x, y]), px[x, y]) for y in range(H) for x in range(W))[: max(50, W * H // 400)]
line = tuple(sum(c[i] for _, c in dark) // len(dark) for i in range(3))

# 2) faixa de 3px perto do fundo: des-mistura do branco com a cor do contorno (borda suave)
dist = [[99] * W for _ in range(H)]
dq = deque()
for y in range(H):
    for x in range(W):
        if bg[y][x]:
            dist[y][x] = 0
            dq.append((x, y))
while dq:
    x, y = dq.popleft()
    if dist[y][x] >= 3:
        continue
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and dist[ny][nx] > dist[y][x] + 1:
            dist[ny][nx] = dist[y][x] + 1
            dq.append((nx, ny))

out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
op = out.load()
for y in range(H):
    for x in range(W):
        if bg[y][x]:
            continue
        r, g, b = px[x, y]
        if dist[y][x] <= 3:
            a = (255 - g) / max(1, 255 - line[1])
            a = max(0.0, min(1.0, a * 1.05))
            if a < 0.04:
                continue
            op[x, y] = (*line, int(a * 255))
        else:
            op[x, y] = (r, g, b, 255)

bbox = out.getbbox()
pad = 2
box = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(W, bbox[2] + pad), min(H, bbox[3] + pad))
out = out.crop(box)
out.save(OUT)
print("ok", out.size, "crop", box)
