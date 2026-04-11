import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Full Roshi — idle expression, exact paths from Roshi.tsx
// Original viewBox: "0 0 170 90"  (turtle is ~175w × 85h)
// We fit it into a 100×100 canvas with ~5px padding on the sides:
//   scale  = 90 / 175 ≈ 0.5143
//   tx     = 5
//   ty     = (100 - 85 × scale) / 2
const S  = 90 / 175
const TX = 5
const TY = (100 - 85 * S) / 2
const SW = 2.2   // original stroke-width (scaling handles the rest)

const roshiSvg = (size) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100" height="100" rx="22" fill="#0d1525"/>

  <g transform="translate(${TX}, ${TY.toFixed(2)}) scale(${S.toFixed(4)})">

    <!-- TAIL -->
    <ellipse cx="18" cy="64" rx="12" ry="7" fill="#5CB828" stroke="#1A1A08" stroke-width="${SW}" transform="rotate(-30,18,64)"/>

    <!-- BACK LEGS -->
    <ellipse cx="30" cy="76" rx="16" ry="9" fill="#5CB828" stroke="#1A1A08" stroke-width="${SW}" transform="rotate(18,30,76)"/>
    <ellipse cx="50" cy="80" rx="15" ry="8" fill="#4AA820" stroke="#1A1A08" stroke-width="${SW}" transform="rotate(5,50,80)"/>

    <!-- SHELL -->
    <path d="M20,64 C16,32 38,6 80,4 C122,2 138,30 136,62 C134,74 22,74 20,64 Z" fill="#8A9A1E" stroke="#1A1A08" stroke-width="${SW}"/>
    <ellipse cx="74" cy="32" rx="32" ry="20" fill="#A8BC28" opacity="0.5"/>
    <path d="M80,6 Q86,28 80,58"     stroke="#5A6C10" stroke-width="2"   fill="none"/>
    <path d="M46,16 Q60,38 56,66"    stroke="#5A6C10" stroke-width="1.8" fill="none"/>
    <path d="M114,16 Q100,38 104,66" stroke="#5A6C10" stroke-width="1.8" fill="none"/>
    <path d="M30,46 Q80,38 130,46"   stroke="#5A6C10" stroke-width="1.6" fill="none"/>
    <path d="M50,24 Q80,18 110,24"   stroke="#5A6C10" stroke-width="1.3" fill="none" opacity="0.7"/>

    <!-- BELLY BAND -->
    <path d="M20,64 C22,72 134,72 136,62 C134,76 22,76 20,64 Z" fill="#C8DC5A" stroke="#1A1A08" stroke-width="${SW}"/>

    <!-- FRONT LEGS -->
    <ellipse cx="115" cy="80" rx="15" ry="8" fill="#5CB828" stroke="#1A1A08" stroke-width="${SW}" transform="rotate(-5,115,80)"/>
    <ellipse cx="132" cy="76" rx="16" ry="9" fill="#4AA820" stroke="#1A1A08" stroke-width="${SW}" transform="rotate(-18,132,76)"/>

    <!-- NECK -->
    <path d="M130,56 Q144,46 152,30" stroke="#5CB828" stroke-width="18" stroke-linecap="round" fill="none"/>
    <path d="M130,56 Q144,46 152,30" stroke="#1A1A08" stroke-width="${SW}" fill="none" stroke-linecap="round"/>

    <!-- HEAD -->
    <circle cx="156" cy="24" r="17" fill="#5CB828" stroke="#1A1A08" stroke-width="${SW}"/>

    <!-- EYES idle — big white circles, droopy lids -->
    <circle cx="150" cy="22" r="8.5" fill="white" stroke="#1A1A08" stroke-width="1.8"/>
    <circle cx="164" cy="20" r="7.5" fill="white" stroke="#1A1A08" stroke-width="1.8"/>
    <!-- droopy upper lids -->
    <path d="M141 19 Q150 13 159 19" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>
    <path d="M156 17 Q164 11 172 17" fill="#5CB828" stroke="#1A1A08" stroke-width="1.5"/>
    <!-- rolling pupils -->
    <circle cx="151" cy="24" r="4.5" fill="#1A1A08"/>
    <circle cx="165" cy="22" r="4"   fill="#1A1A08"/>
    <!-- eye highlights -->
    <circle cx="153" cy="21" r="1.8" fill="white"/>
    <circle cx="167" cy="19" r="1.5" fill="white"/>

    <!-- MOUTH — lazy smirk -->
    <path d="M148 35 Q157 42 167 35" stroke="#1A1A08" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- leaf sticking out -->
    <path d="M155 36 Q166 25 175 29 Q172 39 155 36Z" fill="#4DB330" stroke="#2D8018" stroke-width="1"/>
    <path d="M157 34 Q165 26 172 30" stroke="#2D8018" stroke-width="0.7" fill="none" opacity="0.7"/>

  </g>
</svg>`

async function generate() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(roshiSvg(size)))
      .png()
      .toFile(resolve(publicDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }

  await sharp(Buffer.from(roshiSvg(32)))
    .png()
    .toFile(resolve(publicDir, 'favicon.png'))
  console.log('Generated favicon.png')
}

generate().catch(console.error)
