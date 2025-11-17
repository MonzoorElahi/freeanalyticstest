import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "@/components/LoginForm";

export default async function Home() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
