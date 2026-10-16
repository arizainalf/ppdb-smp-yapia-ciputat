export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNISN(nisn: string): string {
  if (!nisn) return '-';
  return nisn.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}
