import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}
