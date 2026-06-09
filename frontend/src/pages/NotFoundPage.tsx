import { Compass, House, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-bg px-6 py-12 text-ink-primary">
      <Card className="w-full max-w-2xl border-botanical-border shadow-stitch-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-soft-mint text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage-secondary">404 - Không tìm thấy trang</p>
            <CardTitle className="text-2xl text-ink-primary">Trang anh tìm hiện không có trong JvJ</CardTitle>
            <p className="text-sm leading-6 text-sage-secondary">
              Có thể đường dẫn đã thay đổi hoặc trang này chưa sẵn sàng. Anh quay lại bước trước hoặc về trang chủ để tiếp tục nhé.
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => window.history.back()} variant="secondary" className="gap-2">
            <Undo2 className="h-4 w-4" />
            Quay lại
          </Button>
          <Link to="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <House className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
