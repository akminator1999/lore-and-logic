import ResetPasswordForm from '@/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="bg-[#131a2c] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Set New <span className="text-purple-400">Password</span>
        </h1>
        <ResetPasswordForm />
      </div>
    </div>
  )
}