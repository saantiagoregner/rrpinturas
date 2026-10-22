/* ================================================
   script.js — Ricardo Regner Servicios de Pintura
   ================================================ */

// ================================================
// CREDENCIALES ADMIN
// ================================================
const ADMIN_USER = 'Santy'
const ADMIN_PASS = 'rodriguez74'

// ================================================
// ⚙️ CONFIGURACIÓN CLOUDINARY
// ================================================
const CLOUDINARY_CLOUD_NAME    = 'dpyhchqg2'
const CLOUDINARY_UPLOAD_PRESET = 'pinturas_preset'

// ================================================
// ⚙️ CONFIGURACIÓN JSONBIN (base de datos compartida)
// ================================================
const JSONBIN_BIN_ID     = '69feae2b250b1311c3247cff'
const JSONBIN_MASTER_KEY = '$2a$10$bXqZugtaC2gZBiiXv7QEmeI9p4PrXbaTMzXMCmOJEGogAeLolb1F.'
const JSONBIN_URL        = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

// ================================================
// CONTENIDO POR DEFECTO
// ================================================
const DEFAULT_CONTENT = {
  heroBadge:    '+10 años de experiencia',
  heroTitle:    'Pintura con oficio\npara tu hogar',
  heroSubtitle: 'Trabajos de pintura interior, exterior e impermeabilización con dedicación y materiales de primera calidad.',
  heroLocation: 'San Benito, Entre Ríos',
  aboutTitle:   'Trabajo con dedicación\ny experiencia real',
  aboutDesc:    'Soy Ricardo Regner, pintor profesional con más de una década trabajando en viviendas particulares, comercios y edificios de la región. Me destaco por la prolijidad, el uso de materiales de primera calidad y el trato directo con el cliente desde el presupuesto hasta la terminación.',
  aboutBadgeNum: '+10',
  servicesTitle: '¿En qué puedo ayudarte?',
  servicesDesc:  'Ofrezco soluciones completas para la pintura y protección de tu hogar.',
  serviceTitle1: 'Pintura Interior',
  serviceDesc1:  'Renovación completa de ambientes con preparación de superficies, masillado, sellado y pintura de alta duración.',
  serviceTitle2: 'Pintura Exterior',
  serviceDesc2:  'Pintura de fachadas y exteriores con productos resistentes a la intemperie para máxima durabilidad.',
  serviceTitle3: 'Impermeabilización',
  serviceDesc3:  'Tratamiento de techos y muros con membranas y pinturas impermeabilizantes de alta performance.',
  serviceBadge:  'Más solicitado',
}

// ================================================
// TRABAJOS POR DEFECTO
// ================================================
const DEFAULT_WORKS = [
  {
    id: 1,
    title: 'Salón comedor',
    before: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80&auto=format&fit=crop',
    after:  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Fachada exterior',
    before: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    after:  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Dormitorio principal',
    before: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&q=80&auto=format&fit=crop',
    after:  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80&auto=format&fit=crop',
  },
]

// ================================================
// ESTADO GLOBAL
// ================================================
let isAdminMode = false
let dbData = { images: {}, works: null, featuredCard: 2 }

// ================================================
// JSONBIN — leer datos
// ================================================
async function dbRead() {
  try {
    const res  = await fetch(JSONBIN_URL + '/latest', {
      headers: { 'X-Master-Key': JSONBIN_MASTER_KEY }
    })
    const json = await res.json()
    dbData = json.record
    if (!dbData.images)                    dbData.images      = {}
    if (!dbData.works)                     dbData.works       = null
    if (dbData.featuredCard === undefined) dbData.featuredCard = 2
  } catch (e) {
    console.error('JSONBin read error:', e)
  }
}

// ================================================
// JSONBIN — guardar datos
// ================================================
async function dbWrite() {
  try {
    await fetch(JSONBIN_URL, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_MASTER_KEY
      },
      body: JSON.stringify(dbData)
    })
  } catch (e) {
    console.error('JSONBin write error:', e)
  }
}

