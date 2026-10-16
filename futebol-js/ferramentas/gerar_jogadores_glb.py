"""
Gera jogadores.glb: os bonecos do Futebol JS (mesmas medidas e cores do jogo) em glTF binário,
formato que o Blender importa direto (Arquivo > Importar > glTF 2.0).

Cada boneco vem separado em 5 peças com o pivô no lugar certo, para animar:
  Corpo (tronco, calção, pescoço, cabeça e cabelo juntos), Perna_E, Perna_D, Braco_E, Braco_D.
As pernas giram no quadril e os braços no ombro, igual ao jogo.

Também gera celebracoes.glb: o seu jogador com as animações "Aviaozinho" e "Joelhada"
(as mesmas do jogo). No Blender, elas aparecem no Dope Sheet > Action Editor / NLA.

Uso: python3 gerar_jogadores_glb.py  →  cria jogadores.glb e celebracoes.glb na mesma pasta.
"""
import io
import json
import struct

from PIL import Image, ImageDraw

# ---------------------------------------------------------------------------
# Cores e texturas (as mesmas do jogo)
# ---------------------------------------------------------------------------
def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def png_bytes(img):
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

def tex_rosto(pele):
    im = Image.new('RGBA', (16, 16), hex_rgb(pele) + (255,))
    d = ImageDraw.Draw(im)
    escuro = (0x16, 0x12, 0x0F, 255)
    d.rectangle([3, 5, 6, 5], fill=escuro); d.rectangle([9, 5, 12, 5], fill=escuro)     # sobrancelhas
    d.rectangle([4, 7, 5, 9], fill=escuro); d.rectangle([10, 7, 11, 9], fill=escuro)    # olhos
    r, g, b = hex_rgb(pele)
    d.rectangle([7, 9, 8, 10], fill=(int(r * 0.75), int(g * 0.75), int(b * 0.75), 255))  # nariz
    d.rectangle([6, 12, 9, 12], fill=(0x7A, 0x3B, 0x2E, 255))                          # boca
    return im

# Dígitos 3×5 em pixel para o número nas costas.
DIGITOS = {
    '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
    '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
    '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '001', '001', '001'],
    '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
}

def tex_camisa(cor, listra, gola, numero, costas):
    im = Image.new('RGBA', (32, 32), hex_rgb(cor) + (255,))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 22, 31, 25], fill=hex_rgb(listra) + (255,))
    d.rectangle([11, 0, 20, 2], fill=hex_rgb(gola) + (255,))
    if costas:
        txt = str(numero)
        larg = len(txt) * 8 - 2
        x0 = (32 - larg) // 2
        for i, ch in enumerate(txt):
            for yy, linha in enumerate(DIGITOS[ch]):
                for xx, bit in enumerate(linha):
                    if bit == '1':
                        d.rectangle([x0 + i * 8 + xx * 2, 6 + yy * 2, x0 + i * 8 + xx * 2 + 1, 6 + yy * 2 + 1], fill=(255, 255, 255, 255))
    else:
        d.rectangle([19, 6, 25, 13], fill=(255, 255, 255, 255))
        d.rectangle([20, 7, 24, 12], fill=hex_rgb(listra) + (255,))
    return im

