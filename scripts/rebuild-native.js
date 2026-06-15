const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const tar = require('tar-fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const doGet = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          file.close();
          fs.unlinkSync(dest, () => {});
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest, () => {});
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', (err) => {
        file.close();
        fs.unlinkSync(dest, () => {});
        reject(err);
      });
    };
    doGet(url);
  });
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const modulePath = path.resolve(root, 'node_modules', 'better-sqlite3');
  const pkg = JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json'), 'utf8'));

  let abi;
  try {
    const { getAbi } = require('node-abi');
    const electronPkg = JSON.parse(fs.readFileSync(path.resolve(root, 'node_modules', 'electron', 'package.json'), 'utf8'));
    abi = getAbi(electronPkg.version, 'electron');
  } catch {
    console.log('Could not determine Electron ABI, using @electron/rebuild');
    execSync('npx @electron/rebuild -m . -o better-sqlite3', { cwd: root, stdio: 'inherit' });
    return;
  }

  const platform = process.platform;
  const arch = process.arch;
  const filename = `better-sqlite3-v${pkg.version}-electron-v${abi}-${platform}-${arch}.tar.gz`;
  const url = `https://github.com/WiseLibs/better-sqlite3/releases/download/v${pkg.version}/${filename}`;
  const tmpFile = path.resolve(root, filename);

  const buildDir = path.join(modulePath, 'build', 'Release');

  console.log(`Downloading: ${filename}`);
  try {
    await download(url, tmpFile);
    console.log('Extracting...');
    const extract = tar.extract(modulePath);
    await new Promise((resolve, reject) => {
      fs.createReadStream(tmpFile).pipe(zlib.createGunzip()).pipe(extract);
      extract.on('finish', resolve);
      extract.on('error', reject);
    });
    fs.unlinkSync(tmpFile);
    fs.mkdirSync(buildDir, { recursive: true });
    fs.writeFileSync(path.join(buildDir, '.forge-meta'), `${arch}--${abi}`);
    console.log('Prebuilt module installed');
  } catch (err) {
    console.log(`Prebuilt download failed: ${err.message}. Falling back to @electron/rebuild...`);
    try { fs.unlinkSync(tmpFile); } catch {}
    execSync('npx @electron/rebuild -m . -o better-sqlite3', { cwd: root, stdio: 'inherit' });
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
