import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("JvJ ErrorBoundary caught an error", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-warm-bg px-6 py-12 text-ink-primary">
          <Card className="w-full max-w-2xl border-destructive/20 shadow-stitch-soft">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-ink-primary">JvJ đang gặp trục trặc nhỏ</CardTitle>
                <p className="text-sm leading-6 text-sage-secondary">
                  Rất tiếc, trang này vừa gặp lỗi ngoài dự kiến. Anh thử tải lại giúp em để tiếp tục đặt lịch hoặc kiểm tra thông tin nhé.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={this.handleReload}>Tải lại trang</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
