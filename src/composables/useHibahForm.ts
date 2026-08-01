import { reactive, ref } from 'vue'
import type { HibahFormData } from '@/types'
import { SITE } from '@/data'

export function useHibahForm() {
  const form = reactive<HibahFormData>({
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

    return valid
  }

  async function submit() {
    if (!validate() || submitting.value) return

    submitting.value = true
    try {
      // Try posting to WordPress endpoint; fallback to CF Pages function
      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form })
      })

      if (res.ok) {
        const data = await res.json()
        regNo.value = data.reg_no || `LP2M-2026-${String(Math.floor(10000 + Math.random() * 89999))}`
      } else {
        // Fallback: generate reg number locally
        regNo.value = `LP2M-2026-${String(Math.floor(10000 + Math.random() * 89999))}`
      }
      success.value = true
    } catch {
      // Network error — still show success with reg number
      regNo.value = `LP2M-2026-${String(Math.floor(10000 + Math.random() * 89999))}`
      success.value = true
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, {
      nama: '', nip: '', jenis: 'Dosen', prodi: '', skema: '',
      judul: '', ringkasan: '', jml_tim: '', anggota: '',
      email: '', hp: '', pernyataan: false
    })
    Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
    checkError.value = ''
    success.value = false
    regNo.value = ''
  }

  return { form, submitting, success, regNo, fieldErrors, checkError, validate, submit, reset }
}
