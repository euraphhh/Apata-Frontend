"use client"
import PetForm from '@/components/PetForm'
import { useSession } from '@/hooks/useSession'
import { redirect } from 'next/navigation'

export default function CadastroPage() {
  const isValidSession = useSession()
 if(isValidSession === false){
    redirect('/painel')
  }
  return <PetForm />
}
