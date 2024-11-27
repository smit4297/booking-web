// src/app/page.tsx
import { IrctcBookingForm } from '@/components/forms/IrctcBookingForm'

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <IrctcBookingForm />
    </main>
  )
}