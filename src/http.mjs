import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pExecFile = promisify(execFile);

export const BROWSER_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'zh-TW,zh;q=0.9,ja;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  'upgrade-insecure-requests': '1',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 抓取網頁內容。優先使用 Node 原生 fetch，遇到非 200 時退回 curl（含 gzip 解壓）。
 */
export async function fetchText(url, { headers = BROWSER_HEADERS, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers, redirect: 'follow' });
      const text = await res.text();
      if (res.ok && text.length > 5000 && !isBotWall(text)) return { text, status: res.status, via: 'fetch' };
      if (text.length > 5000 && isBotWall(text)) {
        const viaCurl = await fetchTextViaCurl(url, headers);
        if (viaCurl && !isBotWall(viaCurl)) return { text: viaCurl, status: 200, via: 'curl' };
      }
      lastErr = new Error(`HTTP ${res.status} (${text.length} bytes) for ${url}`);
    } catch (err) {
      lastErr = err;
    }
    await sleep(600 * (attempt + 1));
  }
  const viaCurl = await fetchTextViaCurl(url, headers);
  if (viaCurl) return { text: viaCurl, status: 200, via: 'curl' };
  throw lastErr ?? new Error(`無法取得 ${url}`);
}

async function fetchTextViaCurl(url, headers) {
  const args = ['-sL', '--compressed', '--max-time', '30'];
  for (const [k, v] of Object.entries(headers)) args.push('-H', `${k}: ${v}`);
  args.push(url);
  try {
    const { stdout } = await pExecFile('curl', args, { maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  } catch {
    return null;
  }
}

export function isBotWall(html) {
  return /api-services-support@amazon\.com|Enter the characters you see below|Sorry, we just need to make sure/i.test(
    html,
  );
}

export { sleep };
