export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("vi-VN").format(price)} ₫`;
}

export function formatDuration(minutes: number) {
  return `${minutes} phút`;
}

export function formatTreatmentCategory(category: string) {
  const labels: Record<string, string> = {
    neck_shoulder: "Cổ vai gáy",
    physical_therapy: "Vật lý trị liệu",
    recovery: "Phục hồi vận động",
    acupressure: "Bấm huyệt",
    traditional_medicine: "Y học cổ truyền",
  };

  return labels[category] ?? "Liệu trình trị liệu";
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}