// ================================================
// INICIALIZACIÓN
// ================================================
document.addEventListener('DOMContentLoaded', async () => {
  await dbRead()
  loadContent()
  loadFeaturedCard()
  initNavbar()
  initScrollReveal()
  checkAdminSession()
  renderWorks()
})

// ================================================
// NAVBAR — scroll + hamburguesa
// ================================================
function initNavbar() {
  const navbar    = document.getElementById('navbar')
  const hamburger = document.getElementById('hamburger')
  const navMenu   = document.getElementById('navMenu')

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50)
  })

  navMenu.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open')
      hamburger.classList.remove('open')
    })
  })
}

function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open')
  document.getElementById('navMenu').classList.toggle('open')
}

document.addEventListener('click', (e) => {
  const navMenu   = document.getElementById('navMenu')
  const hamburger = document.getElementById('hamburger')
  const navbar    = document.getElementById('navbar')
  if (navMenu.classList.contains('open') && !navbar.contains(e.target)) {
    navMenu.classList.remove('open')
    hamburger.classList.remove('open')
  }
})

// ================================================
// SCROLL REVEAL
// ================================================
function initScrollReveal() {
  const targets = document.querySelectorAll('.about-grid, .services-grid, .contact-inner, .benefit-item, .service-card')
  targets.forEach(el => el.classList.add('reveal'))

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  targets.forEach(el => observer.observe(el))
}

// ================================================
// CARGAR CONTENIDO
// ================================================
function loadContent() {
  const stored  = localStorage.getItem('pintor_content')
  const content = stored ? JSON.parse(stored) : DEFAULT_CONTENT

  Object.keys(content).forEach(field => {
    const el = document.querySelector(`[data-field="${field}"]`)
    if (el) el.innerHTML = content[field].replace(/\n/g, '<br>')
  })

  // Imágenes desde JSONBin (visibles para todos)
  const images = dbData.images || {}
  Object.keys(images).forEach(imgId => {
    const img = document.getElementById(imgId)
    if (img && images[imgId]) {
      img.src = images[imgId]
      img.classList.remove('hidden')
      if (imgId === 'aboutImg')    hidePlaceholder('aboutImgPlaceholder')
      if (imgId === 'serviceImg1') hidePlaceholder('servicePlaceholder1')
      if (imgId === 'serviceImg2') hidePlaceholder('servicePlaceholder2')
      if (imgId === 'serviceImg3') hidePlaceholder('servicePlaceholder3')
    }
  })
}

function hidePlaceholder(id) {
  const el = document.getElementById(id)
  if (el) el.classList.add('hidden')
}

// ================================================
// GUARDAR CAMBIOS DE TEXTO
// ================================================
function saveAllChanges() {
  const content = {}
  document.querySelectorAll('[data-field]').forEach(el => {
    content[el.getAttribute('data-field')] = el.innerText.replace(/\n\n/g, '\n')
  })
  localStorage.setItem('pintor_content', JSON.stringify(content))
  showToast('✅ Cambios guardados correctamente')
}

// ================================================
// RESTAURAR CONTENIDO
// ================================================
function resetContent() {
  if (!confirm('¿Restaurar todo el contenido original? Se perderán los cambios.')) return
  localStorage.removeItem('pintor_content')
  localStorage.removeItem('pintor_admin_session')
  dbData.images      = {}
  dbData.works       = null
  dbData.featuredCard = 2
  dbWrite().then(() => location.reload())
}

// ================================================
// SUBIR IMAGEN A CLOUDINARY
// ================================================
async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error(`Cloudinary error: ${res.status}`)
  const data = await res.json()
  return data.secure_url
}

// ================================================
// CAMBIAR IMAGEN (hero, about, servicios)
// ================================================
async function changeImage(imgId, input, placeholderId = null) {
  const file = input.files[0]
  if (!file) return

  showToast('⏳ Subiendo imagen...')

  try {
    const url = await uploadToCloudinary(file)

    const img = document.getElementById(imgId)
    if (img) { img.src = url; img.classList.remove('hidden') }
    if (placeholderId) hidePlaceholder(placeholderId)

    // Guardar URL en JSONBin (visible para todos)
    dbData.images[imgId] = url
    await dbWrite()

    showToast('🖼 Imagen actualizada correctamente')
  } catch (err) {
    console.error(err)
    showToast('❌ Error al subir la imagen.')
  }
}

