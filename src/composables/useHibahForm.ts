import { reactive, ref, watch, type Ref } from 'vue'
import type { HibahFormData, AnggotaItem } from '@/types'
import { HIBAH, SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { error: toastError } = useToast()

const HIBAH_FORM_PRODI_FALLBACK: string[] = HIBAH.form.prodiOptions || []
const HIBAH_FORM_SKEMA_FALLBACK: string[] = HIBAH.form.skemaOptions || []

// Fallback SDGs: string[] dari content.json → objek { id, name } agar template `o.id`/`o.name` berfungsi.
const HIBAH_FORM_SDGS_FALLBACK: TaxonomyOption[] = (HIBAH.form.sdgsOptions || [])
  .map((s, i) => ({ id: i + 1, name: s }))

const MAX_ANGGOTA_PER_TIPE = 2

export interface SkemaOption {
  id: number
  label: string      // "Parent — Child" atau nama tunggal
  name: string       // nama term (child jika ada, else parent)
  parent: string     // nama parent ('' kalau root)
  desc: string       // description term
}

export interface TaxonomyOption {
  id: number
  name: string
  label?: string   // "Parent — Child" untuk term bertingkat
  parent?: string  // nama parent ('' kalau root)
  desc?: string
}

export interface FormField {
  key: string
  label: string
  type: 'text' | 'url' | 'email' | 'number' | 'radio' | 'select' | 'textarea' | 'tel'
  required: boolean
  options?: string[]
}

export function useHibahForm(
  hibahId: Ref<number | null>,
  deadlineInput?: Ref<string | undefined> | string | undefined
) {
  // Deadline event (ISO datetime). Diterima sebagai Ref (dari parent) atau string statis.
  const deadlineRef = ref<string | undefined>(
    typeof deadlineInput === 'string' ? deadlineInput : undefined
  )
  if (deadlineInput && typeof deadlineInput !== 'string') {
    watch(deadlineInput, v => { deadlineRef.value = v })
  }

  // Property per-event "izinkan pendaftaran setelah deadline" (perpanjangan/darurat).
  // Diambil dari /form-config (data hibah, metabox Detail Hibah). Bukan global.
  // Default false → pendaftaran tetap tertutup sesuai deadline.
  const allowAfterDeadline = ref(false)
  async function refreshAllowAfterDeadline() {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const id = hibahId.value
    if (!id || id <= 0) {
      allowAfterDeadline.value = false
      return
    }
    try {
      const res = await fetch(`${base}/lp2m/v1/hibah/${id}/form-config`)
      if (res.ok) {
        const data = await res.json()
        allowAfterDeadline.value = !!data.allow_after_deadline
      }
    } catch {
      // Biarkan false — pendaftaran tetap tertutup sesuai deadline.
    }
  }
  refreshAllowAfterDeadline()
  watch(hibahId, () => { refreshAllowAfterDeadline() })

  /**
   * True bila deadline sudah lewat (dalam zona waktu browser).
   * Kalau deadline kosong/tidak valid → false (form tetap berjalan seperti biasa).
   * Saat pengaturan "izinkan setelah deadline" aktif → selalu false (form tetap terbuka).
   */
  function isDeadlinePassed(): boolean {
    if (allowAfterDeadline.value) return false
    const dl = deadlineRef.value
    if (!dl) return false
    const ts = new Date(dl).getTime()
    if (Number.isNaN(ts)) return false
    return Date.now() > ts
  }

  const form = reactive<HibahFormData>({
    hibah_id: hibahId.value,
    nama: '',
    nip: '',
    jenis: 'Dosen',
    prodi: '',
    skema: '',
    judul: '',
    ringkasan: '',
    anggota: '',
    jenis_hibah: '',
    sdgs: '',
    kelompok_keahlian: '',
    anggota_list: [],
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

  // ── Dinamis: prodi (CPT program_studi) + model hibah (taxonomy model_hibah hierarchical)
  //    Model tampil parent + child + description (tanpa filter internal/eksternal).
  const prodiTerms = ref<string[]>([])
  const skemaTerms = ref<SkemaOption[]>([])
  const jenisTerms = ref<TaxonomyOption[]>([])
  const sdgsTerms = ref<TaxonomyOption[]>([])
  const kkTerms = ref<TaxonomyOption[]>([])
  const prodiIdName = ref<Record<string, number>>({}) // nama → post ID (CPT)
  const skemaIdByLabel = ref<Record<string, number>>({}) // label → term ID
  const jenisIdByName = ref<Record<string, number>>({})
  const sdgsIdByName = ref<Record<string, number>>({})
  const kkIdByName = ref<Record<string, number>>({})
  const taxonomyLoaded = ref(false)

  function addAnggota(tipe: 'dosen' | 'mahasiswa' = 'dosen') {
    const count = form.anggota_list.filter(m => m.tipe === tipe).length
    if (count >= MAX_ANGGOTA_PER_TIPE) return
    form.anggota_list.push({ tipe, nomor: '', nama: '', prodi: '' })
  }
  function removeAnggota(idx: number) {
    form.anggota_list.splice(idx, 1)
  }

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

        // Jenis hibah / SDGs / Kelompok keahlian dari form-config.
        jenisTerms.value = (cfg.jenis_options || []).filter((t: any) => t && String(t.name || '').trim())
        const cfgSdgs = (cfg.sdgs_options || []).filter((t: any) => t && String(t.name || '').trim())
        sdgsTerms.value = cfgSdgs.length ? cfgSdgs : (HIBAH_FORM_SDGS_FALLBACK as TaxonomyOption[])
        const cfgKk = ((cfg.kk_options?.length ? cfg.kk_options : (cfg.kelompok_options || [])) as any[])
          .filter((t: any) => t && String(t.name || '').trim())
        kkTerms.value = cfgKk
        // Map ID berdasar label (parent-child) — sama seperti skema.
        const jid: Record<string, number> = {}
        ;(cfg.jenis_options || []).forEach((t: any) => { const l = t.label || t.name; if (l) jid[l] = t.id })
        jenisIdByName.value = jid
        const sid: Record<string, number> = {}
        ;(cfgSdgs.length ? cfg.sdgs_options : (HIBAH_FORM_SDGS_FALLBACK as any[])).forEach((t: any) => { if (t.name) sid[t.name] = t.id })
        sdgsIdByName.value = sid
        const kid: Record<string, number> = {}
        ;(cfgKk).forEach((t: any) => { const l = t.label || t.name; if (l) kid[l] = t.id })
        kkIdByName.value = kid

        taxonomyLoaded.value = true
        return
      }

      // Fallback: fetch langsung /wp/v2/* (kalau form-config belum ada).
      const [prodiPosts, skemaRaw, jenisRaw, sdgsRaw, kkRaw] = await Promise.all([
        fetch(`${base}/wp/v2/program_studi?per_page=100&_fields=id,title`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/wp/v2/model_hibah?per_page=100&_fields=id,name,slug,description,parent`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/wp/v2/jenis_hibah?per_page=100&_fields=id,name,parent`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/wp/v2/sdgs?per_page=100&_fields=id,name`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${base}/wp/v2/kelompok_keahlian?per_page=100&_fields=id,name,parent`).then(r => r.ok ? r.json() : []).catch(() => []),
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

      // Fallback taxonomy jenis/sdgs/kk.
      // Flat parent-child: label "Parent — Child".
      const flatTax = (arr: any[]) => {
        const list = (arr || [])
          .filter((t: any) => t && String(t.name || '').trim())
          .map((t: any) => ({ id: t.id, name: t.name, parent: t.parent || 0 }))
        const byId: Record<number, any> = {}
        list.forEach(t => { byId[t.id] = t })
        return list.map(t => {
          const pid = typeof t.parent === 'number' ? t.parent : 0
          if (pid && byId[pid]) {
            return { ...t, label: `${byId[pid].name} — ${t.name}`, parent: byId[pid].name }
          }
          return { ...t, label: t.name, parent: '' }
        })
      }
      const toOpts = (arr: any[]) => (arr || [])
        .filter((t: any) => t && String(t.name || '').trim())
        .map((t: any) => ({ id: t.id, name: t.name }))
      jenisTerms.value = flatTax(jenisRaw)
      sdgsTerms.value = toOpts(sdgsRaw).length ? toOpts(sdgsRaw) : (HIBAH_FORM_SDGS_FALLBACK as TaxonomyOption[])
      kkTerms.value = flatTax(kkRaw)
      const jid2: Record<string, number> = {}
      ;(jenisTerms.value as any[]).forEach((t: any) => { if (t.label) jid2[t.label] = t.id })
      jenisIdByName.value = jid2
      const sid2: Record<string, number> = {}
      ;(sdgsRaw || []).forEach((t: any) => { if (t.name) sid2[t.name] = t.id })
      sdgsIdByName.value = sid2
      const kid2: Record<string, number> = {}
      ;(kkTerms.value as any[]).forEach((t: any) => { if (t.label) kid2[t.label] = t.id })
      kkIdByName.value = kid2

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

    // Deadline gate — form tidak boleh diisi jika melewati deadline.
    if (isDeadlinePassed()) {
      fieldErrors.deadline = 'Pendaftaran telah ditutup.'
      checkError.value = 'Pendaftaran telah ditutup.'
      return false
    } else {
      fieldErrors.deadline = ''
    }

    const required: [keyof HibahFormData, string][] = [
      ['nama', 'Nama lengkap wajib diisi.'],
      ['nip', 'NIDN/NIDK wajib diisi.'],
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

    // Anggota tim dinamis (max 2): tiap entry butuh nomor + nama.
    form.anggota_list.forEach((m, i) => {
      const k = 'anggota_list_' + i
      if (!m.nomor.trim() || !m.nama.trim()) {
        fieldErrors[k] = 'Nomor & nama anggota #' + (i + 1) + ' wajib diisi.'
        valid = false
      } else {
        fieldErrors[k] = ''
      }
    })

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

    // Deadline gate — jaga-jaga bila validate() dipanggil ulang / form di-bypass.
    if (isDeadlinePassed()) {
      fieldErrors.deadline = 'Pendaftaran telah ditutup.'
      checkError.value = 'Pendaftaran telah ditutup.'
      return
    }

    form.hibah_id = hibahId.value
    submitting.value = true
    try {
      // Multipart/form-data agar file proposal (PDF) ikut terkirim.
      const fd = new FormData()
      const keys: (keyof HibahFormData)[] = [
        'hibah_id', 'nama', 'nip', 'jenis', 'prodi', 'skema', 'judul', 'ringkasan',
        'anggota', 'jenis_hibah', 'sdgs', 'kelompok_keahlian', 'email', 'hp'
      ]
      for (const k of keys) {
        const v = form[k]
        if (v !== undefined && v !== null) fd.append(k, String(v))
      }
      fd.append('pernyataan', form.pernyataan ? '1' : '0')
      // ID term/post untuk sinkronisasi (backend simpan _skema_id/_prodi_id dkk).
      fd.append('skema_id', String(skemaIdByLabel.value[form.skema] || ''))
      fd.append('prodi_id', String(prodiIdName.value[form.prodi] || ''))
      fd.append('jenis_hibah_id', String(jenisIdByName.value[form.jenis_hibah] || ''))
      fd.append('sdgs_id', String(sdgsIdByName.value[form.sdgs] || ''))
      fd.append('kk_id', String(kkIdByName.value[form.kelompok_keahlian] || ''))
      // Anggota tim — hanya terisi (skip kosong).
      const anggota = form.anggota_list.filter(m => m.nomor.trim() || m.nama.trim())
      anggota.forEach((m, i) => {
        fd.append(`anggota_list[${i}][tipe]`, m.tipe)
        fd.append(`anggota_list[${i}][nomor]`, m.nomor)
        fd.append(`anggota_list[${i}][nama]`, m.nama)
        fd.append(`anggota_list[${i}][prodi]`, m.prodi)
      })
      for (const f of customFields.value) {
        fd.append(f.key, customValues[f.key] || '')
      }
      // File proposal PDF (wajib di form).
      if (form.proposal instanceof File) {
        fd.append('proposal', form.proposal, form.proposal.name)
      }

      const auth = useAuthStore()
      const headers: Record<string, string> = {
        ...auth.authHeaders()
      }
      // JANGAN set Content-Type manual — biarkan browser set boundary multipart.

      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        headers,
        body: fd
      })

      if (res.ok) {
        const data = await res.json()
        const regNo = data.reg_no || ''
        // Redirect ke halaman sukses dengan nomor registrasi
        window.location.href = `/v/sukses/${regNo}`
      } else {
        const d = await res.json().catch(() => ({}))
        // Tampilkan error dari server — jangan redirect palsu.
        if (d?.errors && typeof d.errors === 'object') {
          Object.keys(d.errors).forEach(k => {
            fieldErrors[k] = d.errors[k]
          })
        }
        const msg = d?.message || d?.errors?.proposal || 'Pendaftaran gagal. Periksa kembali data Anda lalu coba lagi.'
        checkError.value = msg
        toastError(msg)
      }
    } catch (e: any) {
      const msg = (e?.message || 'Gagal terhubung ke server. Periksa koneksi lalu coba lagi.')
      checkError.value = msg
      toastError(msg)
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    form.hibah_id = hibahId.value
    Object.assign(form, {
      hibah_id: hibahId.value,
      nama: '', nip: '', jenis: 'Dosen' as const, prodi: '', skema: '',
      judul: '', ringkasan: '', anggota: '',
      jenis_hibah: '', sdgs: '', kelompok_keahlian: '', anggota_list: [],
      email: '', hp: '', pernyataan: false,
      proposal: null, proposalName: ''
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

  watch(hibahId, (newId) => {
    if (newId && newId > 0) {
      loadFormConfig()
    }
  })

  return {
    form, submitting, success, regNo, fieldErrors, checkError,
    customFields, customValues, loadingConfig,
    prodiTerms, skemaTerms, skemaOptionsAll,
    jenisTerms, sdgsTerms, kkTerms,
    prodiIdName, skemaIdByLabel, jenisIdByName, sdgsIdByName, kkIdByName,
    anggotaList: form.anggota_list, addAnggota, removeAnggota,
    isDeadlinePassed, allowAfterDeadline, validate, submit, reset, loadFormConfig
  }
}
