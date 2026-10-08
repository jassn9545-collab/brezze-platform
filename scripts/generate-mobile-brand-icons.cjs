const fs = require('fs');
const path = require('path');

const [appDirectory, iosTarget, sourceImage] = process.argv.slice(2);

if (!appDirectory || !iosTarget || !sourceImage) {
  throw new Error(
    'Usage: node scripts/generate-mobile-brand-icons.cjs <app-directory> <ios-target> <source-image>',
  );
}

const appRoot = path.resolve(appDirectory);
const source = path.resolve(sourceImage);
const sharp = require(path.join(appRoot, 'node_modules', 'sharp'));

const androidSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const iosIcons = [
  { filename: 'AppIcon-20@2x.png', size: 40 },
  { filename: 'AppIcon-20@3x.png', size: 60 },
  { filename: 'AppIcon-29@2x.png', size: 58 },
  { filename: 'AppIcon-29@3x.png', size: 87 },
  { filename: 'AppIcon-40@2x.png', size: 80 },
  { filename: 'AppIcon-40@3x.png', size: 120 },
  { filename: 'AppIcon-60@2x.png', size: 120 },
  { filename: 'AppIcon-60@3x.png', size: 180 },
  { filename: 'AppIcon-1024.png', size: 1024 },
];

const renderIcon = async (size, destination) => {
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  const insetLogo = await sharp(source)
    .resize({
      width: 820,
      height: 820,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const composedIcon = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: insetLogo, gravity: 'centre' }])
    .flatten({ background: '#FFFFFF' })
    .png()
    .toBuffer();

  await sharp(composedIcon)
    .removeAlpha()
    .resize(size, size)
    .png()
    .toFile(destination);
};

const main = async () => {
  for (const [density, size] of Object.entries(androidSizes)) {
    const directory = path.join(
      appRoot,
      'android',
      'app',
      'src',
      'main',
      'res',
      `mipmap-${density}`,
    );
    await renderIcon(size, path.join(directory, 'ic_launcher.png'));
    await renderIcon(size, path.join(directory, 'ic_launcher_round.png'));
  }

  const appIconDirectory = path.join(
    appRoot,
    'ios',
    iosTarget,
    'Images.xcassets',
    'AppIcon.appiconset',
  );

  for (const icon of iosIcons) {
    await renderIcon(icon.size, path.join(appIconDirectory, icon.filename));
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
