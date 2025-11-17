import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton className="h-6 w-3/4" />
      </CardContent>
      <CardFooter className="w-full flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}
