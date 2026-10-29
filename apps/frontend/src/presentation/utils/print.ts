/**
 * Cetak hanya elemen target (bukan seluruh halaman/navbar).
 * Tandai elemen dengan class .print-area, panggil dialog cetak,
 * lalu bersihkan setelah dialog ditutup (event afterprint).
 */
export function printElement(el: HTMLElement | null): void {
  if (!el) return;

  el.classList.add('print-area');

  const cleanup = () => {
    el.classList.remove('print-area');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);

  window.print();

  // Fallback browser lama yang tidak memicu afterprint
  setTimeout(cleanup, 2000);
}
