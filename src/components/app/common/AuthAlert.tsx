"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info } from "lucide-react";

export default function AuthAlert() {
  return (
    <Alert variant="destructive" className="mb-4">
      <Info />
      <AlertTitle>Authentification requise</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 mt-2">
        <p>Vous devez être connecté pour participer aux conversations.</p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/signin">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