# ---------------------------------------------------------------------------
# Geometria. No jogo o boneco olha para +X; no glTF a frente é +Z.
# Conversão: glTF (X, Y, Z) = (-z_jogo, y, x_jogo).
# ---------------------------------------------------------------------------
def caixa(w, h, d, cx, cy, cz):
    """Caixa nas coordenadas do jogo (w = profundidade em X, d = largura em Z). Devolve as 6 faces em glTF."""
    gx, gy, gz = -cz, cy, cx           # centro em glTF
    sx, sy, sz = d / 2, h / 2, w / 2   # meias medidas em glTF
    faces = {}
    # cada face: 4 vértices (sentido anti-horário visto de fora), normal, uv
    # UV com origem no canto de cima à esquerda, olhando a face de fora.
    faces['+Z'] = ([(gx - sx, gy + sy, gz + sz), (gx - sx, gy - sy, gz + sz), (gx + sx, gy - sy, gz + sz), (gx + sx, gy + sy, gz + sz)], (0, 0, 1))
    faces['-Z'] = ([(gx + sx, gy + sy, gz - sz), (gx + sx, gy - sy, gz - sz), (gx - sx, gy - sy, gz - sz), (gx - sx, gy + sy, gz - sz)], (0, 0, -1))
    faces['+X'] = ([(gx + sx, gy + sy, gz + sz), (gx + sx, gy - sy, gz + sz), (gx + sx, gy - sy, gz - sz), (gx + sx, gy + sy, gz - sz)], (1, 0, 0))
    faces['-X'] = ([(gx - sx, gy + sy, gz - sz), (gx - sx, gy - sy, gz - sz), (gx - sx, gy - sy, gz + sz), (gx - sx, gy + sy, gz + sz)], (-1, 0, 0))
    faces['+Y'] = ([(gx - sx, gy + sy, gz - sz), (gx - sx, gy + sy, gz + sz), (gx + sx, gy + sy, gz + sz), (gx + sx, gy + sy, gz - sz)], (0, 1, 0))
    faces['-Y'] = ([(gx - sx, gy - sy, gz + sz), (gx - sx, gy - sy, gz - sz), (gx + sx, gy - sy, gz - sz), (gx + sx, gy - sy, gz + sz)], (0, -1, 0))
    return faces

UV_QUAD = [(0, 0), (0, 1), (1, 1), (1, 0)]

class Peca:
    """Uma peça (vira um mesh no glTF), agrupando as faces por material."""
    def __init__(self, nome, pivo, pai=None):
        self.nome = nome
        self.pai = pai                 # peça "mãe" (a canela fica pendurada na coxa, no joelho)
        self.pivo = pivo               # posição do pivô em glTF (o nó fica aqui; os vértices são relativos a ele)
        self.por_material = {}

    def add(self, faces, material, so_faces=None):
        for k, (verts, n) in faces.items():
            if so_faces and k not in so_faces:
                continue
            mat = material(k) if callable(material) else material
            if mat is None:
                continue
            lst = self.por_material.setdefault(mat, [])
            px, py, pz = self.pivo
            lst.append(([(v[0] - px, v[1] - py, v[2] - pz) for v in verts], n))

