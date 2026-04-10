// Creates a favicon.ico (ICO file containing a PNG) from the existing favicon.png
// Modern browsers (including Safari) accept PNG data inside .ico files
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const faceSvg = `
<svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#0d1525"/>
  <circle cx="50" cy="47" r="28" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>
  <circle cx="40" cy="42" r="9" fill="white" stroke="#1A1A08" stroke-width="1.2"/>
  <circle cx="60" cy="40" r="8" fill="white" stroke="#1A1A08" stroke-width="1.2"/>
  <path d="M31 39 Q40 32 49 39" fill="#5CB828" stroke="#1A1A08" stroke-width="1"/>
  <path d="M52 37 Q60 30 68 37" fill="#5CB828" stroke="#1A1A08" stroke-width="1"/>
  <circle cx="41" cy="45" r="5" fill="#1A1A08"/>
  <circle cx="61" cy="43" r="4.5" fill="#1A1A08"/>
  <circle cx="43" cy="42" r="2" fill="white"/>
  <circle cx="63" cy="40" r="1.8" fill="white"/>
  <path d="M38 61 Q50 70 63 61" stroke="#1A1A08" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M48 63 Q62 48 74 53 Q70 67 48 63Z" fill="#4DB330" stroke="#2D8018" stroke-width="0.8"/>
  <path d="M51 61 Q62 50 72 55" stroke="#2D8018" stroke-width="0.5" fill="none" opacity="0.7"/>
</svg>`

const pngData = await sharp(Buffer.from(faceSvg)).png().toBuffer()

// Build ICO: header (6 bytes) + directory entry (16 bytes) + PNG data
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)   // reserved
header.writeUInt16LE(1, 2)   // type: ICO
header.writeUInt16LE(1, 4)   // count: 1 image

const dir = Buffer.alloc(16)
dir.writeUInt8(32, 0)                     // width: 32
dir.writeUInt8(32, 1)                     // height: 32
dir.writeUInt8(0, 2)                      // color count
dir.writeUInt8(0, 3)                      // reserved
dir.writeUInt16LE(1, 4)                   // planes
dir.writeUInt16LE(32, 6)                  // bit count
dir.writeUInt32LE(pngData.length, 8)     // size of image data
dir.writeUInt32LE(6 + 16, 12)            // offset: after header + dir

const ico = Buffer.concat([header, dir, pngData])
writeFileSync(resolve(publicDir, 'favicon.ico'), ico)
console.log('Generated favicon.ico')
