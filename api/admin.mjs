import crypto from 'node:crypto';

const REPOSITORY = process.env.GITHUB_REPO || 'pablinrlq/fpc-joias';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const API_VERSION = '2026-03-10';

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function sameSecret(received, expected) {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isAuthorized(request) {
  return sameSecret(request.headers.get('x-admin-password'), process.env.ADMIN_PASSWORD);
}

function configurationMissing() {
  return !process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN;
}

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/${path}`, {
    ...options,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'x-github-api-version': API_VERSION,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 404 && options.method !== 'PUT') return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `GitHub respondeu com status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function writeFile(path, base64Content, message) {
  const current = await github(`${path}?ref=${encodeURIComponent(BRANCH)}`);
  const body = {
    message,
    content: base64Content,
    branch: BRANCH,
    committer: {
      name: 'FPC Pratas Admin',
      email: 'pablomoisesgr@gmail.com'
    }
  };
  if (current?.sha) body.sha = current.sha;

  return github(path, { method: 'PUT', body: JSON.stringify(body) });
}

function cleanProduct(product) {
  if (!product || typeof product !== 'object') throw new Error('Produto inválido.');

  const id = String(product.id || '').trim();
  const name = String(product.name || '').trim();
  if (!/^[a-z0-9-]{2,80}$/.test(id)) throw new Error(`Identificador inválido: ${id || '(vazio)'}.`);
  if (!name || name.length > 120) throw new Error(`Nome inválido no produto ${id}.`);

  const cleaned = {
    id,
    name,
    audience: String(product.audience || 'acessorios'),
    type: String(product.type || 'acessorios'),
    detail: String(product.detail || '').slice(0, 160),
    price: product.price === null || product.price === '' ? null : Number(product.price)
  };

  if (cleaned.price !== null && (!Number.isFinite(cleaned.price) || cleaned.price < 0)) {
    throw new Error(`Preço inválido no produto ${id}.`);
  }

  for (const field of ['pricePrefix', 'options', 'image', 'detailImage']) {
    if (product[field]) cleaned[field] = String(product[field]).slice(0, field === 'options' ? 500 : 220);
  }
  if (product.featured) cleaned.featured = true;
  return cleaned;
}

function catalogSource(products) {
  return `/*\n * Catálogo FPC Pratas\n *\n * Arquivo atualizado pelo painel administrativo.\n * As imagens ficam em assets/catalogo/.\n */\nwindow.FPC_CATALOG = ${JSON.stringify(products, null, 2)};\n`;
}

function validateImage(image) {
  if (!image || typeof image !== 'object') throw new Error('Imagem inválida.');
  const path = String(image.path || '');
  if (!/^assets\/catalogo\/[a-z0-9-]+-(principal|detalhe)\.jpg$/.test(path)) {
    throw new Error('Caminho de imagem inválido.');
  }
  const content = String(image.content || '').replace(/^data:image\/jpeg;base64,/, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(content)) throw new Error('Conteúdo de imagem inválido.');
  if (Buffer.byteLength(content, 'base64') > 1_200_000) throw new Error('A imagem excede o limite de 1,2 MB.');
  return { path, content };
}

export default {
  async fetch(request) {
    if (configurationMissing()) {
      return json({
        ok: false,
        error: 'Painel ainda não configurado na Vercel.',
        missing: ['ADMIN_PASSWORD', 'GITHUB_TOKEN'].filter(key => !process.env[key])
      }, 503);
    }

    if (!isAuthorized(request)) return json({ ok: false, error: 'Senha incorreta.' }, 401);

    if (request.method === 'GET') {
      return json({ ok: true, repository: REPOSITORY, branch: BRANCH });
    }

    if (request.method !== 'PUT') return json({ ok: false, error: 'Método não permitido.' }, 405);

    try {
      const body = await request.json();
      if (!Array.isArray(body.products) || body.products.length > 500) {
        return json({ ok: false, error: 'Catálogo inválido.' }, 400);
      }

      const products = body.products.map(cleanProduct);
      const ids = new Set(products.map(product => product.id));
      if (ids.size !== products.length) return json({ ok: false, error: 'Existem produtos com identificadores repetidos.' }, 400);

      const images = Array.isArray(body.images) ? body.images.map(validateImage) : [];
      for (const image of images) {
        await writeFile(image.path, image.content, `Atualiza imagem de ${image.path.split('/').pop()}`);
      }

      const source = catalogSource(products);
      const result = await writeFile(
        'catalogo.js',
        Buffer.from(source, 'utf8').toString('base64'),
        String(body.message || 'Atualiza catálogo pelo painel administrativo').slice(0, 120)
      );

      return json({
        ok: true,
        products: products.length,
        images: images.length,
        commit: result?.commit?.sha || null
      });
    } catch (error) {
      const status = Number(error.status) || 500;
      return json({ ok: false, error: error.message || 'Não foi possível atualizar o catálogo.' }, status >= 400 && status < 600 ? status : 500);
    }
  }
};