def boneco(o):
    """Monta as peças com as medidas de makeAthlete() do jogo."""
    cor = lambda h: ('cor', h)
    pele, cabelo = cor(o['pele']), cor(o['cabelo'])
    pecas = []
    corpo = Peca('Corpo', (0, 0, 0)); pecas.append(corpo)

    def perna(nome, z):
        # Perna com JOELHO: Perna_X é a coxa (gira no quadril) e Canela_X é filha dela (gira no joelho,
        # 0,28 m abaixo do quadril). No jogo, a perna normal é uma peça só; esta é a versão da joelhada.
        pv = (-z, 0.74, 0)
        p = Peca(nome, pv)
        p.add(caixa(0.2, 0.28, 0.2, 0, 0.74 - 0.14, z), pele)
        pecas.append(p)
        c = Peca(nome.replace('Perna', 'Canela'), (-z, 0.46, 0), pai=nome)
        for (w, h, d, mat, x, y) in [(0.22, 0.34, 0.22, cor(o['meia']), 0, -0.45),
                                     (0.32, 0.12, 0.24, cor('#1d1f24'), 0.04, -0.66), (0.33, 0.03, 0.25, cor(o['sola']), 0.04, -0.715)]:
            c.add(caixa(w, h, d, x, 0.74 + y, z), mat)
        pecas.append(c)

    def braco(nome, z):
        pv = (-z, 1.27, 0)
        p = Peca(nome, pv)
        mao = cor(o['luva']) if o.get('luva') else pele
        for (w, h, d, mat, y) in [(0.21, 0.24, 0.19, cor(o['camisa']), -0.1), (0.16, 0.3, 0.15, pele, -0.36), (0.17, 0.16, 0.17, mao, -0.57)]:
            p.add(caixa(w, h, d, 0, 1.27 + y, z), mat)
        pecas.append(p)

    perna('Perna_E', -0.13); perna('Perna_D', 0.13)
    braco('Braco_E', -0.39); braco('Braco_D', 0.39)
    corpo.add(caixa(0.34, 0.26, 0.58, 0, 0.8, 0), cor(o['calcao']))
    corpo.add(caixa(0.32, 0.58, 0.58, 0, 1.03, 0),
              lambda k: 'camisa_frente' if k == '+Z' else 'camisa_costas' if k == '-Z' else cor(o['camisa']))
    corpo.add(caixa(0.16, 0.06, 0.18, 0, 1.34, 0), pele)
    corpo.add(caixa(0.48, 0.52, 0.52, 0, 1.62, 0), lambda k: 'rosto' if k == '+Z' else pele)
    estilos = {
        0: [(0.52, 0.14, 0.56, -0.01, 1.91, 0), (0.08, 0.32, 0.56, -0.25, 1.73, 0)],
        1: [(0.52, 0.24, 0.56, -0.01, 1.95, 0), (0.1, 0.4, 0.56, -0.24, 1.7, 0), (0.36, 0.2, 0.06, -0.04, 1.76, -0.27), (0.36, 0.2, 0.06, -0.04, 1.76, 0.27)],
        2: [(0.5, 0.06, 0.54, -0.01, 1.89, 0), (0.06, 0.18, 0.54, -0.24, 1.8, 0)],
    }
    for (w, h, d, x, y, z) in estilos[o['estilo']]:
        corpo.add(caixa(w, h, d, x, y, z), cabelo)
    return pecas

# ---------------------------------------------------------------------------
# Escrita do GLB
# ---------------------------------------------------------------------------
class GLB:
    def __init__(self):
        self.bin = bytearray()
        self.j = {'asset': {'version': '2.0', 'generator': 'Futebol JS · gerar_jogadores_glb.py'},
                  'scene': 0, 'scenes': [{'name': 'Jogadores', 'nodes': []}], 'nodes': [], 'meshes': [],
                  'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': [],
                  'textures': [], 'images': [], 'samplers': [{'magFilter': 9728, 'minFilter': 9728, 'wrapS': 33071, 'wrapT': 33071}]}

    def _view(self, data, target=None):
        while len(self.bin) % 4:
            self.bin.append(0)
        off = len(self.bin)
        self.bin.extend(data)
        bv = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target:
            bv['target'] = target
        self.j['bufferViews'].append(bv)
        return len(self.j['bufferViews']) - 1

    def accessor(self, valores, tipo, comp=5126, alvo=34962):
        if tipo == 'SCALAR' and comp == 5123:
            data = struct.pack('<%dH' % len(valores), *valores)
            n = len(valores)
        elif tipo == 'SCALAR':
            data = struct.pack('<%df' % len(valores), *valores)
            n = len(valores)
        else:
            plano = [c_ for v in valores for c_ in v]
            data = struct.pack('<%df' % len(plano), *plano)
            n = len(valores)
        acc = {'bufferView': self._view(data, alvo), 'componentType': comp, 'count': n, 'type': tipo}
        if tipo == 'SCALAR' and comp == 5126:
            acc['min'] = [min(valores)]; acc['max'] = [max(valores)]
        if tipo == 'VEC3':
            acc['min'] = [min(v[i] for v in valores) for i in range(3)]
            acc['max'] = [max(v[i] for v in valores) for i in range(3)]
        self.j['accessors'].append(acc)
        return len(self.j['accessors']) - 1

    def textura(self, img):
        bv = self._view(png_bytes(img))
        self.j['images'].append({'bufferView': bv, 'mimeType': 'image/png'})
        self.j['textures'].append({'sampler': 0, 'source': len(self.j['images']) - 1})
        return len(self.j['textures']) - 1

    def material(self, nome, cor=None, textura=None):
        m = {'name': nome, 'pbrMetallicRoughness': {'metallicFactor': 0.0, 'roughnessFactor': 1.0}}
        if cor:
            m['pbrMetallicRoughness']['baseColorFactor'] = [srgb_to_linear(c) for c in hex_rgb(cor)] + [1.0]
        if textura is not None:
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': textura}
        self.j['materials'].append(m)
        return len(self.j['materials']) - 1

    def salvar(self, caminho):
        self.j['buffers'] = [{'byteLength': len(self.bin)}]
        js = json.dumps(self.j, separators=(',', ':')).encode('utf-8')
        js += b' ' * ((4 - len(js) % 4) % 4)
        while len(self.bin) % 4:
            self.bin.append(0)
        total = 12 + 8 + len(js) + 8 + len(self.bin)
        with open(caminho, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, total))
            f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
            f.write(struct.pack('<II', len(self.bin), 0x004E4942)); f.write(self.bin)

