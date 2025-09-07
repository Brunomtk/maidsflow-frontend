import Image from "next/image"

interface NoahLogoProps {
  className?: string
}

export function NoahLogo({ className }: NoahLogoProps) {
  return (
    <div className={className}>
      <Image src="/logo.png" alt="Noah Logo" width={120} height={40} className="w-full h-full object-contain" />
    </div>
  )
}
