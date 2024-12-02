# Changelog


## v1.3.5

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.4...v1.3.5)

### 🩹 Fixes

- `getOfflineAudioContext()` breaks in safari 14 due to not using `webkitAudioContext` ([4f83214](https://github.com/dapotatoman/vocal-recorder/commit/4f83214))
- Lint issues ([908efbc](https://github.com/dapotatoman/vocal-recorder/commit/908efbc))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v1.3.4

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.3...v1.3.4)

### 🩹 Fixes

- Docs webpage build issue ([66374b2](https://github.com/dapotatoman/vocal-recorder/commit/66374b2))
- Encoder.Config not using opus codec when supported ([db91349](https://github.com/dapotatoman/vocal-recorder/commit/db91349))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v1.3.3

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.2...v1.3.3)

### 🩹 Fixes

- Improve `getBlobCodec` ([7156b43](https://github.com/dapotatoman/vocal-recorder/commit/7156b43))
- Lint issues ([b2a4479](https://github.com/dapotatoman/vocal-recorder/commit/b2a4479))

### 🏡 Chore

- Update deps ([cb03f87](https://github.com/dapotatoman/vocal-recorder/commit/cb03f87))
- Update Codecs order ([bd719bd](https://github.com/dapotatoman/vocal-recorder/commit/bd719bd))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v1.3.2

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.1...v1.3.2)

### 🩹 Fixes

- Build types using source structure ([89ac1ee](https://github.com/dapotatoman/vocal-recorder/commit/89ac1ee))

### 🏡 Chore

- Upgrade deps ([de7fe08](https://github.com/dapotatoman/vocal-recorder/commit/de7fe08))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v1.3.1

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.0...v1.3.1)

### 🏡 Chore

- Update package.json ([bb76e5f](https://github.com/dapotatoman/vocal-recorder/commit/bb76e5f))
- Update package.json ([9377b14](https://github.com/dapotatoman/vocal-recorder/commit/9377b14))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v1.3.0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.2.0...v1.3.0)

### 🚀 Enhancements

- Add workflow for webapp deployment ([5922633](https://github.com/dapotatoman/vocal-recorder/commit/5922633))
- Add tests for recorder ([19efe4b](https://github.com/dapotatoman/vocal-recorder/commit/19efe4b))

### 🩹 Fixes

- **deps:** Package vulnerabilities ([efd5e75](https://github.com/dapotatoman/vocal-recorder/commit/efd5e75))
- Improve `AudioBlob.fromFile` codec parsing feat: Add `getBlobCodec` util ([b539aac](https://github.com/dapotatoman/vocal-recorder/commit/b539aac))

### 🏡 Chore

- Add postinstall script ([7d3a436](https://github.com/dapotatoman/vocal-recorder/commit/7d3a436))
- Upgrade deps ([8c0273c](https://github.com/dapotatoman/vocal-recorder/commit/8c0273c))
- Update tsconfig ([185270f](https://github.com/dapotatoman/vocal-recorder/commit/185270f))
- Update pnpm version ([d321789](https://github.com/dapotatoman/vocal-recorder/commit/d321789))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))
- Dapotatoman <iam.fahadul@gmail.com>

## v1.2.0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.0.2...v1.2.0)

### 🚀 Enhancements

- Add new recorder ([eb5c075](https://github.com/dapotatoman/vocal-recorder/commit/eb5c075))
- Improve ([34ea858](https://github.com/dapotatoman/vocal-recorder/commit/34ea858))
- **major:** Improve recorder ([e356ce8](https://github.com/dapotatoman/vocal-recorder/commit/e356ce8))
- Add restart method ([cf50c8e](https://github.com/dapotatoman/vocal-recorder/commit/cf50c8e))
- Improve implementation ([b5eb33d](https://github.com/dapotatoman/vocal-recorder/commit/b5eb33d))
- Implement new encoders ([c78e6ba](https://github.com/dapotatoman/vocal-recorder/commit/c78e6ba))
- Improve UI ([6a3e5e4](https://github.com/dapotatoman/vocal-recorder/commit/6a3e5e4))
- Improve UI ([3f9e7c9](https://github.com/dapotatoman/vocal-recorder/commit/3f9e7c9))
- Implement new encoders ([baad826](https://github.com/dapotatoman/vocal-recorder/commit/baad826))
- Improve implementation ([0ac5e7e](https://github.com/dapotatoman/vocal-recorder/commit/0ac5e7e))
- Export `/peaks` utils ([de62897](https://github.com/dapotatoman/vocal-recorder/commit/de62897))
- Add `getAudioInfo` util ([7c7950e](https://github.com/dapotatoman/vocal-recorder/commit/7c7950e))
- Add `AudioBlob.fromFile` util ([2dc4fe6](https://github.com/dapotatoman/vocal-recorder/commit/2dc4fe6))
- Add `prefetchCodecs` util ([8c34a25](https://github.com/dapotatoman/vocal-recorder/commit/8c34a25))
- **AudioBlob:** Add id param ([a11cffc](https://github.com/dapotatoman/vocal-recorder/commit/a11cffc))
- Add parcel builder ([50bd46f](https://github.com/dapotatoman/vocal-recorder/commit/50bd46f))
- Add tsup build pipeline ([f91d01d](https://github.com/dapotatoman/vocal-recorder/commit/f91d01d))
- **core:** Add build step ([db69258](https://github.com/dapotatoman/vocal-recorder/commit/db69258))

### 🔥 Performance

- Remove `globalThis.Buffer` setting ([65d1ffb](https://github.com/dapotatoman/vocal-recorder/commit/65d1ffb))

### 🩹 Fixes

- Build not working ([c541df3](https://github.com/dapotatoman/vocal-recorder/commit/c541df3))
- Lockfile ([12702bf](https://github.com/dapotatoman/vocal-recorder/commit/12702bf))
- Workflows ([b8ed388](https://github.com/dapotatoman/vocal-recorder/commit/b8ed388))
- Webapp imports ([1eba4a2](https://github.com/dapotatoman/vocal-recorder/commit/1eba4a2))
- Dispose before calling stop event ([2d50b37](https://github.com/dapotatoman/vocal-recorder/commit/2d50b37))
- **webapp:** Scripts ([451c05c](https://github.com/dapotatoman/vocal-recorder/commit/451c05c))
- Encoding sampleRate issues ([ba95217](https://github.com/dapotatoman/vocal-recorder/commit/ba95217))
- Import typo ([84c25b7](https://github.com/dapotatoman/vocal-recorder/commit/84c25b7))
- Circular imports ([b1e7b6a](https://github.com/dapotatoman/vocal-recorder/commit/b1e7b6a))
- Package build ([863385b](https://github.com/dapotatoman/vocal-recorder/commit/863385b))
- Package files ([a5c156a](https://github.com/dapotatoman/vocal-recorder/commit/a5c156a))
- Example app ([4b6ece1](https://github.com/dapotatoman/vocal-recorder/commit/4b6ece1))
- Use `nanoid` instead of crypto ([02cb1f4](https://github.com/dapotatoman/vocal-recorder/commit/02cb1f4))
- Lint issues ([80bdcca](https://github.com/dapotatoman/vocal-recorder/commit/80bdcca))

### 💅 Refactors

- `getGlobalThis` usage ([61f42ed](https://github.com/dapotatoman/vocal-recorder/commit/61f42ed))
- GetAudioBuffer util ([48e33b3](https://github.com/dapotatoman/vocal-recorder/commit/48e33b3))
- **useMP3Encoder:** Worker loader logic ([64ca49f](https://github.com/dapotatoman/vocal-recorder/commit/64ca49f))
- Code ([a7a67dd](https://github.com/dapotatoman/vocal-recorder/commit/a7a67dd))
- Project ([734d368](https://github.com/dapotatoman/vocal-recorder/commit/734d368))

### 🏡 Chore

- Release v1.0.3 ([215e03e](https://github.com/dapotatoman/vocal-recorder/commit/215e03e))
- Update package.json ([e62de32](https://github.com/dapotatoman/vocal-recorder/commit/e62de32))
- Release v1.0.4 ([54de1e7](https://github.com/dapotatoman/vocal-recorder/commit/54de1e7))
- Cleanup ([7b1c214](https://github.com/dapotatoman/vocal-recorder/commit/7b1c214))
- Update license ([83ec14b](https://github.com/dapotatoman/vocal-recorder/commit/83ec14b))
- Bump version ([3d536f7](https://github.com/dapotatoman/vocal-recorder/commit/3d536f7))
- Update lockfile ([e674ba2](https://github.com/dapotatoman/vocal-recorder/commit/e674ba2))
- Bump version ([b55fd77](https://github.com/dapotatoman/vocal-recorder/commit/b55fd77))
- Update code ([511bd83](https://github.com/dapotatoman/vocal-recorder/commit/511bd83))
- Upgrade deps ([96a939a](https://github.com/dapotatoman/vocal-recorder/commit/96a939a))
- Bump ([851433e](https://github.com/dapotatoman/vocal-recorder/commit/851433e))
- Bump version ([89fb412](https://github.com/dapotatoman/vocal-recorder/commit/89fb412))
- Bump version ([3c91323](https://github.com/dapotatoman/vocal-recorder/commit/3c91323))
- Bump version ([01f0cc7](https://github.com/dapotatoman/vocal-recorder/commit/01f0cc7))
- Expose `RecorderEvent` ([2036d87](https://github.com/dapotatoman/vocal-recorder/commit/2036d87))
- Update package.json ([499bf2d](https://github.com/dapotatoman/vocal-recorder/commit/499bf2d))
- Bump version ([f49df28](https://github.com/dapotatoman/vocal-recorder/commit/f49df28))
- Add renovate config ([c97a7cf](https://github.com/dapotatoman/vocal-recorder/commit/c97a7cf))
- Upgrade deps ([a11db73](https://github.com/dapotatoman/vocal-recorder/commit/a11db73))
- Update eslint config ([7b9bae9](https://github.com/dapotatoman/vocal-recorder/commit/7b9bae9))
- Add LICENSE ([8b4970b](https://github.com/dapotatoman/vocal-recorder/commit/8b4970b))
- Remove .npmrc ([067dca0](https://github.com/dapotatoman/vocal-recorder/commit/067dca0))
- Update package.json ([3fcedff](https://github.com/dapotatoman/vocal-recorder/commit/3fcedff))
- **AudioBlob:** Add test ([8eab53b](https://github.com/dapotatoman/vocal-recorder/commit/8eab53b))
- Add changelogen ([559516e](https://github.com/dapotatoman/vocal-recorder/commit/559516e))

### ❤️ Contributors

- Dapotatoman <iam.fahadul@gmail.com>
- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