def exportar(variantes, caminho):
    g = GLB()
    for desloc, o in variantes:
        mats = {}
        def mat_idx(chave):
            if chave in mats:
                return mats[chave]
            if chave == 'rosto':
                i = g.material(o['nome'] + '_rosto', textura=g.textura(tex_rosto(o['pele'])))
            elif chave == 'camisa_frente':
                i = g.material(o['nome'] + '_camisa_frente', textura=g.textura(tex_camisa(o['camisa'], o['listra'], o['gola'], o['numero'], False)))
            elif chave == 'camisa_costas':
                i = g.material(o['nome'] + '_camisa_costas', textura=g.textura(tex_camisa(o['camisa'], o['listra'], o['gola'], o['numero'], True)))
            else:
                i = g.material(o['nome'] + '_' + chave[1].lstrip('#'), cor=chave[1])
            mats[chave] = i
            return i
        filhos, idx_peca, pivo_peca = [], {}, {}
        for peca in boneco(o):
            prims = []
            for chave, faces in peca.por_material.items():
                pos, nor, uv, idx = [], [], [], []
                for verts, n in faces:
                    b = len(pos)
                    pos += verts; nor += [n] * 4; uv += UV_QUAD
                    idx += [b, b + 1, b + 2, b, b + 2, b + 3]
                prims.append({'attributes': {'POSITION': g.accessor(pos, 'VEC3'), 'NORMAL': g.accessor(nor, 'VEC3'),
                                             'TEXCOORD_0': g.accessor(uv, 'VEC2')},
                              'indices': g.accessor(idx, 'SCALAR', 5123, 34963), 'material': mat_idx(chave)})
            g.j['meshes'].append({'name': o['nome'] + '_' + peca.nome, 'primitives': prims})
            if peca.pai:                    # filha: posição relativa ao pivô da mãe
                pp = pivo_peca[peca.pai]
                tr = [peca.pivo[0] - pp[0], peca.pivo[1] - pp[1], peca.pivo[2] - pp[2]]
            else:
                tr = list(peca.pivo)
            g.j['nodes'].append({'name': peca.nome, 'mesh': len(g.j['meshes']) - 1, 'translation': tr})
            ni = len(g.j['nodes']) - 1
            idx_peca[peca.nome] = ni; pivo_peca[peca.nome] = peca.pivo
            if peca.pai:
                g.j['nodes'][idx_peca[peca.pai]].setdefault('children', []).append(ni)
            else:
                filhos.append(ni)
        g.j['nodes'].append({'name': o['nome'], 'children': filhos, 'translation': [desloc, 0, 0]})
        g.j['scenes'][0]['nodes'].append(len(g.j['nodes']) - 1)
    if caminho:
        g.salvar(caminho)
    return g

