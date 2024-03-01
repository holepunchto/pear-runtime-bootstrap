#!/usr/bin/env node

import shell from 'shellblazer'
import { mkdir, rename } from 'fs/promises'
import { isLinux, isMac, isWindows, arch } from 'which-runtime'

await shell(['bare-dev', 'vendor', 'sync'])

const shellForLibappling = shell.configure({ cwd: 'vendor/libappling' })
await shellForLibappling(
  ['npm', 'install'],
  ['bare-dev', 'configure', '--verbose'],
  ['bare-dev', 'build']
)

const shellForPearRuntimeBare = shell.configure({ cwd: 'vendor/pear-runtime-bare' })
await shellForPearRuntimeBare(
  ['bare-dev', 'configure', '--verbose'],
  ['bare-dev', 'build'],
  ['cmake', '--install', 'build', '--prefix', 'out']
)

const shellForWakeup = shell.configure({ cwd: 'vendor/wakeup' })
await shellForWakeup(
  ['bare-dev', 'configure', '--verbose'],
  ['bare-dev', 'build'],
  ['cmake', '--install', 'build', '--prefix', 'out']
)

const shellForElectronRuntime = shell.configure({ cwd: 'vendor/electron-runtime' })
await shellForElectronRuntime(
  ['npm', 'install'],
  ['npm', 'run', 'dist']
)

await mkdir('build/bin', { recursive: true })
await mkdir('build/lib', { recursive: true })

const arm64 = arch === 'arm64'

if (isLinux) {
  await rename(`vendor/electron-runtime/dist/linux-${arm64 ? 'arm64-' : ''}unpacked`, 'build/bin/pear-runtime-app')
  await rename('vendor/wakeup/out/pear/pear', 'build/bin/pear')
  await rename('vendor/pear-runtime-bare/build/pear-runtime', 'build/bin/pear-runtime')
  await rename('vendor/libappling/build/launch.so', 'build/lib/launch.so')
} else if (isMac) {
  await rename(`vendor/electron-runtime/dist/mac${arm64 ? '-arm64' : ''}/Pear Runtime.app`, 'build/bin/Pear Runtime.app')
  await rename('vendor/wakeup/out/Pear.app', 'build/bin/Pear.app')
  await rename('vendor/pear-runtime-bare/build/pear-runtime', 'build/bin/pear-runtime')
  await rename('vendor/libappling/build/launch.dylib', 'build/lib/launch.dylib')
} else if (isWindows) {
  console.log('sup')
}
