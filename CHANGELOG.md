# Changelog


## v2.0.5-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v2.0.4-0...v2.0.5-0)

### 🩹 Fixes

- Ssr issue caused by extending dom api in global scope ([4cebfa9](https://github.com/dapotatoman/vocal-recorder/commit/4cebfa9))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v2.0.4-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v2.0.2-0...v2.0.4-0)

### 🚀 Enhancements

- **recorder:** Improve audio worklet loading logic in bundled package ([86949af](https://github.com/dapotatoman/vocal-recorder/commit/86949af))
- Add optional `LameEncoder` ([b5b0909](https://github.com/dapotatoman/vocal-recorder/commit/b5b0909))

### 🩹 Fixes

- Set minimum sample rate of `44100` ([ec74dae](https://github.com/dapotatoman/vocal-recorder/commit/ec74dae))

### 🏡 Chore

- Bump version ([52aaf85](https://github.com/dapotatoman/vocal-recorder/commit/52aaf85))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v2.0.3-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v2.0.2-0...v2.0.3-0)

### 🚀 Enhancements

- **recorder:** Improve audio worklet loading logic in bundled package ([86949af](https://github.com/dapotatoman/vocal-recorder/commit/86949af))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v2.0.2-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v2.0.1-0...v2.0.2-0)

### 🚀 Enhancements

- Improve `AudioRecorderAnalyser` api ([9230e31](https://github.com/dapotatoman/vocal-recorder/commit/9230e31))
- Implement worklet based recorder ([a61183f](https://github.com/dapotatoman/vocal-recorder/commit/a61183f))
- **webapp:** Add legacy polyfills ([610acda](https://github.com/dapotatoman/vocal-recorder/commit/610acda))
- **webapp:** Add eruda console ([d3d237a](https://github.com/dapotatoman/vocal-recorder/commit/d3d237a))
- **webapp:** Update preview script ([566df38](https://github.com/dapotatoman/vocal-recorder/commit/566df38))
- **recorder:** Improve `postMessage` transfer data logic ([0932900](https://github.com/dapotatoman/vocal-recorder/commit/0932900))

### 🩹 Fixes

- **webapp:** UseRecorderTimer wrong formatting ([467177d](https://github.com/dapotatoman/vocal-recorder/commit/467177d))
- **recorder:** AudioWorklet being inlined in build ([264a73b](https://github.com/dapotatoman/vocal-recorder/commit/264a73b))
- **recorder:** Legacy `postMessage` api support ([b6354b7](https://github.com/dapotatoman/vocal-recorder/commit/b6354b7))

### 💅 Refactors

- UseAudioRecorderAnalyser() - Expose `reset()` method - Expose `events` variable ([da97ac5](https://github.com/dapotatoman/vocal-recorder/commit/da97ac5))
- Remove MediaRecorder based encoder ([5177b0f](https://github.com/dapotatoman/vocal-recorder/commit/5177b0f))
- **recorder:** AudioProcessor class ([ea1a912](https://github.com/dapotatoman/vocal-recorder/commit/ea1a912))

### 🏡 Chore

- Update eslint config ([e8ead4a](https://github.com/dapotatoman/vocal-recorder/commit/e8ead4a))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v2.0.1-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v2.0.0-0...v2.0.1-0)

### 🚀 Enhancements

- Expose MediaStream `stream` variable in AudioRecorder `init` event ([a0bccad](https://github.com/dapotatoman/vocal-recorder/commit/a0bccad))
- **recorder/utils:** Add `getAudioContext` utility ([4ea181c](https://github.com/dapotatoman/vocal-recorder/commit/4ea181c))
- **tests:** Enable playwright browser autoplay without user gesture ([73dfa0d](https://github.com/dapotatoman/vocal-recorder/commit/73dfa0d))
- Add `useAudioRecorderAnalyser` utility ([cc1ec45](https://github.com/dapotatoman/vocal-recorder/commit/cc1ec45))

### 💅 Refactors

- `getWindow()` usage and global types ([1b95b72](https://github.com/dapotatoman/vocal-recorder/commit/1b95b72))
- **webapp:** Use `getAudioContext()` ([d20ddad](https://github.com/dapotatoman/vocal-recorder/commit/d20ddad))

### 🏡 Chore

- Update release script ([07e20b6](https://github.com/dapotatoman/vocal-recorder/commit/07e20b6))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

## v2.0.0-0

[compare changes](https://github.com/dapotatoman/vocal-recorder/compare/v1.3.5...v2.0.0-0)

### 🚀 Enhancements

- Implement new encoding logic ([9fdf60d](https://github.com/dapotatoman/vocal-recorder/commit/9fdf60d))
- Add tests ([56757d5](https://github.com/dapotatoman/vocal-recorder/commit/56757d5))
- Improve vitest config ([9d06d77](https://github.com/dapotatoman/vocal-recorder/commit/9d06d77))
- Expose Events Map/Keys types ([cd9ef8a](https://github.com/dapotatoman/vocal-recorder/commit/cd9ef8a))
- Improve webapp ([1a98fb0](https://github.com/dapotatoman/vocal-recorder/commit/1a98fb0))
- Improve blobToBuffer utility logic ([b9d063f](https://github.com/dapotatoman/vocal-recorder/commit/b9d063f))
- Add `toFixed(digits)` method in AudioPeaks class ([000e470](https://github.com/dapotatoman/vocal-recorder/commit/000e470))
- Add tests for AudioPeaks model ([1773c6e](https://github.com/dapotatoman/vocal-recorder/commit/1773c6e))
- **webapp:** Update ([7081bdf](https://github.com/dapotatoman/vocal-recorder/commit/7081bdf))
- **webapp:** Migrate to nuxt ([0ca4722](https://github.com/dapotatoman/vocal-recorder/commit/0ca4722))
- **webapp:** Improve ui ([2c5c97a](https://github.com/dapotatoman/vocal-recorder/commit/2c5c97a))
- **recorder:** Only allow single channel encoding ([71cfd5f](https://github.com/dapotatoman/vocal-recorder/commit/71cfd5f))
- **recorder:** Allow custom stream to be used by AudioRecorder ([e52da71](https://github.com/dapotatoman/vocal-recorder/commit/e52da71))
- **webapp:** Add `/record/from-stream` page ([cb2590b](https://github.com/dapotatoman/vocal-recorder/commit/cb2590b))

### 🩹 Fixes

- Lint issues ([a371810](https://github.com/dapotatoman/vocal-recorder/commit/a371810))
- **recorder:** Use proper sampleRate to decode audio data - Fixes bad pitch tone in recording ([e2e94d2](https://github.com/dapotatoman/vocal-recorder/commit/e2e94d2))
- `getAudioBuffer` mutates original buffer ([ffccf61](https://github.com/dapotatoman/vocal-recorder/commit/ffccf61))
- **webapp:** `toReversed()` api breaks build ([90c7de5](https://github.com/dapotatoman/vocal-recorder/commit/90c7de5))
- **recorder:** Tick sound between timeslice chunks ([0c5f997](https://github.com/dapotatoman/vocal-recorder/commit/0c5f997))
- **recorder:** Use legacy `decodeAudioData` function expression ([0b34439](https://github.com/dapotatoman/vocal-recorder/commit/0b34439))
- **tests:** Hanging await assertions ([d863df0](https://github.com/dapotatoman/vocal-recorder/commit/d863df0))
- Vite build not working Downgraded vite to v5 ([23864d5](https://github.com/dapotatoman/vocal-recorder/commit/23864d5))
- Lint issues ([c5cb5b6](https://github.com/dapotatoman/vocal-recorder/commit/c5cb5b6))

### 💅 Refactors

- **recorder:** Update code ([6d9bed1](https://github.com/dapotatoman/vocal-recorder/commit/6d9bed1))
- Remove `audioBitsPerSecond` variable in Encoder.Config ([8457125](https://github.com/dapotatoman/vocal-recorder/commit/8457125))
- **recorder/encoder:** UseExpandedBuffer code ([1b4c115](https://github.com/dapotatoman/vocal-recorder/commit/1b4c115))
- `AudioRecorder.Events` ([b62720f](https://github.com/dapotatoman/vocal-recorder/commit/b62720f))
- Shine encoder worker ([98ed4b4](https://github.com/dapotatoman/vocal-recorder/commit/98ed4b4))

### 🏡 Chore

- Upgrade deps ([0e85700](https://github.com/dapotatoman/vocal-recorder/commit/0e85700))
- Remove unused deps ([bd271a8](https://github.com/dapotatoman/vocal-recorder/commit/bd271a8))
- Update esling config/deps ([b8cce00](https://github.com/dapotatoman/vocal-recorder/commit/b8cce00))
- Include sourcemaps in build ([a8d2f2a](https://github.com/dapotatoman/vocal-recorder/commit/a8d2f2a))
- Update package.json ([95b9fd5](https://github.com/dapotatoman/vocal-recorder/commit/95b9fd5))
- Update tests ([bb44b03](https://github.com/dapotatoman/vocal-recorder/commit/bb44b03))
- Update tests ([d4d0ace](https://github.com/dapotatoman/vocal-recorder/commit/d4d0ace))
- Update release script ([89d7555](https://github.com/dapotatoman/vocal-recorder/commit/89d7555))

### ❤️ Contributors

- Fahad ([@DaPotatoMan](http://github.com/DaPotatoMan))

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