# ---------------------------------------------------------------------------
# Comemorações: os mesmos quadros-chave do jogo (CELEBRACOES no futebol-partida.html)
# ---------------------------------------------------------------------------
import math

def k(t, y, lean, roll, aLz, aRz, aLx, aRx, lLz, lRz, jL=0, jR=0):
    return (t, dict(y=y, lean=lean, roll=roll, aLz=aLz, aRz=aRz, aLx=aLx, aRx=aRx, lLz=lLz, lRz=lRz, jL=jL, jR=jR))

CELEBRACOES = {
    'Aviaozinho': dict(dur=3.2, giro=0.9, swing=3.2, vel=[(0, 6.5), (2.8, 6.5), (3.2, 2)], keys=[
        k(0.0, 0, -0.1, 0, 0, 0, 0.3, -0.3, 0, 0), k(0.4, 0, -0.15, 0.3, 0, 0, 1.5, -1.5, 0, 0),
        k(1.2, 0, -0.15, -0.35, 0, 0, 1.5, -1.5, 0, 0), k(2.0, 0, -0.15, 0.35, 0, 0, 1.5, -1.5, 0, 0),
        k(2.8, 0, -0.15, -0.2, 0, 0, 1.5, -1.5, 0, 0), k(3.2, 0, -0.05, 0, 0, 0, 0.3, -0.3, 0, 0)]),
    'Joelhada': dict(dur=2.85, giro=0, swing=0.12, vel=[(0, 7.5), (0.35, 7.5), (1.2, 5.5), (1.9, 2.5), (2.25, 0), (2.85, 0)], keys=[
        k(0.0, 0.03, -0.2, 0, 0, 0, 0.2, -0.2, 0, 0), k(0.17, 0.08, 0.05, 0, 1.4, 1.4, 0.3, -0.3, -0.08, -0.08, -0.95, -0.95),
        k(0.35, -0.34, 0.15, 0, 2.8, 2.8, 0.5, -0.5, -0.15, -0.15, -1.9, -1.9),
        k(1.9, -0.34, 0.15, 0, 2.8, 2.8, 0.5, -0.5, -0.15, -0.15, -1.9, -1.9), k(2.2, -0.34, 0.15, 0, 2.3, 2.3, 0.5, -0.5, -0.15, -0.15, -1.9, -1.9),
        k(2.45, -0.34, 0.15, 0, 2.9, 2.9, 0.5, -0.5, -0.15, -0.15, -1.9, -1.9), k(2.65, 0.12, 0.05, 0, 1.45, 1.45, 0.3, -0.3, -0.08, -0.08, -0.95, -0.95),
        k(2.85, 0, 0, 0, 0, 0, 0.2, -0.2, 0, 0)]),
}

def smooth(t):
    return t * t * (3 - 2 * t)

def pose(c, t):
    K = c['keys']
    if t <= K[0][0]:
        return K[0][1]
    for (t0, a), (t1, b) in zip(K, K[1:]):
        if t <= t1:
            f = smooth((t - t0) / (t1 - t0))
            return {key: a[key] + (b[key] - a[key]) * f for key in a}
    return K[-1][1]