// ================================================
// LOGIN MODAL
// ================================================
function openLogin() {
  if (isAdminMode) { logout(); return }
  document.getElementById('loginModal').classList.remove('hidden')
  setTimeout(() => document.getElementById('loginUser').focus(), 100)
}

function closeLogin() {
  document.getElementById('loginModal').classList.add('hidden')
  document.getElementById('loginError').classList.add('hidden')
  document.getElementById('loginUser').value = ''
  document.getElementById('loginPass').value = ''
}

function closeLoginOnOverlay(event) {
  if (event.target === document.getElementById('loginModal')) closeLogin()
}

function doLogin() {
  const user = document.getElementById('loginUser').value.trim()
  const pass = document.getElementById('loginPass').value
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem('pintor_admin_session', 'true')
    closeLogin()
    enableAdminMode()
  } else {
    document.getElementById('loginError').classList.remove('hidden')
    document.getElementById('loginPass').value = ''
    document.getElementById('loginPass').focus()
  }
}

// ================================================
// SESIÓN ADMIN
// ================================================
function checkAdminSession() {
  if (localStorage.getItem('pintor_admin_session') === 'true') enableAdminMode()
}

function enableAdminMode() {
  isAdminMode = true
  document.getElementById('admin-bar').classList.remove('hidden')
  document.body.classList.add('admin-active')
  document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'))
  document.querySelectorAll('[data-field]').forEach(el => {
    el.contentEditable = 'true'
    el.classList.add('editable-field')
    el.setAttribute('spellcheck', 'false')
  })
  renderWorks()
  const adminLink = document.getElementById('adminNavLink')
  if (adminLink) adminLink.textContent = 'Salir de Admin'
  showToast('🛠 Modo administrador activado')
}

function logout() {
  isAdminMode = false
  localStorage.removeItem('pintor_admin_session')
  document.getElementById('admin-bar').classList.add('hidden')
  document.body.classList.remove('admin-active')
  document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'))
  document.querySelectorAll('[data-field]').forEach(el => {
    el.contentEditable = 'false'
    el.classList.remove('editable-field')
  })
  renderWorks()
  const adminLink = document.getElementById('adminNavLink')
  if (adminLink) adminLink.textContent = 'Admin'
  showToast('👋 Sesión cerrada')
}

// ================================================
// TOAST
// ================================================
let toastTimer = null
function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000)
}

// ================================================
// BADGE "MÁS SOLICITADO"
// ================================================
function loadFeaturedCard() {
  const cardNum = dbData.featuredCard !== undefined ? dbData.featuredCard : 2
  applyFeaturedCard(cardNum)
}

async function setFeaturedCard(cardNum) {
  dbData.featuredCard = cardNum
  await dbWrite()
  applyFeaturedCard(cardNum)
  showToast(cardNum === 0 ? '⭐ Badge ocultado' : `⭐ Badge movido a la card ${cardNum}`)
}

function applyFeaturedCard(cardNum) {
  ;[1, 2, 3].forEach(n => {
    const card  = document.getElementById(`serviceCard${n}`)
    const badge = document.getElementById(`serviceBadge${n}`)
    if (card)  card.classList.remove('featured')
    if (badge) badge.classList.add('hidden')
    const btn = document.getElementById(`badgeBtn${n}`)
    if (btn) btn.classList.remove('active')
  })

  if (cardNum > 0) {
    const card  = document.getElementById(`serviceCard${cardNum}`)
    const badge = document.getElementById(`serviceBadge${cardNum}`)
    if (card)  card.classList.add('featured')
    if (badge) badge.classList.remove('hidden')
    const btn = document.getElementById(`badgeBtn${cardNum}`)
    if (btn) btn.classList.add('active')
  } else {
    const btn = document.getElementById('badgeBtn0')
    if (btn) btn.classList.add('active')
  }
}

