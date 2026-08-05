import { reactive, ref, type Ref } from 'vue'
import type { HibahFormData } from '@/types'
import { HIBAH, SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'

const HIBAH_FORM_PRODI_FALLBACK: string[] = HIBAH.form.prodiOptions || []
const HIBAH_FORM_SKEMA_FALLBACK: string[] = HIBAH.form.skemaOptions || []

export interface SkemaOption {
  id: number
  label: string      // "Parent — Child" atau nama tunggal
  name: string       // nama term (child jika ada, else parent)
  parent: string     // nama parent ('' kalau root)
  desc: string       // description term
}

export interface FormField {
  key: string
  label: string
  type: 'text' | 'url' | 'email' | 'number' | 'radio' | 'select' | 'textarea' | 'tel'
  required: boolean
  options?: string[]
}

export function useHibahForm(hibahId: Ref<number | null>) {
  const form = reactive<HibahFormData>({
    hibah_id: hibahId.value,
    nama: '',
    nip: '',
    jenis: 'Dosen',
    prodi: '',
    skema: '',
    judul: '',
    ringkasan: '',
    jml_tim: '',
    anggota: '',
    email: '',
    hp: '',
    pernyataan: false
  })

  const submitting = ref(false)
  const success = ref(false)
  const regNo = ref('')
  const fieldErrors = reactive<Record<string, string>>({})
  const checkError = ref('')
  const customFields = ref<FormField[]>([])
  const customValues = reactive<Record<string, string>>({})
  const loadingConfig = ref(false)

  // ── Dinamis: prodi (CPT program_studi) + skema (taxonomy skema_hibah hierarchical)
  //    Skema tampil parent + child + description (tanpa filter internal/eksternal).
  const prodiTerms = ref<string[]>([])
  const skemaTerms = ref<SkemaOption[]>([])
  const prodiIdName = ref<Record<string, number>>({}) // nama → post ID (CPT)
  const skemaIdByLabel = ref<Record<string, number>>({}) // label → term ID
  const taxonomyLoaded = ref(false)

  async function loadTaxonomies() {
    if (taxonomyLoaded.value) return
    const base = SITE.apiBase.replace('/wp/v2', '')
    try {
      // Prioritas: /form-config (backend terstruktur, id+label+desc). Hanya kalau hibah dipilih.
      // (hibahId 0 = belum pilih → langsung fallback /wp/v2/*, tanpa fetch form-config)
      const hasHibah = (hibahId.value ?? 0) > 0
      const cfg = hasHibah
        ? await fetch(`${base}/lp2m/v1/hibah/${hibahId.value}/form-config`)
            .then(r => r.ok ? r.json() : null).catch(() => null)
        : null

      if (cfg?.success) {
        const prodi = (cfg.prodi_options || []).map((p: any) => p.name).filter(Boolean)
        prodiTerms.value = prodi.length ? prodi : (HIBAH_FORM_PRODI_FALLBACK as string[])
        const idName: Record<string, number> = {}
        ;(cfg.prodi_options || []).forEach((p: any) => { if (p.name) idName[p.name] = p.id })
        prodiIdName.value = idName
        skemaTerms.value = cfg.skema_options?.length ? cfg.skema_options : []
        const idByLabel: Record<string, number> = {}
        ;(cfg.skema_options || []).forEach((s: any) => { if (s.label) idByLabel[s.label] = s.id })
        skemaIdByLabel.value = idByLabel
        taxonomyLoaded.value = true
        return
      }

      // Fallback: fetch langsung /wp/v2/* (kalau form-config belum ada).
      const [prodiPosts, skemaRaw] = await Promise.all([
        fetch(`${base}/wp/v2/program_studi?per_page=100&_fields=id,title`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/wp/v2/skema_hibah?per_page=100&_fields=id,name,slug,description,parent`).then(r => r.ok ? r.json() : []).catch(() => []),
      ])

      const prodi = (prodiPosts || []).map((p: any) => p?.title?.rendered || p?.title || '').filter(Boolean)
      prodiTerms.value = prodi.length ? prodi : (HIBAH_FORM_PRODI_FALLBACK as string[])
      const idName2: Record<string, number> = {}
      ;(prodiPosts || []).forEach((p: any) => { const n = p?.title?.rendered || p?.title || ''; if (n) idName2[n] = p.id })
      prodiIdName.value = idName2

      const terms: SkemaOption[] = (skemaRaw || []).map((t: any) => ({
        id: t.id, label: t.name, name: t.name, parent: t.parent || 0, desc: t.description || ''
      }))
      const byId: Record<number, SkemaOption> = {}
      terms.forEach(t => { byId[t.id] = t })
      const flattened = terms.map(t => {
        const pid = typeof t.parent === 'number' ? t.parent : 0
        if (pid && byId[pid]) {
          const p = byId[pid]
          return { ...t, label: `${p.name} — ${t.name}`, parent: p.name }
        }
        return t
      })
      skemaTerms.value = flattened.length ? flattened : (HIBAH_FORM_SKEMA_FALLBACK as unknown as SkemaOption[])
      const idByLabel2: Record<string, number> = {}
      flattened.forEach(s => { idByLabel2[s.label] = s.id })
      skemaIdByLabel.value = idByLabel2
      taxonomyLoaded.value = true
    } catch {
      // fallback statis
    }
  }

  function skemaOptionsAll(): SkemaOption[] {
    return skemaTerms.value
  }

  async function loadFormConfig() {
    const id = hibahId.value
    if (!id || id <= 0) return
    loadingConfig.value = true
    try {
      const res = await fetch(`${SITE.apiBase.replace('/wp/v2', '')}/lp2m/v1/hibah/${id}/form-config`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.custom) {
          customFields.value = data.custom
          // Initialize values
          for (const f of data.custom) {
            if (!(f.key in customValues)) {
              customValues[f.key] = ''
            }
          }
        }
      }
    } catch {
      // silently fail — form still works with standard fields
    } finally {
      loadingConfig.value = false
    }
  }

  function validate(): boolean {
    let valid = true
    const required: [keyof HibahFormData, string][] = [
      ['nama', 'Nama lengkap wajib diisi.'],
      ['nip', 'NIDN/NIDK/NIM wajib diisi.'],
      ['judul', 'Judul usulan wajib diisi.'],
      ['ringkasan', 'Ringkasan usulan wajib diisi.'],
      ['email', 'Email aktif wajib diisi.'],
      ['hp', 'Nomor WhatsApp wajib diisi.']
    ]

    for (const [key, msg] of required) {
      if (!String(form[key]).trim()) {
        fieldErrors[key] = msg
        valid = false
      } else {
        fieldErrors[key] = ''
      }
    }

    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      fieldErrors.email = 'Format email tidak valid.'
      valid = false
    }

    if (!form.prodi) { fieldErrors.prodi = 'Wajib dipilih.'; valid = false }
    else fieldErrors.prodi = ''

    if (!form.skema) { fieldErrors.skema = 'Wajib dipilih.'; valid = false }
    else fieldErrors.skema = ''

    if (!form.pernyataan) {
      checkError.value = 'Anda harus menyetujui pernyataan orisinalitas.'
      valid = false
    } else {
      checkError.value = ''
    }

    // Validate custom required fields
    for (const f of customFields.value) {
      if (f.required && !(customValues[f.key] || '').trim()) {
        fieldErrors[f.key] = f.label + ' wajib diisi.'
        valid = false
      } else {
        fieldErrors[f.key] = ''
      }
    }

    return valid
  }

  async function submit() {
    if (!validate() || submitting.value) return

    form.hibah_id = hibahId.value
    submitting.value = true
    try {
      const payload: Record<string, unknown> = { ...form }
      // Sertakan ID term/post untuk sinkronisasi data (backend simpan _skema_id/_prodi_id).
      payload.skema_id = skemaIdByLabel.value[form.skema] || ''
      payload.prodi_id = prodiIdName.value[form.prodi] || ''
      for (const f of customFields.value) {
        payload[f.key] = customValues[f.key] || ''
      }

      const auth = useAuthStore()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...auth.authHeaders()
      }

      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        const regNo = data.reg_no || ''
        // Redirect ke halaman sukses dengan nomor registrasi
        window.location.href = `/v/sukses/${regNo}`
      } else {
        const d = await res.json().catch(() => ({}))
        // Fallback: redirect with warning
        window.location.href = `/v/sukses/000000000000`
      }
    } catch {
      window.location.href = `/v/sukses/000000000000`
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    form.hibah_id = hibahId.value
    Object.assign(form, {
      hibah_id: hibahId.value,
      nama: '', nip: '', jenis: 'Dosen' as const, prodi: '', skema: '',
      judul: '', ringkasan: '', jml_tim: '', anggota: '',
      email: '', hp: '', pernyataan: false
    })
    Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    for (const f of customFields.value) {
      customValues[f.key] = ''
    }
    checkError.value = ''
    success.value = false
    regNo.value = ''
  }

  // Auto-load config when hibahId changes
  loadFormConfig()
  loadTaxonomies()

  return {
    form, submitting, success, regNo, fieldErrors, checkError,
    customFields, customValues, loadingConfig,
    prodiTerms, skemaTerms, skemaOptionsAll,
    prodiIdName, skemaIdByLabel,
    validate, submit, reset, loadFormConfig
  }
}
