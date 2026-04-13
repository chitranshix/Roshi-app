import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Roshi's face only — idle expression (droopy lids, rolling eyes, smirk, leaf)
// Original head: circle cx=156 cy=24 r=17, plus neck from ~130,56
// We crop the viewBox tightly around the head+neck: roughly x=120 y=4 w=60 h=58
const SW = 2.2

// Front-facing Roshi — geometry from TinyRoshi in LevelHero.tsx
// Head: circle cx=28 cy=36 r=22. Leaf tip extends to ~x=62.
// viewBox crops tightly around head+leaf in a square.
const faceSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 8 56 56" width="${size}" height="${size}">
  <!-- background -->
  <rect x="0" y="8" width="56" height="56" rx="12" fill="#0a1628"/>

  <!-- head -->
  <circle cx="28" cy="36" r="22" fill="#3DBF90"/>

  <!-- eyes -->
  <circle cx="18" cy="34" r="10" fill="white"/>
  <circle cx="38" cy="34" r="10" fill="white"/>
  <!-- pupils rolled up -->
  <circle cx="19" cy="30" r="5.5" fill="#1A1A08"/>
  <circle cx="39" cy="30" r="5.5" fill="#1A1A08"/>
  <!-- eye highlights -->
  <circle cx="21" cy="27" r="2.2" fill="white"/>
  <circle cx="41" cy="27" r="2.2" fill="white"/>

  <!-- smirk -->
  <path d="M18 50 Q28 51 38 45" stroke="#1A1A08" stroke-width="2.2" fill="none" stroke-linecap="round"/>

  <!-- leaf -->
  <path d="M38 45 Q52 30 62 36 Q58 50 38 45Z" fill="#4DB330" stroke="#2D8018" stroke-width="1.4"/>
  <path d="M38 45 Q52 32 60 37" stroke="#2D8018" stroke-width="1" fill="none" opacity="0.7"/>
</svg>`

async function generate() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(faceSvg(size)))
      .png()
      .toFile(resolve(publicDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
  await sharp(Buffer.from(faceSvg(32)))
    .png()
    .toFile(resolve(publicDir, 'favicon.png'))
  console.log('Generated favicon.png')
}

generate().catch(console.error)
