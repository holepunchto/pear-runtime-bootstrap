#!/usr/bin/env node

import tar from 'tar-fs'
import zlib from 'zlib'
import fs from 'fs'

tar.pack('build')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('build.tar.gz'))
  .on('finish', function () {
    console.log('Done! wrote to', 'build.tar.gz')
  })
