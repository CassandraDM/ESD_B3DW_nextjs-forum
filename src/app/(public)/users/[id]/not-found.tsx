import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-4xl font-bold">Utilisateur non trouvé</h1>
        <p className="text-muted-foreground">
          L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link href="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}

