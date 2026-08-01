// Cloudflare Pages Function — POST /api/hibah
// Deploy: taruh di functions/api/hibah.ts
// Atau sebagai _worker.js jika pakai Workers mode

interface HibahPayload {
  nama: string
  nip: string
  jenis: string
  prodi: string
  skema: string
  judul: string
  ringkasan: string
  jml_tim?: string
  anggota?: string
  email: string
  hp: string
  pernyataan?: boolean
}

export async function onRequestPost(context: { request: Request }) {
  const data: HibahPayload = await context.request.json()

  // Validate required
  const required: (keyof HibahPayload)[] = ['nama', 'nip', 'jenis', 'prodi', 'skema', 'judul', 'ringkasan', 'email', 'hp']
  const errors: Record<string, string> = {}
  for (const field of required) {
    if (!String(data[field]).trim()) {
      errors[field] = `Kolom ${field} wajib diisi.`
    }
  }
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = 'Format email tidak valid.'
  }
  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ success: false, errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const regNo = `LP2M-2026-${String(Math.floor(10000 + Math.random() * 89999))}`

  // Log ke console CF (bisa di-forward ke email/webhook via Email Routing atau Worker)
  console.log(JSON.stringify({
    type: 'lp2m_hibah',
    reg_no: regNo,
    nama: data.nama,
    nip: data.nip,
    jenis: data.jenis,
    prodi: data.prodi,
    skema: data.skema,
    judul: data.judul,
    ringkasan: data.ringkasan.slice(0, 200),
    email: data.email,
    hp: data.hp,
    timestamp: new Date().toISOString()
  }))

  return new Response(JSON.stringify({
    success: true,
    reg_no: regNo,
    message: 'Pendaftaran berhasil dikirim.'
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
