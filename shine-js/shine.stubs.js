import wasmBinaryFile from './shine.wasm?url'

const createModule = (() => {
  const _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined

  return (
    function (createModule) {
      createModule = createModule || {}

      const Module = typeof createModule != 'undefined' ? createModule : {}
      let readyPromiseResolve, readyPromiseReject
      Module.ready = new Promise((resolve, reject) => {
        readyPromiseResolve = resolve
        readyPromiseReject = reject
      })
      let moduleOverrides = Object.assign({}, Module)
      let arguments_ = []
      let thisProgram = './this.program'
      let quit_ = (status, toThrow) => {
        throw toThrow
      }
      const ENVIRONMENT_IS_WEB = true
      const ENVIRONMENT_IS_WORKER = false
      let scriptDirectory = ''

      function locateFile(path) {
        if (Module.locateFile)
          return Module.locateFile(path, scriptDirectory)

        return scriptDirectory + path
      }
      let read_, readAsync, readBinary, setWindowTitle
      if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER)
          scriptDirectory = self.location.href

        else if (typeof document != 'undefined' && document.currentScript)
          scriptDirectory = document.currentScript.src

        if (_scriptDir)
          scriptDirectory = _scriptDir

        if (scriptDirectory.indexOf('blob:') !== 0)
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1)

        else
          scriptDirectory = ''
				 {
          read_ = (url) => {
            try {
              const xhr = new XMLHttpRequest()
              xhr.open('GET', url, false)
              xhr.send(null)
              return xhr.responseText
            }
            catch (err) {
              const data = tryParseAsDataURI(url)
              if (data)
                return intArrayToString(data)

              throw err
            }
          }
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              try {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', url, false)
                xhr.responseType = 'arraybuffer'
                xhr.send(null)
                return new Uint8Array(xhr.response)
              }
              catch (err) {
                const data = tryParseAsDataURI(url)
                if (data)
                  return data

                throw err
              }
            }
          }
          readAsync = (url, onload, onerror) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url, true)
            xhr.responseType = 'arraybuffer'
            xhr.onload = () => {
              if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response)
                return
              }
              const data = tryParseAsDataURI(url)
              if (data) {
                onload(data.buffer)
                return
              }
              onerror()
            }
            xhr.onerror = onerror
            xhr.send(null)
          }
        }
        setWindowTitle = title => document.title = title
      }
      else {}
      const out = Module.print || console.log.bind(console)
      const err = Module.printErr || console.warn.bind(console)
      Object.assign(Module, moduleOverrides)
      moduleOverrides = null
      if (Module.arguments) arguments_ = Module.arguments
      if (Module.thisProgram) thisProgram = Module.thisProgram
      if (Module.quit) quit_ = Module.quit
      let wasmBinary
      if (Module.wasmBinary) wasmBinary = Module.wasmBinary
      const noExitRuntime = Module.noExitRuntime || true
      if (typeof WebAssembly != 'object')
        abort('no native wasm support detected')

      let wasmMemory
      let ABORT = false
      let EXITSTATUS

      function assert(condition, text) {
        if (!condition)
          abort(text)
      }
      let buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64

      function updateGlobalBufferAndViews(buf) {
        buffer = buf
        Module.HEAP8 = HEAP8 = new Int8Array(buf)
        Module.HEAP16 = HEAP16 = new Int16Array(buf)
        Module.HEAP32 = HEAP32 = new Int32Array(buf)
        Module.HEAPU8 = HEAPU8 = new Uint8Array(buf)
        Module.HEAPU16 = HEAPU16 = new Uint16Array(buf)
        Module.HEAPU32 = HEAPU32 = new Uint32Array(buf)
        Module.HEAPF32 = HEAPF32 = new Float32Array(buf)
        Module.HEAPF64 = HEAPF64 = new Float64Array(buf)
      }
      const INITIAL_MEMORY = Module.INITIAL_MEMORY || 16777216
      let wasmTable
      const __ATPRERUN__ = []
      const __ATINIT__ = []
      const __ATPOSTRUN__ = []
      let runtimeInitialized = false

      function preRun() {
        if (Module.preRun) {
          if (typeof Module.preRun == 'function') Module.preRun = [Module.preRun]
          while (Module.preRun.length)
            addOnPreRun(Module.preRun.shift())
        }
        callRuntimeCallbacks(__ATPRERUN__)
      }

      function initRuntime() {
        runtimeInitialized = true
        callRuntimeCallbacks(__ATINIT__)
      }

      function postRun() {
        if (Module.postRun) {
          if (typeof Module.postRun == 'function') Module.postRun = [Module.postRun]
          while (Module.postRun.length)
            addOnPostRun(Module.postRun.shift())
        }
        callRuntimeCallbacks(__ATPOSTRUN__)
      }

      function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb)
      }

      function addOnInit(cb) {
        __ATINIT__.unshift(cb)
      }

      function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb)
      }
      let runDependencies = 0
      let runDependencyWatcher = null
      let dependenciesFulfilled = null

      function addRunDependency(id) {
        runDependencies++
        if (Module.monitorRunDependencies)
          Module.monitorRunDependencies(runDependencies)
      }

      function removeRunDependency(id) {
        runDependencies--
        if (Module.monitorRunDependencies)
          Module.monitorRunDependencies(runDependencies)

        if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher)
            runDependencyWatcher = null
          }
          if (dependenciesFulfilled) {
            const callback = dependenciesFulfilled
            dependenciesFulfilled = null
            callback()
          }
        }
      }

      function abort(what) {
        if (Module.onAbort)
          Module.onAbort(what)

        what = `Aborted(${what})`
        err(what)
        ABORT = true
        EXITSTATUS = 1
        what += '. Build with -sASSERTIONS for more info.'
        const e = new WebAssembly.RuntimeError(what)
        readyPromiseReject(e)
        throw e
      }
      const dataURIPrefix = 'data:application/octet-stream;base64,'

      function isDataURI(filename) {
        return filename.startsWith(dataURIPrefix)
      }

      // if (!isDataURI(wasmBinaryFile)) {
      // 	wasmBinaryFile = locateFile(wasmBinaryFile)
      // }

      function getBinary(file) {
        try {
          if (file == wasmBinaryFile && wasmBinary)
            return new Uint8Array(wasmBinary)

          const binary = tryParseAsDataURI(file)
          if (binary)
            return binary

          if (readBinary)
            return readBinary(file)

          throw 'both async and sync fetching of the wasm failed'
        }
        catch (err) {
          abort(err)
        }
      }

      function getBinaryPromise() {
        if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
          if (typeof fetch == 'function') {
            return fetch(wasmBinaryFile, {
              credentials: 'same-origin'
            }).then((response) => {
              if (!response.ok)
                throw `failed to load wasm binary file at '${wasmBinaryFile}'`

              return response.arrayBuffer()
            }).catch(() => {
              return getBinary(wasmBinaryFile)
            })
          }
        }
        return Promise.resolve().then(() => {
          return getBinary(wasmBinaryFile)
        })
      }

      function createWasm() {
        const info = {
          a: asmLibraryArg
        }

        function receiveInstance(instance, module) {
          const exports = instance.exports
          Module.asm = exports
          wasmMemory = Module.asm.c
          updateGlobalBufferAndViews(wasmMemory.buffer)
          wasmTable = Module.asm.o
          addOnInit(Module.asm.d)
          removeRunDependency('wasm-instantiate')
        }
        addRunDependency('wasm-instantiate')

        function receiveInstantiationResult(result) {
          receiveInstance(result.instance)
        }

        function instantiateArrayBuffer(receiver) {
          return getBinaryPromise().then((binary) => {
            return WebAssembly.instantiate(binary, info)
          }).then((instance) => {
            return instance
          }).then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`)
            abort(reason)
          })
        }

        function instantiateAsync() {
          if (!wasmBinary && typeof WebAssembly.instantiateStreaming == 'function' && !isDataURI(wasmBinaryFile) && typeof fetch == 'function') {
            return fetch(wasmBinaryFile, {
              credentials: 'same-origin'
            }).then((response) => {
              const result = WebAssembly.instantiateStreaming(response, info)
              return result.then(receiveInstantiationResult, (reason) => {
                err(`wasm streaming compile failed: ${reason}`)
                err('falling back to ArrayBuffer instantiation')
                return instantiateArrayBuffer(receiveInstantiationResult)
              })
            })
          }
          else {
            return instantiateArrayBuffer(receiveInstantiationResult)
          }
        }
        if (Module.instantiateWasm) {
          try {
            const exports = Module.instantiateWasm(info, receiveInstance)
            return exports
          }
          catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`)
            readyPromiseReject(e)
          }
        }
        instantiateAsync().catch(readyPromiseReject)
        return {}
      }
      let tempDouble
      let tempI64

      function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0)
          callbacks.shift()(Module)
      }

      function getValue(ptr, type = 'i8') {
        if (type.endsWith('*')) type = '*'
        switch (type) {
          case 'i1':
            return HEAP8[ptr >> 0]
          case 'i8':
            return HEAP8[ptr >> 0]
          case 'i16':
            return HEAP16[ptr >> 1]
          case 'i32':
            return HEAP32[ptr >> 2]
          case 'i64':
            return HEAP32[ptr >> 2]
          case 'float':
            return HEAPF32[ptr >> 2]
          case 'double':
            return HEAPF64[ptr >> 3]
          case '*':
            return HEAPU32[ptr >> 2]
          default:
            abort(`invalid type for getValue: ${type}`)
        }
        return null
      }

      function intArrayToString(array) {
        const ret = []
        for (let i = 0; i < array.length; i++) {
          let chr = array[i]
          if (chr > 255) {
            if (ASSERTIONS)
              assert(false, `Character code ${chr} (${String.fromCharCode(chr)})  at offset ${i} not in 0x00-0xFF.`)

            chr &= 255
          }
          ret.push(String.fromCharCode(chr))
        }
        return ret.join('')
      }

      function setValue(ptr, value, type = 'i8') {
        if (type.endsWith('*')) type = '*'
        switch (type) {
          case 'i1':
            HEAP8[ptr >> 0] = value
            break
          case 'i8':
            HEAP8[ptr >> 0] = value
            break
          case 'i16':
            HEAP16[ptr >> 1] = value
            break
          case 'i32':
            HEAP32[ptr >> 2] = value
            break
          case 'i64':
            tempI64 = [value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1]
            break
          case 'float':
            HEAPF32[ptr >> 2] = value
            break
          case 'double':
            HEAPF64[ptr >> 3] = value
            break
          case '*':
            HEAPU32[ptr >> 2] = value
            break
          default:
            abort(`invalid type for setValue: ${type}`)
        }
      }

      function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num)
      }

      function abortOnCannotGrowMemory(requestedSize) {
        abort('OOM')
      }

      function _emscripten_resize_heap(requestedSize) {
        const oldSize = HEAPU8.length
        requestedSize = requestedSize >>> 0
        abortOnCannotGrowMemory(requestedSize)
      }
      var ASSERTIONS = false
      const decodeBase64 = typeof atob == 'function'
        ? atob
        : function (input) {
          const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
          let output = ''
          let chr1, chr2, chr3
          let enc1, enc2, enc3, enc4
          let i = 0
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
          do {
            enc1 = keyStr.indexOf(input.charAt(i++))
            enc2 = keyStr.indexOf(input.charAt(i++))
            enc3 = keyStr.indexOf(input.charAt(i++))
            enc4 = keyStr.indexOf(input.charAt(i++))
            chr1 = enc1 << 2 | enc2 >> 4
            chr2 = (enc2 & 15) << 4 | enc3 >> 2
            chr3 = (enc3 & 3) << 6 | enc4
            output = output + String.fromCharCode(chr1)
            if (enc3 !== 64)
              output = output + String.fromCharCode(chr2)

            if (enc4 !== 64)
              output = output + String.fromCharCode(chr3)
          } while (i < input.length)
          return output
        }

      function intArrayFromBase64(s) {
        try {
          const decoded = decodeBase64(s)
          const bytes = new Uint8Array(decoded.length)
          for (let i = 0; i < decoded.length; ++i)
            bytes[i] = decoded.charCodeAt(i)

          return bytes
        }
        catch (_) {
          throw new Error('Converting base64 string to bytes failed.')
        }
      }

      function tryParseAsDataURI(filename) {
        if (!isDataURI(filename))
          return

        return intArrayFromBase64(filename.slice(dataURIPrefix.length))
      }
      var asmLibraryArg = {
        b: _emscripten_memcpy_big,
        a: _emscripten_resize_heap
      }
      const asm = createWasm()
      var ___wasm_call_ctors = Module.___wasm_call_ctors = function () {
        return (___wasm_call_ctors = Module.___wasm_call_ctors = Module.asm.d).apply(null, arguments)
      }
      var _malloc = Module._malloc = function () {
        return (_malloc = Module._malloc = Module.asm.e).apply(null, arguments)
      }
      var _free = Module._free = function () {
        return (_free = Module._free = Module.asm.f).apply(null, arguments)
      }
      var _shine_check_config = Module._shine_check_config = function () {
        return (_shine_check_config = Module._shine_check_config = Module.asm.g).apply(null, arguments)
      }
      var _shine_samples_per_pass = Module._shine_samples_per_pass = function () {
        return (_shine_samples_per_pass = Module._shine_samples_per_pass = Module.asm.h).apply(null, arguments)
      }
      var _shine_encode_buffer = Module._shine_encode_buffer = function () {
        return (_shine_encode_buffer = Module._shine_encode_buffer = Module.asm.i).apply(null, arguments)
      }
      var _shine_flush = Module._shine_flush = function () {
        return (_shine_flush = Module._shine_flush = Module.asm.j).apply(null, arguments)
      }
      var _shine_close = Module._shine_close = function () {
        return (_shine_close = Module._shine_close = Module.asm.k).apply(null, arguments)
      }
      var _shine_js_int16_len = Module._shine_js_int16_len = function () {
        return (_shine_js_int16_len = Module._shine_js_int16_len = Module.asm.l).apply(null, arguments)
      }
      var _shine_js_ptr_len = Module._shine_js_ptr_len = function () {
        return (_shine_js_ptr_len = Module._shine_js_ptr_len = Module.asm.m).apply(null, arguments)
      }
      var _shine_js_init = Module._shine_js_init = function () {
        return (_shine_js_init = Module._shine_js_init = Module.asm.n).apply(null, arguments)
      }
      Module.setValue = setValue
      Module.getValue = getValue
      let calledRun
      dependenciesFulfilled = function runCaller() {
        if (!calledRun) run()
        if (!calledRun) dependenciesFulfilled = runCaller
      }

      function run(args) {
        args = args || arguments_
        if (runDependencies > 0)
          return

        preRun()
        if (runDependencies > 0)
          return

        function doRun() {
          if (calledRun) return
          calledRun = true
          Module.calledRun = true
          if (ABORT) return
          initRuntime()
          readyPromiseResolve(Module)
          if (Module.onRuntimeInitialized) Module.onRuntimeInitialized()
          postRun()
        }
        if (Module.setStatus) {
          Module.setStatus('Running...')
          setTimeout(() => {
            setTimeout(() => {
              Module.setStatus('')
            }, 1)
            doRun()
          }, 1)
        }
        else {
          doRun()
        }
      }
      if (Module.preInit) {
        if (typeof Module.preInit == 'function') Module.preInit = [Module.preInit]
        while (Module.preInit.length > 0)
          Module.preInit.pop()()
      }
      run()

      return createModule.ready
    }
  )
})()

export default createModule
