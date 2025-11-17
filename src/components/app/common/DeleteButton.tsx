import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface DeleteButtonProps {
  className?: string;
  entityName: string;
  id: string;
  onDelete: (id: string) => Promise<void>;
  queryKey: string;
}

export default function DeleteButton({
  className,
  entityName,
  id,
  onDelete,
  queryKey,
}: DeleteButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await onDelete(id);
    },
    onSuccess: () => {
      toast.success(`${entityName} deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      // Si on supprime un message, invalider aussi les conversations pour mettre à jour le nombre de messages
      if (queryKey === "messages") {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Button
      variant="destructive"
      className={cn("bg-red-400", className)}
      onClick={handleDelete}
    >
      <Trash />
    </Button>
  );
}
