import { Card, CardContent } from "@/components/ui/card";

type SuccessStateProps = {
  message: string;
};

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4 text-sm text-primary">{message}</CardContent>
    </Card>
  );
}
