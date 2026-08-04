import { reactive, ref, type Ref } from 'vue'
import type { HibahFormData } from '@/types'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'

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

  return {
    form, submitting, success, regNo, fieldErrors, checkError,
    customFields, customValues, loadingConfig,
    validate, submit, reset, loadFormConfig
  }
}
