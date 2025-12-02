'use client'

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Book, RefreshCcw } from "lucide-react"

interface ErrorStateProps {
  code: string | number
  title: string
  description: string
  image?: string
  doc?: string,
  onRetry?: () => void
}

export function ErrorState({
  code,
  title,
  description,
  image,
  doc,
  onRetry
}: ErrorStateProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-screen">
      {/* Imagem opcional */}
      {image && (
        <Image
          src={image}
          alt={title}
          width={180}
          height={180}
          className="mb-6 opacity-90"
        />
      )}

      {/* Código do erro */}
      <div className="text-6xl font-bold text-green-500 mb-2">{code}</div>

      {/* Título */}
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>

      {/* Descrição */}
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>

      <div className="flex gap-3">
        {/* Botão de ação */}
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw />
            Tentar novamente
          </Button>
        )}

        {/* Botão de ação */}
        {doc && (
          <Button variant="outline" onClick={() => router.push(doc)}>
            <Book />
            Documentação
          </Button>
        )}
      </div>
    </div>
  )
}
