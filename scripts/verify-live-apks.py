"""Verify Android branding, installed identities and standalone live bundles."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((ROOT / 'mobile-apps.json').read_text())
OUT = Path(sys.argv[1]).resolve()
sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
if not sdk:
    raise SystemExit('Set ANDROID_HOME to the installed Android SDK directory.')
versions = [p for p in (Path(sdk) / 'build-tools').iterdir()
            if re.fullmatch(r'\d+\.\d+\.\d+', p.name) and (p / 'apksigner').exists()]
TOOLS = max(versions, key=lambda p: tuple(map(int, p.name.split('.'))))
results = []
for role, app in MANIFEST['apps'].items():
    candidates = list(OUT.glob(f'{app["apkPrefix"]}-Live-*.apk'))
    assert len(candidates) == 1, f'{role}: expected exactly one named APK in {OUT}'
    apk = candidates[0]
    signature = subprocess.check_output([str(TOOLS / 'apksigner'), 'verify', '--verbose', '--print-certs', str(apk)], text=True)
    badging = subprocess.check_output([str(TOOLS / 'aapt2'), 'dump', 'badging', str(apk)], text=True)
    native_manifest = subprocess.check_output([str(TOOLS / 'aapt2'), 'dump', 'xmltree', str(apk), '--file', 'AndroidManifest.xml'], text=True)
    assert f"package: name='{app['androidApplicationId']}'" in badging, role
    assert f"application-label:'{app['displayName']}'" in badging, role
    assert "minSdkVersion:'24'" in badging, role
    assert 'application-debuggable' not in badging, role
    assert 'com.google.firebase.MESSAGING_EVENT' in native_manifest, role
    version = re.search(r"versionName='([^']+)'", badging).group(1)
    assert version == json.loads((ROOT / app['directory'] / 'package.json').read_text())['version'], role
    with zipfile.ZipFile(apk) as archive:
        assert archive.testzip() is None, role
        names = archive.namelist()
        bundle = archive.read('assets/index.android.bundle')
        assert len(bundle) > 100_000, role
        assert MANIFEST['apiBaseUrl'].encode() in bundle, f'{role}: missing live API'
        assert app['moduleName'].encode() in bundle, f'{role}: missing native registration name'
        assert app['displayName'].encode() in bundle, f'{role}: missing displayed brand'
        assert b'-----BEGIN PRIVATE KEY-----' not in bundle, role
        assert b'-----BEGIN RSA PRIVATE KEY-----' not in bundle, role
        forbidden = [name for name in names if re.search(r'(^|/)(\.env(?:\..*)?|firebase-service-account\.json|[^/]*\.keystore)$', name)]
        assert not forbidden, f'{role}: private backend files present'
        abis = sorted({name.split('/')[1] for name in names if name.startswith('lib/') and name.endswith('.so')})
        assert abis == ['arm64-v8a', 'armeabi-v7a'], (role, abis)
    certificate = re.search(r'Signer #1 certificate SHA-256 digest: (\w+)', signature).group(1)
    assert certificate == 'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c', f'{role}: testing update certificate changed'
    result = {
        'role': role, 'display_name': app['displayName'], 'filename': apk.name,
        'source_directory': app['directory'], 'package': app['androidApplicationId'],
        'react_native_module': app['moduleName'], 'version_name': version,
        'version_code': int(re.search(r"versionCode='([^']+)'", badging).group(1)),
        'bytes': apk.stat().st_size, 'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
        'minimum_android': '7.0 (API 24)', 'abis': abis,
        'embedded_js_bytes': len(bundle), 'live_api_in_embedded_bundle': True,
        'debuggable': False, 'apk_signature_verified': True,
        'signer_certificate_sha256': certificate,
        'signing_purpose': 'Existing Android testing certificate; client QA distribution',
        'private_backend_credentials_included': False,
    }
    results.append(result)
    print(json.dumps(result), flush=True)
report = {'build_variant': 'standalone', 'api_base_url': MANIFEST['apiBaseUrl'],
          'firebase_project': 'our-bezzie-42461', 'requires_metro': False,
          'artifacts': results, 'ios_runtime_tested': False}
(OUT / 'BUILD-INFO.json').write_text(json.dumps(report, indent=2) + '\n')
(OUT / 'SHA256SUMS.txt').write_text(''.join(f'{r["sha256"]}  {r["filename"]}\n' for r in results))
