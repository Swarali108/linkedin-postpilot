import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in · PostPilot" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <AuthForm next={next || "/dashboard"} />
      </div>
    </main>
  );
}