// ================================================
// TRABAJOS
// ================================================
function getWorks() {
  return dbData.works || DEFAULT_WORKS
}

async function saveWorks(works) {
  dbData.works = works
  await dbWrite()
}

// ================================================
// RENDERIZAR WORKS
// ================================================
function renderWorks() {
  const grid = document.getElementById('worksGrid')
  if (!grid) return
  injectLightboxStyles() // los estilos del botón de ampliar tienen que estar desde el inicio
  const works = getWorks()
  grid.innerHTML = ''

  works.forEach((work, index) => {
    const num = String(index + 1).padStart(2, '0')
    const div = document.createElement('div')
    div.className = 'work-item'
    div.dataset.workId = work.id
    div.innerHTML = `
      <div class="work-label-top">
        <span class="work-num">${num}</span>
        <span class="work-title-editable" data-work-id="${work.id}">${work.title}</span>
      </div>
      <div class="compare-slider">
        <div class="compare-before">
          <img class="work-before-img" src="${work.before}" alt="Antes" />
          <span class="compare-tag before-tag">ANTES</span>
        </div>
        <div class="compare-after">
          <img class="work-after-img" src="${work.after}" alt="Después" />
          <span class="compare-tag after-tag">DESPUÉS</span>
        </div>
        <div class="compare-handle">
          <div class="compare-line"></div>
          <div class="compare-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>
            </svg>
          </div>
          <div class="compare-line"></div>
        </div>
        <button type="button" class="compare-zoom" aria-label="Ampliar imagen" title="Ampliar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </button>
      </div>
      <div class="work-admin-btns ${isAdminMode ? '' : 'hidden'} admin-only">
        <label class="admin-img-label" onclick="triggerWorkImg(${work.id}, 'before')">📷 Cambiar ANTES</label>
        <label class="admin-img-label gold" onclick="triggerWorkImg(${work.id}, 'after')">📷 Cambiar DESPUÉS</label>
        <button class="admin-img-label danger" onclick="deleteWork(${work.id})">🗑 Eliminar</button>
      </div>
    `
    const zoomBtn = div.querySelector('.compare-zoom')
    // que el botón no active el arrastre del divisor
    zoomBtn.addEventListener('mousedown',  (e) => e.stopPropagation())
    zoomBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true })
    zoomBtn.addEventListener('click', () => openLightbox(work))
    grid.appendChild(div)
  })

  if (!document.getElementById('workFileInput')) {
    const fi = document.createElement('input')
    fi.type = 'file'; fi.id = 'workFileInput'; fi.accept = 'image/*'; fi.style.display = 'none'
    document.body.appendChild(fi)
  }

  initCompareSliders()
  if (isAdminMode) makeWorkTitlesEditable()
}

