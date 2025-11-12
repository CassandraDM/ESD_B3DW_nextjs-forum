"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const router = useRouter();

  const handleGoToSignUp = () => {
    router.push("/signup");
  };

  return <Button onClick={handleGoToSignUp}>Sign Up</Button>;
}
