import { RegisterForm } from "@/components/register-form"
import { NoahLogo } from "@/components/noah-logo"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-8">
          <NoahLogo className="h-48 w-auto" /> {/* Logo grande */}
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