def vel(c, t):
    V = c['vel']
    for (t0, v0), (t1, v1) in zip(V, V[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    return V[-1][1]

def quat(eixo, ang):
    s = math.sin(ang / 2)
    return (eixo[0] * s, eixo[1] * s, eixo[2] * s, math.cos(ang / 2))

def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return (aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
            aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz)

# Eixos: o "Z do jogo" (balanço de pernas/braços) vira -X no glTF; o "X do jogo" (frente) vira +Z.
EX, EY, EZ = (1, 0, 0), (0, 1, 0), (0, 0, 1)

def exportar_celebracoes(caminho, fps=24):
    g = exportar([(0.0, VARIANTES[0][1])], None)
    nomes = {n['name']: i for i, n in enumerate(g.j['nodes'])}
    raiz = nomes[VARIANTES[0][1]['nome']]
    pivo = {n: g.j['nodes'][nomes[n]]['translation'] for n in ('Corpo', 'Perna_E', 'Perna_D', 'Braco_E', 'Braco_D')}
    g.j['animations'] = []
    for nome, c in CELEBRACOES.items():
        n = int(c['dur'] * fps) + 1
        tempos = [i / fps for i in range(n)]
        trilhas = {k_: [] for k_ in ('raiz_t', 'raiz_r', 'Corpo', 'Perna_E', 'Perna_D', 'Canela_E', 'Canela_D', 'Braco_E', 'Braco_D')}
        x = z = ang = fase = 0.0
        for i, t in enumerate(tempos):
            if i:
                dt = 1 / fps
                v = vel(c, t)
                ang += c['giro'] * dt
                x += math.cos(ang) * v * dt; z += math.sin(ang) * v * dt
                fase += v * 2.6 * dt
            P = pose(c, t)
            corre = math.sin(fase) * 0.9 if t < c['swing'] else 0
            trilhas['raiz_t'].append((-z, P['y'], x))
            trilhas['raiz_r'].append(qmul(quat(EY, -ang), quat(EZ, P['roll'])))
            trilhas['Corpo'].append(quat(EX, -P['lean']))
            trilhas['Perna_E'].append(quat(EX, -(P['lLz'] + corre)))
            trilhas['Perna_D'].append(quat(EX, -(P['lRz'] - corre)))
            trilhas['Canela_E'].append(quat(EX, -P['jL']))
            trilhas['Canela_D'].append(quat(EX, -P['jR']))
            # Igual ao jogo (ordem 'ZXY'): primeiro abre o braço para o lado, depois leva para a frente/cima.
            trilhas['Braco_E'].append(qmul(quat(EX, -P['aLz']), quat(EZ, P['aLx'])))
            trilhas['Braco_D'].append(qmul(quat(EX, -P['aRz']), quat(EZ, P['aRx'])))
        entrada = g.accessor(tempos, 'SCALAR', 5126, None)
        samplers, canais = [], []
        def canal(no, caminho_, valores, tipo):
            samplers.append({'input': entrada, 'output': g.accessor(valores, tipo, 5126, None), 'interpolation': 'LINEAR'})
            canais.append({'sampler': len(samplers) - 1, 'target': {'node': no, 'path': caminho_}})
        canal(raiz, 'translation', trilhas['raiz_t'], 'VEC3')
        canal(raiz, 'rotation', trilhas['raiz_r'], 'VEC4')
        for parte in ('Corpo', 'Perna_E', 'Perna_D', 'Canela_E', 'Canela_D', 'Braco_E', 'Braco_D'):
            canal(nomes[parte], 'rotation', trilhas[parte], 'VEC4')
        g.j['animations'].append({'name': nome, 'samplers': samplers, 'channels': canais})
    g.salvar(caminho)

VARIANTES = [
    (-1.4, dict(nome='Voce_Atacante_Azul', camisa='#0B4F9C', listra='#F7941D', gola='#08326A', numero=9,
                calcao='#F2F2EE', meia='#0B4F9C', sola='#F7941D', pele='#946042', cabelo='#6B4423', estilo=0)),
    (0.0, dict(nome='Meia_Vermelho', camisa='#C8352B', listra='#F2F2EE', gola='#7E1E17', numero=8,
               calcao='#1B1D22', meia='#C8352B', sola='#F2F2EE', pele='#946042', cabelo='#6B4423', estilo=2)),
    (1.4, dict(nome='Goleiro_Azul', camisa='#1F9E5C', listra='#F7941D', gola='#08326A', numero=1,
               calcao='#F2F2EE', meia='#1F9E5C', sola='#F7941D', pele='#F2C9A5', cabelo='#1C140F', estilo=1, luva='#F2F2EE')),
]

if __name__ == '__main__':
    exportar(VARIANTES, 'jogadores.glb')
    exportar_celebracoes('celebracoes.glb')
    print('jogadores.glb e celebracoes.glb criados')
