import fs from 'fs';
import path from 'path';
import { MAP, SEMANTIC, resolveIcon } from '../appIconMap';

const glyphDir = '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps';
const ion = new Set<string>(Object.keys(require(`${glyphDir}/Ionicons.json`)));
const mci = new Set<string>(Object.keys(require(`${glyphDir}/MaterialCommunityIcons.json`)));
const isIon = (n: string) => ion.has(n);

describe('appIconMap', () => {
  it('every mapped icon exists in the installed icon fonts (a missing name draws "?")', () => {
    const bad = [...Object.entries(MAP), ...Object.entries(SEMANTIC)]
      .filter(([, d]) => !(d.lib === 'ion' ? ion : mci).has(d.name))
      .map(([k, d]) => `${k} -> ${d.lib}:${d.name}`);
    expect(bad).toEqual([]);
  });

  it('resolves mapped symbols, semantic keys and raw Ionicons names to vector icons', () => {
    expect(resolveIcon('🧠', isIon)).toEqual({ kind: 'icon', lib: 'mci', name: 'brain' });
    expect(resolveIcon('→', isIon)).toEqual({ kind: 'icon', lib: 'ion', name: 'arrow-forward' });
    expect(resolveIcon('home', isIon)).toEqual({ kind: 'icon', lib: 'ion', name: 'home' });
    expect(resolveIcon('eye-off', isIon)).toEqual({ kind: 'icon', lib: 'ion', name: 'eye-off' });
  });

  it('falls back to the character itself, never to an icon-font glyph name, for unmapped symbols', () => {
    expect(resolveIcon('🦄', isIon)).toEqual({ kind: 'text', text: '🦄' });
    expect(resolveIcon('☂', isIon)).toEqual({ kind: 'text', text: '☂' });
  });

  it('is not fooled by inherited object keys, and keeps empty names as an invisible icon', () => {
    expect(resolveIcon('constructor', isIon)).toEqual({ kind: 'text', text: 'constructor' });
    expect(resolveIcon('toString', isIon)).toEqual({ kind: 'text', text: 'toString' });
    expect(resolveIcon('', isIon)).toEqual({ kind: 'icon', lib: 'ion', name: '' });
  });

  it('every hardcoded <AppIcon name="…"> in the app resolves to a vector icon', () => {
    const root = path.resolve(__dirname, '../..');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '__tests__') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (p.endsWith('.tsx')) files.push(p);
      }
    };
    walk(root);
    const unresolved: string[] = [];
    let seen = 0;
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/<AppIcon[^>]*?\bname="([^"]*)"/g)) {
        seen += 1;
        if (resolveIcon(m[1], isIon).kind !== 'icon') unresolved.push(`${path.relative(root, f)}: ${m[1]}`);
      }
    }
    expect(seen).toBeGreaterThan(100); // guards against the regex silently matching nothing
    expect(unresolved).toEqual([]);
  });
});
