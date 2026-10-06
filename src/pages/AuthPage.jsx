import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
        navigate(location.state?.from || '/dashboard', { replace: true })
      } else {
        await register(email, password)
        navigate('/login', { replace: true, state: { registered: true } })
      }
    } catch (submissionError) {
      setError(submissionError instanceof ApiError ? submissionError.message : 'Unable to connect to the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#18221d] px-5 py-12 text-white">
      <section className="w-full max-w-md">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-[#e7f4c7]">FitTrack<span className="text-[#caef68]"> AI</span></Link>
        <div className="mt-10 rounded-3xl bg-[#f5f7f2] p-6 text-[#18221d] shadow-2xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#719b35]">{isLogin ? 'Welcome back' : 'Get started'}</p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight">{isLogin ? 'Sign in to continue.' : 'Create your account.'}</h1>
          <p className="mt-3 text-sm leading-6 text-[#718078]">{isLogin ? 'Pick up where you left off.' : 'Your personal fitness workspace starts here.'}</p>
          {location.state?.registered && <p className="mt-5 rounded-xl bg-[#e7f4c7] px-4 py-3 text-sm text-[#466522]">Account created. You can sign in now.</p>}
          {error && <p role="alert" className="mt-5 rounded-xl bg-[#ffe4dc] px-4 py-3 text-sm text-[#a43b25]">{error}</p>}
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold">
              Email address
              <input className="mt-2 w-full rounded-xl border border-[#dfe6d9] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#719b35]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input className="mt-2 w-full rounded-xl border border-[#dfe6d9] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#719b35]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isLogin ? 1 : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            </label>
            <button className="w-full rounded-xl bg-[#18221d] px-4 py-3 font-semibold text-[#e7f4c7] transition hover:bg-[#304232] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-[#718078]">
            {isLogin ? 'New to FitTrack?' : 'Already have an account?'}{' '}
            <Link className="font-semibold text-[#527b20] hover:underline" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
