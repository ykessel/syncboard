import { redirect } from 'next/navigation'

// GitHub OAuth handles both sign-up and sign-in in one flow
export default function RegisterPage() {
  redirect('/login')
}
