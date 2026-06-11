import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Không có quyền truy cập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tài khoản hiện tại không có quyền xem khu vực này. Vui lòng đăng nhập bằng tài khoản phù hợp.
          </p>
          <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
        </CardContent>
      </Card>
    </div>
  );
}