// ================================================
// AGREGAR / ELIMINAR TRABAJO
// ================================================
async function addNewWork() {
  const works = getWorks()
  const maxId = works.reduce((m, w) => Math.max(m, w.id), 0)
  works.push({
    id:     maxId + 1,
    title:  'Nuevo trabajo',
    before: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop',
    after:  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop',
  })
  await saveWorks(works)
  renderWorks()
  showToast('✅ Nuevo trabajo agregado — subí las fotos antes/después')
  setTimeout(() => {
    const last = document.querySelector('.work-item:last-child')
    if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

async function deleteWork(id) {
  if (!confirm('¿Eliminar este trabajo?')) return
  await saveWorks(getWorks().filter(w => w.id !== id))
  renderWorks()
  showToast('🗑 Trabajo eliminado')
}

// ================================================
// CAMBIAR IMAGEN DE TRABAJO
// ================================================
let _currentWorkId = null, _currentWorkSide = null

function triggerWorkImg(workId, side) {
  _currentWorkId   = workId
  _currentWorkSide = side
  const input = document.getElementById('workFileInput')
  input.value = ''
  input.onchange = handleWorkImageChange
  input.click()
}

async function handleWorkImageChange() {
  const file = this.files[0]
  if (!file || !_currentWorkId) return

  showToast('⏳ Subiendo imagen...')

  try {
    const url   = await uploadToCloudinary(file)
    const works = getWorks()
    const work  = works.find(w => w.id === _currentWorkId)
    if (!work) return
    if (_currentWorkSide === 'before') work.before = url
    else                               work.after  = url
    await saveWorks(works)
    renderWorks()
    showToast('🖼 Imagen actualizada correctamente')
  } catch (err) {
    console.error(err)
    showToast('❌ Error al subir la imagen.')
  }
}

// ================================================
// EDITAR TÍTULO DE TRABAJO
// ================================================
function makeWorkTitlesEditable() {
  document.querySelectorAll('.work-title-editable').forEach(el => {
    el.contentEditable = 'true'
    el.classList.add('editable-field')
    el.spellcheck = false
    el.addEventListener('blur', async () => {
      const works = getWorks()
      const work  = works.find(w => w.id === parseInt(el.dataset.workId))
      if (work) { work.title = el.innerText.trim(); await saveWorks(works) }
    })
  })
}

// ================================================
// COMPARE SLIDER
// ANTES a la izquierda · DESPUÉS a la derecha
// opts.canStart(e) permite decidir cuándo un toque/clic mueve el divisor
// ================================================
function setupCompare(slider, opts = {}) {
  const beforeEl = slider.querySelector('.compare-before')
  const afterEl  = slider.querySelector('.compare-after')
  const handle   = slider.querySelector('.compare-handle')
  const canStart = opts.canStart || (() => true)
  let dragging   = false

  // El DESPUÉS queda de fondo completo (se ve a la derecha del divisor)
  afterEl.style.zIndex   = '1'
  afterEl.style.clipPath = 'none'

  // El ANTES va arriba y se recorta (se ve a la izquierda del divisor)
  beforeEl.style.zIndex  = '2'

  const getPos = (x) => {
    const rect = slider.getBoundingClientRect()
    return Math.min(Math.max(((x - rect.left) / rect.width) * 100, 2), 98)
  }
  const apply = (pct) => {
    beforeEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`
    handle.style.left       = `${pct}%`
    slider._pct             = pct
  }
  slider._apply = apply

  apply(50)
  slider.addEventListener('mousedown', (e) => {
    if (!canStart(e)) return
    dragging = true; apply(getPos(e.clientX)); e.preventDefault()
  })
  window.addEventListener('mousemove', (e) => { if (dragging) apply(getPos(e.clientX)) })
  window.addEventListener('mouseup',   ()  => { dragging = false })

  slider.addEventListener('touchstart', (e) => {
    if (!canStart(e)) { if (e.touches.length > 1) dragging = false; return }
    dragging = true; apply(getPos(e.touches[0].clientX))
  }, { passive: true })
  window.addEventListener('touchmove', (e) => {
    if (dragging && e.touches.length === 1) apply(getPos(e.touches[0].clientX))
  }, { passive: true })
  window.addEventListener('touchend', () => { dragging = false })
}

function initCompareSliders() {
  document.querySelectorAll('.work-item .compare-slider').forEach(s => setupCompare(s))
}

// ================================================
// LIGHTBOX — AMPLIAR ANTES / DESPUÉS (con zoom)
// ================================================
const lb = { scale: 1, tx: 0, ty: 0, MAX: 6 }

function injectLightboxStyles() {
  if (document.getElementById('lightboxStyles')) return
  const style = document.createElement('style')
  style.id = 'lightboxStyles'
  style.textContent = `
    /* Arreglo: las etiquetas tenían top y bottom a la vez y se estiraban */
    .compare-slider .compare-tag { bottom: auto; }

    /* Botón ampliar sobre cada comparador */
    .compare-zoom {
      position: absolute;
      bottom: 10px; right: 10px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(15,31,61,0.75);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      z-index: 20;
      cursor: zoom-in;
      border: 1px solid rgba(255,255,255,0.35);
      transition: background 0.3s ease, transform 0.3s ease;
    }
    .compare-zoom:hover { background: #c9a84c; color: #0f1f3d; transform: scale(1.08); }

    /* Lightbox */
    .lb-overlay {
      position: fixed; inset: 0;
      background: rgba(7,15,29,0.94);
      z-index: 100000;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 12px;
      padding: 16px;
      touch-action: none;
      user-select: none;
      overscroll-behavior: contain;
      animation: lbFade 0.2s ease;
    }
    .lb-overlay.hidden { display: none !important; }
    @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }

    .lb-title {
      color: #fff;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.2rem;
      text-align: center;
      padding: 0 48px;
    }
    .lb-close {
      position: absolute;
      top: 14px; right: 14px;
      width: 42px; height: 42px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      color: #fff;
      font-size: 1.2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .lb-close:hover { background: #c9a84c; color: #0f1f3d; }

    .lb-slider {
      position: relative;
      width: min(96vw, calc(70vh * 4 / 3), 1200px);
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: 12px;
      background: #111;
      cursor: col-resize;
      user-select: none;
      touch-action: none;
    }
    /* Cada capa es opaca: si una foto tiene otra proporción, no se transparenta la otra */
    .lb-slider .compare-before,
    .lb-slider .compare-after { background: #111; }
    .lb-slider .compare-before img,
    .lb-slider .compare-after img {
      object-fit: contain;
      transform-origin: center center;
      will-change: transform;
    }
    .lb-slider.zoomed { cursor: grab; }
    .lb-slider.zoomed:active { cursor: grabbing; }
    /* El círculo del divisor se puede agarrar siempre (también con zoom) */
    .lb-slider .compare-circle { pointer-events: auto; cursor: col-resize; }

    .lb-controls {
      display: flex; align-items: center; gap: 8px;
    }
    .lb-controls button {
      min-width: 40px; height: 40px;
      padding: 0 14px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      color: #fff;
      font-size: 1.2rem; font-weight: 700;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .lb-controls button:hover { background: #c9a84c; color: #0f1f3d; }
    .lb-controls #lbZoomReset { font-size: 0.8rem; }
    .lb-controls span {
      color: #fff; font-size: 0.85rem; font-weight: 700;
      min-width: 52px; text-align: center;
    }

    .lb-hint {
      color: rgba(255,255,255,0.6);
      font-size: 0.8rem;
      text-align: center;
      padding: 0 12px;
    }
  `
  document.head.appendChild(style)
}

// ---------- zoom ----------
function lbClamp() {
  const slider = document.getElementById('lbSlider')
  const maxX = (lb.scale - 1) * slider.clientWidth  / 2
  const maxY = (lb.scale - 1) * slider.clientHeight / 2
  lb.tx = Math.min(Math.max(lb.tx, -maxX), maxX)
  lb.ty = Math.min(Math.max(lb.ty, -maxY), maxY)
  if (lb.scale === 1) { lb.tx = 0; lb.ty = 0 }
}

function lbApplyTransform() {
  const slider = document.getElementById('lbSlider')
  if (!slider) return
  const t = lb.scale === 1 ? '' : `translate(${lb.tx}px, ${lb.ty}px) scale(${lb.scale})`
  document.getElementById('lbBefore').style.transform = t
  document.getElementById('lbAfter').style.transform  = t
  slider.classList.toggle('zoomed', lb.scale > 1)
  const label = document.getElementById('lbZoomLevel')
  if (label) label.textContent = `${Math.round(lb.scale * 100)}%`
  const hint = document.getElementById('lbHint')
  if (hint) hint.textContent = lb.scale > 1
    ? 'Arrastrá para mover la foto · Agarrá el círculo para mover el divisor'
    : 'Deslizá para comparar · Rueda del mouse, pellizco o doble toque para hacer zoom'
}

// Zoom manteniendo fijo el punto (cx, cy) de la pantalla
function lbZoomAt(cx, cy, newScale) {
  const slider = document.getElementById('lbSlider')
  const rect   = slider.getBoundingClientRect()
  newScale = Math.min(Math.max(newScale, 1), lb.MAX)
  const px = cx - rect.left - rect.width  / 2
  const py = cy - rect.top  - rect.height / 2
  const ratio = newScale / lb.scale
  lb.tx = px - (px - lb.tx) * ratio
  lb.ty = py - (py - lb.ty) * ratio
  lb.scale = newScale
  lbClamp()
  lbApplyTransform()
}

function lbZoomCenter(factor) {
  const rect = document.getElementById('lbSlider').getBoundingClientRect()
  lbZoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, lb.scale * factor)
}

function lbReset() {
  lb.scale = 1; lb.tx = 0; lb.ty = 0
  lbApplyTransform()
}

function lbToggleZoom(x, y) {
  if (lb.scale > 1) lbReset()
  else lbZoomAt(x, y, 2.5)
}

function initLightboxZoom(slider) {
  let lastTouchAt = 0 // para no contar dos veces el doble toque (toque + dblclick del navegador)

  // Rueda del mouse
  slider.addEventListener('wheel', (e) => {
    e.preventDefault()
    lbZoomAt(e.clientX, e.clientY, lb.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15))
  }, { passive: false })

  // Doble clic (mouse)
  slider.addEventListener('dblclick', (e) => {
    if (e.target.closest('.compare-circle')) return
    if (Date.now() - lastTouchAt < 600) return
    lbToggleZoom(e.clientX, e.clientY)
  })

  // Todo el manejo de dedos / mouse en un solo lugar (pointer events):
  //   'divider' = mover la línea · 'pan' = mover la foto con zoom · 'pinch' = pellizcar · 'none' = ignorar
  const pointers = new Map()
  let mode = 'none', startPct = 50, lastDist = 0, lastMid = null
  let moved = false, downOnCircle = false
  let lastTap = { t: 0, x: 0, y: 0 }

  const posFromX = (x) => {
    const r = slider.getBoundingClientRect()
    return Math.min(Math.max(((x - r.left) / r.width) * 100, 2), 98)
  }
  const pinchState = () => {
    const [a, b] = [...pointers.values()]
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
  }

  slider.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY })
    // con esto seguimos recibiendo el arrastre aunque el dedo/mouse salga de la foto
    try { slider.setPointerCapture(e.pointerId) } catch (err) {}

    if (pointers.size === 1) {
      moved = false
      downOnCircle = !!e.target.closest('.compare-circle')
      if (lb.scale <= 1 || downOnCircle) {
        mode = 'divider'
        startPct = slider._pct
        // con mouse la línea salta al clic; con el dedo solo se mueve al arrastrar
        if (e.pointerType === 'mouse') slider._apply(posFromX(e.clientX))
      } else {
        mode = 'pan'
      }
    } else if (pointers.size === 2) {
      // llegó el segundo dedo: es un pellizco, el divisor vuelve a donde estaba
      if (mode === 'divider') slider._apply(startPct)
      mode = 'pinch'
      moved = true
      const st = pinchState()
      lastDist = st.dist; lastMid = st.mid
    }
  })

  slider.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId)
    if (!p) return
    const dx = e.clientX - p.x, dy = e.clientY - p.y
    p.x = e.clientX; p.y = e.clientY
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) moved = true

    if (mode === 'divider') {
      if (moved || e.pointerType === 'mouse') slider._apply(posFromX(e.clientX))
    } else if (mode === 'pan') {
      lb.tx += dx; lb.ty += dy
      lbClamp(); lbApplyTransform()
    } else if (mode === 'pinch' && pointers.size === 2) {
      const st = pinchState()
      if (lastDist && lastMid) {
        // zoom alrededor del punto medio anterior y después seguimos el movimiento de los dedos
        lbZoomAt(lastMid.x, lastMid.y, lb.scale * st.dist / lastDist)
        lb.tx += st.mid.x - lastMid.x
        lb.ty += st.mid.y - lastMid.y
        lbClamp(); lbApplyTransform()
      }
      lastDist = st.dist; lastMid = st.mid
    }
  })

  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    if (e.pointerType === 'touch') lastTouchAt = Date.now()
    lastDist = 0; lastMid = null

    if (pointers.size === 0) {
      // doble toque en pantallas táctiles
      if (e.type === 'pointerup' && e.pointerType === 'touch' && mode !== 'pinch' && !moved && !downOnCircle) {
        const now = Date.now()
        if (now - lastTap.t < 300 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
          lbToggleZoom(e.clientX, e.clientY)
          lastTap.t = 0
        } else {
          lastTap = { t: now, x: e.clientX, y: e.clientY }
        }
      }
      mode = 'none'
    } else if (pointers.size === 1) {
      // quedó un dedo después de pellizcar: si hay zoom sigue moviendo la foto
      mode = lb.scale > 1 ? 'pan' : 'none'
    }
  }
  slider.addEventListener('pointerup',     endPointer)
  slider.addEventListener('pointercancel', endPointer)
}

// ---------- armado del lightbox ----------
function buildLightbox() {
  let box = document.getElementById('lightbox')
  if (box) return box

  injectLightboxStyles()

  box = document.createElement('div')
  box.id = 'lightbox'
  box.className = 'lb-overlay hidden'
  box.innerHTML = `
    <button type="button" class="lb-close" aria-label="Cerrar">✕</button>
    <div class="lb-title" id="lbTitle"></div>
    <div class="compare-slider lb-slider" id="lbSlider">
      <div class="compare-before">
        <img id="lbBefore" src="" alt="Antes" />
        <span class="compare-tag before-tag">ANTES</span>
      </div>
      <div class="compare-after">
        <img id="lbAfter" src="" alt="Después" />
        <span class="compare-tag after-tag">DESPUÉS</span>
      </div>
      <div class="compare-handle">
        <div class="compare-line"></div>
        <div class="compare-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>
          </svg>
        </div>
        <div class="compare-line"></div>
      </div>
    </div>
    <div class="lb-controls">
      <button type="button" id="lbZoomOut"   aria-label="Alejar">−</button>
      <span id="lbZoomLevel">100%</span>
      <button type="button" id="lbZoomIn"    aria-label="Acercar">+</button>
      <button type="button" id="lbZoomReset" aria-label="Restablecer zoom">Restablecer</button>
    </div>
    <div class="lb-hint" id="lbHint"></div>
  `
  document.body.appendChild(box)

  // cerrar: botón X, click en el fondo, tecla Escape
  box.querySelector('.lb-close').addEventListener('click', closeLightbox)
  // Solo se cierra si el toque empezó en el fondo. Si arrastraste el divisor
  // y soltaste afuera de la foto, no debe cerrarse.
  let downOnOverlay = false
  box.addEventListener('pointerdown', (e) => { downOnOverlay = (e.target === box) })
  box.addEventListener('click', (e) => { if (e.target === box && downOnOverlay) closeLightbox() })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox()
  })

  const slider = document.getElementById('lbSlider')

  // setupCompare solo arma las capas y el divisor; el arrastre lo maneja initLightboxZoom
  setupCompare(slider, { canStart: () => false })
  initLightboxZoom(slider)

  document.getElementById('lbZoomIn').addEventListener('click',    () => lbZoomCenter(1.4))
  document.getElementById('lbZoomOut').addEventListener('click',   () => lbZoomCenter(1 / 1.4))
  document.getElementById('lbZoomReset').addEventListener('click', lbReset)

  return box
}

function openLightbox(work) {
  const box = buildLightbox()
  document.getElementById('lbTitle').textContent = work.title || ''
  document.getElementById('lbBefore').src = work.before
  document.getElementById('lbAfter').src  = work.after
  box.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  lbReset()
  const slider = document.getElementById('lbSlider')
  if (slider && slider._apply) slider._apply(50)
}

function closeLightbox() {
  const box = document.getElementById('lightbox')
  if (!box || box.classList.contains('hidden')) return
  box.classList.add('hidden')
  document.body.style.overflow = ''
  lbReset()
}