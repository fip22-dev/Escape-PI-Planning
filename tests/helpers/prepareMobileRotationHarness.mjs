// Generate ignored Vite fixtures from the actual current entrypoint and HTML.
// Run with the repository as cwd, then open /.sites/qa/index.html on Vite.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('.sites/qa', { recursive: true });
const main = (await readFile('src/main.js', 'utf8'))
  .replaceAll('"./', '"/src/')
  .replace('const game = new Phaser.Game({', 'const game = new Phaser.Game({\n  fps: { forceSetTimeOut: true },');
await writeFile('.sites/qa/fixture.js', main + '\nwindow.__game = game;\n');
const html = (await readFile('index.html', 'utf8')).replace(
  '<script type="module" src="/src/main.js"></script>',
  `<script>
const originalMatchMedia = window.matchMedia.bind(window);
window.matchMedia = query => originalMatchMedia(query.replaceAll('(pointer: coarse)', '(min-width: 0px)'));
Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });
</script><script type="module" src="/.sites/qa/fixture.js"></script>`);
await writeFile('.sites/qa/fixture.html', html);
await writeFile('.sites/qa/index.html', await readFile('tests/helpers/mobileRotationHarness.html'));
console.log('Open /.sites/qa/index.html on the Vite server for ten browser checks.');
