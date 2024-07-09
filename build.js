#!/usr/bin/env node

import shell from 'shellblazer'
import { mkdir, rename } from 'fs/promises'
import { isLinux, isMac, isWindows, arch } from 'which-runtime'

let bareDev = 'bare-dev'
let cmake = 'cmake'
let npm = 'npm'

try {
  await shell([bareDev, '--version'])
} catch {
  if (isWindows) {
    bareDev += '.cmd'
    cmake += '.cmd'
    npm += '.cmd'
    await shell([bareDev, '--version'])
  }
}

await shell([bareDev, 'vendor', 'sync'])

const shellForLibappling = shell.configure({ cwd: 'vendor/libappling' })
await shellForLibappling(
  [npm, 'install'],
  [bareDev, 'configure', '--verbose'],
  [bareDev, 'build']
)

const shellForPearRuntimeBare = shell.configure({ cwd: 'vendor/pear-runtime-bare' })
await shellForPearRuntimeBare(
  [bareDev, 'configure', '--verbose'],
  [bareDev, 'build'],
  [cmake, '--install', 'build', '--prefix', 'out']
)

const shellForWakeup = shell.configure({ cwd: 'vendor/wakeup' })
await shellForWakeup(
  [bareDev, 'configure', '--verbose'],
  [bareDev, 'build'],
  [cmake, '--install', 'build', '--prefix', 'out']
)

const shellForElectronRuntime = shell.configure({ cwd: 'vendor/electron-runtime' })
await shellForElectronRuntime(
  [npm, 'install'],
  [npm, 'run', 'dist']
)

await mkdir('build/bin', { recursive: true })
await mkdir('build/lib', { recursive: true })

const arm64 = arch === 'arm64'

if (isLinux) {
  await rename(`vendor/electron-runtime/dist/linux-${arm64 ? 'arm64-' : ''}unpacked`, 'build/bin/pear-runtime-app')
  await rename('vendor/wakeup/build/bin/linux/pear', 'build/bin/pear')
  await rename('vendor/pear-runtime-bare/build/pear-runtime', 'build/bin/pear-runtime')
  await rename('vendor/libappling/build/launch.so', 'build/lib/launch.so')
} else if (isMac) {
  await rename(`vendor/electron-runtime/dist/mac${arm64 ? '-arm64' : ''}/Pear Runtime.app`, 'build/bin/Pear Runtime.app')
  await rename('vendor/wakeup/build/bin/darwin/Pear.app', 'build/bin/Pear.app')
  await rename('vendor/pear-runtime-bare/build/pear-runtime', 'build/bin/pear-runtime')
  await rename('vendor/libappling/build/launch.dylib', 'build/lib/launch.dylib')
} else if (isWindows) {
  await rename(`vendor/electron-runtime/dist/win-unpacked`, 'build/bin/pear-runtime-app')
  await rename('vendor/wakeup/build/bin/Release/pear.exe', 'build/bin/pear.exe')
  await rename('vendor/pear-runtime-bare/build/Release/pear-runtime.exe', 'build/bin/pear-runtime.exe')
  await rename('vendor/libappling/build/Release/launch.dll', 'build/lib/launch.dll')
}
