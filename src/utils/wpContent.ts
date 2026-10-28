/**
 * Hidrasi konten Gutenberg yang dirender lewat `v-html` dari REST
 * (`content.rendered`).
 *
 * Blok `core/file` menyembunyikan preview PDF dengan atribut `hidden` dan
 * membiarkan Interactivity API yang melepasnya di browser:
 *
 *   <object data-wp-bind--hidden="!state.hasPdfPreview" hidden
 *           class="wp-block-file__embed" data="...pdf" type="application/pdf">
 *
 * SPA tidak memuat runtime Interactivity API maupun view script blok tersebut,
 * jadi `hidden` tidak pernah dilepas dan PDF tidak pernah tampil — padahal di
 * halaman WordPress aslinya tampil. Fungsi ini meniru view script core/file
 * (`navigator.pdfViewerEnabled`) supaya perilaku SPA sama dengan aslinya.
 *
 * Aturan "hanya tampilkan bila browser punya PDF viewer" dipertahankan: bila
 * tidak, preview dibiarkan tersembunyi dan pengguna tetap punya tautan
 * unduh — persis seperti di WordPress.
 */
export function hydrateWpContent(root: HTMLElement | null | undefined): void {
  if (!root) return

  const canPreviewPdf = (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled === true

  root.querySelectorAll<HTMLElement>('.wp-block-file__embed[data-wp-bind--hidden]').forEach((el) => {
    // Atribut direktif tidak ada gunanya tanpa runtime — buang agar tidak
    // ada sisa markup mati di DOM.
    el.removeAttribute('data-wp-bind--hidden')
    if (canPreviewPdf) {
      el.removeAttribute('hidden')
    } else if (!el.hasAttribute('hidden')) {
      el.setAttribute('hidden', '')
    }
  })
}
