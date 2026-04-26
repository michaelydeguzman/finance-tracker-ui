import { SignupForm } from "@/app/(auth)/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <SignupForm />
    </div>
  );
}
