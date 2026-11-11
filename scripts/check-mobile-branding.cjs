const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = require('../mobile-apps.json');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

for (const [role, app] of Object.entries(manifest.apps)) {
  const prefix = app.directory;
  const metadata = JSON.parse(read(`${prefix}/app.json`));
  assert.equal(metadata.name, app.moduleName, `${role}: React Native module`);
  assert.equal(metadata.displayName, app.displayName, `${role}: display name`);
  assert.equal(JSON.parse(read(`${prefix}/package.json`)).name, path.basename(prefix));
  assert.match(read(`${prefix}/android/settings.gradle`), new RegExp(`rootProject.name = '${app.moduleName}'`));
  assert.ok(read(`${prefix}/android/app/src/main/res/values/strings.xml`).includes(`>${app.displayName}</string>`));
  const nativeSource = `${prefix}/android/app/src/main/java/${app.androidApplicationId.replaceAll('.', '/')}`;
  assert.ok(read(`${nativeSource}/MainActivity.kt`).includes(`getMainComponentName(): String = "${app.moduleName}"`));
  assert.ok(read(`${nativeSource}/MainApplication.kt`).includes(`"${app.displayName} updates"`));
  assert.ok(read(`${prefix}/src/utils/foregroundNotification.ts`).includes(`name: '${app.displayName} updates'`));
  assert.ok(read(`${prefix}/ios/${app.moduleName}/AppDelegate.swift`).includes(`withModuleName: "${app.moduleName}"`));
  assert.ok(read(`${prefix}/ios/${app.moduleName}/Info.plist`).includes(`<string>${app.displayName}</string>`));
  assert.ok(fs.existsSync(path.join(root, prefix, 'ios', `${app.moduleName}.xcodeproj`)));
  assert.ok(fs.existsSync(path.join(root, prefix, 'ios', `${app.moduleName}.xcworkspace`)));
  assert.ok(read(`${prefix}/ios/Podfile`).includes(`target '${app.moduleName}'`));
  assert.ok(fs.existsSync(path.join(root, prefix, app.logo)), `${role}: source logo`);
  const firebase = JSON.parse(read(`${prefix}/android/app/google-services.json`));
  assert.equal(firebase.project_info.project_id, 'our-bezzie-42461');
  assert.ok(firebase.client.some(client => client.client_info.android_client_info.package_name === app.androidApplicationId), `${role}: Firebase application ID`);
  assert.ok(read(`${prefix}/src/config/urls.ts`).includes(manifest.apiBaseUrl), `${role}: live API`);
  assert.ok(read(`${prefix}/android/app/build.gradle`).includes(`applicationId "${app.androidApplicationId}"`));
  const backendApp = read('apps/backend/config/mobile_apps.php').match(new RegExp(`'${role}' => \\[([\\s\\S]*?)\\]`));
  assert.ok(backendApp?.[1].includes(`'name' => '${app.displayName}'`), `${role}: backend display label`);
  assert.ok(backendApp?.[1].includes(`'android_application_id' => '${app.androidApplicationId}'`), `${role}: backend installation identity`);
  console.log(`${app.displayName} = ${role} | ${prefix} | ${app.androidApplicationId}`);
}
console.log('Mobile/backend brands, native modules, folders, live API and Firebase mappings are consistent.');
