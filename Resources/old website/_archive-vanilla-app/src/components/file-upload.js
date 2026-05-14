/**
 * file-upload.js — Drag-and-drop / click file upload component
 *
 * Renders a drop zone, handles file validation, shows previews,
 * and uploads to Supabase Storage.
 *
 * Usage:
 *   import { initFileUpload } from '../components/file-upload.js'
 *
 *   const uploader = initFileUpload({
 *     containerId: 'photoUploadZone',
 *     bucket:      'case-photos',
 *     path:        `cases/${caseId}/`,
 *     accept:      ['image/jpeg', 'image/png', 'image/webp'],
 *     maxSizeMB:   10,
 *     multiple:    true,
 *     onUpload:    (urls) => console.log('Uploaded:', urls),
 *     onError:     (err)  => toast.error(err.message),
 *   })
 *
 *   uploader.reset()     // clear files
 *   uploader.getFiles()  // → File[]
 */

export function initFileUpload({
  containerId = 'fileUploadZone',
  bucket      = 'uploads',
  path        = '',
  accept      = ['image/*', 'application/pdf'],
  maxSizeMB   = 10,
  multiple    = false,
  onUpload    = () => {},
  onError     = (e) => console.error(e),
} = {}) {

  const container = document.getElementById(containerId)
  if (!container) {
    console.warn(`file-upload: container #${containerId} not found`)
    return null
  }

  const maxBytes = maxSizeMB * 1024 * 1024
  let files = []

  // Build drop zone UI
  container.classList.add('form-file-drop')
  container.innerHTML = `
    <div class="form-file-drop__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 16 12 12 8 16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
      </svg>
    </div>
    <div class="form-file-drop__text">
      <strong>Click to upload</strong> or drag and drop<br>
      <span style="font-size:0.75rem">
        ${accept.join(', ')} — max ${maxSizeMB}MB${multiple ? ' — multiple files OK' : ''}
      </span>
    </div>
    <input type="file"
           accept="${accept.join(',')}"
           ${multiple ? 'multiple' : ''}
           style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" />
    <div class="file-upload__preview" style="margin-top:var(--space-4);display:flex;flex-wrap:wrap;gap:var(--space-2);"></div>
  `
  container.style.position = 'relative'

  const input   = container.querySelector('input[type="file"]')
  const preview = container.querySelector('.file-upload__preview')

  function validate(fileList) {
    const errs = []
    Array.from(fileList).forEach(f => {
      const typeOk = accept.some(a => {
        if (a.endsWith('/*')) return f.type.startsWith(a.replace('/*', '/'))
        return f.type === a
      })
      if (!typeOk) errs.push(`${f.name}: unsupported file type`)
      if (f.size > maxBytes) errs.push(`${f.name}: exceeds ${maxSizeMB}MB limit`)
    })
    return errs
  }

  function renderPreviews() {
    preview.innerHTML = ''
    files.forEach((f, i) => {
      const item = document.createElement('div')
      item.style.cssText = 'position:relative;border-radius:var(--radius-md);overflow:hidden;width:72px;height:72px;background:var(--color-cream);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;'

      if (f.type.startsWith('image/')) {
        const img = document.createElement('img')
        img.src = URL.createObjectURL(f)
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;'
        item.appendChild(img)
      } else {
        item.innerHTML = `<span style="font-size:0.65rem;padding:4px;text-align:center;color:var(--color-text-muted);word-break:break-all;">${f.name}</span>`
      }

      const rm = document.createElement('button')
      rm.type = 'button'
      rm.setAttribute('aria-label', `Remove ${f.name}`)
      rm.style.cssText = 'position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;border:none;cursor:pointer;'
      rm.textContent = '×'
      rm.addEventListener('click', (e) => { e.stopPropagation(); files.splice(i, 1); renderPreviews() })
      item.appendChild(rm)
      preview.appendChild(item)
    })
  }

  function handleFiles(fileList) {
    const errs = validate(fileList)
    if (errs.length) { onError(new Error(errs.join('\n'))); return }
    files = multiple ? [...files, ...Array.from(fileList)] : Array.from(fileList)
    renderPreviews()
    // TODO: wire supabase.storage.from(bucket).upload(path + file.name, file)
    // then call onUpload(urls)
  }

  input.addEventListener('change', () => handleFiles(input.files))

  container.addEventListener('dragover',  e => { e.preventDefault(); container.classList.add('dragover') })
  container.addEventListener('dragleave', () => container.classList.remove('dragover'))
  container.addEventListener('drop', e => {
    e.preventDefault()
    container.classList.remove('dragover')
    handleFiles(e.dataTransfer.files)
  })

  return {
    getFiles: () => files,
    reset: () => { files = []; preview.innerHTML = ''; input.value = '' },
  }
}
