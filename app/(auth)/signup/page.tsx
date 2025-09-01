import SignupForm from "@/components/auth/SignupForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to hub
  if (session) {
    redirect("/hub");
  }

  return <SignupForm />;
}
