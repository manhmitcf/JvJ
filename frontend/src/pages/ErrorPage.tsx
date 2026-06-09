import { AlertTriangle, House, RotateCcw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return "Trang anh cần hiện không còn khả dụng hoặc đường dẫn chưa đúng.";
    }

    return error.statusText || "Hệ thống đang gặp lỗi khi tải nội dung.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Hệ thống vừa gặp lỗi ngoài dự kiến. Anh thử tải lại trang để tiếp tục nhé.";
}

export function ErrorPage() {
  const error = useRouteError();
  const message = getErrorMessage(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-bg px-6 py-12 text-ink-primary">
      <Card className="w-full max-w-2xl border-destructive/20 shadow-stitch-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage-secondary">500 - Có lỗi xảy ra</p>
            <CardTitle className="text-2xl text-ink-primary">JvJ đang cần một nhịp để ổn định lại</CardTitle>
            <p className="text-sm leading-6 text-sage-secondary">{message}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Tải lại trang
          </button>
          <Link to="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <House className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
