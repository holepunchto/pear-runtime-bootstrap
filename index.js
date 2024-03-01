import shell from 'shellblazer'
import { mkdir, rename } from 'fs/promises'

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
  ['bare-dev', 'build']
)

const shellForWakeup = shell.configure({ cwd: 'vendor/wakeup' })
await shellForWakeup(
  ['bare-dev', 'configure', '--verbose'],
  ['bare-dev', 'build']
)

const shellForElectronRuntime = shell.configure({ cwd: 'vendor/electron-runtime' })
await shellForElectronRuntime(
  ['npm', 'install'],
  ['npm', 'run', 'dist']
)

await mkdir('platform-build/bin/pear-runtime-app', { recursive: true })
await mkdir('platform-build/lib', { recursive: true })

await rename('vendor/electron-runtime/dist/linux-unpacked', 'platform-build/bin/pear-runtime-app')
await rename('vendor/wakeup/build/bin/pear', 'platform-build/bin/pear')
await rename('vendor/pear-runtime-bare/build/pear-runtime', 'platform-build/bin/pear-runtime')
await rename('vendor/libappling/build/launch.so', 'platform-build/lib/launch.so')
