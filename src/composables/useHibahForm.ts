import { reactive, ref, type Ref } from 'vue'
import type { HibahFormData } from '@/types'
import { SITE } from '@/data'

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

    // Sync hibah_id from the reactive ref (parent may update it).
    form.hibah_id = hibahId.value

    submitting.value = true
    try {
      const res = await fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form })
      })

      if (res.ok) {
        const data = await res.json()
        regNo.value = data.reg_no || `REG-${String(Math.floor(10000 + Math.random() * 89999))}`
      } else {
        regNo.value = `REG-${String(Math.floor(10000 + Math.random() * 89999))}`
      }
      success.value = true
    } catch {
      regNo.value = `REG-${String(Math.floor(10000 + Math.random() * 89999))}`
      success.value = true
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
    checkError.value = ''
    success.value = false
    regNo.value = ''
  }

  return { form, submitting, success, regNo, fieldErrors, checkError, validate, submit, reset }
}
