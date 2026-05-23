import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Бүртгэл амжилттай!
        </h1>
        <p className="mb-6 text-muted-foreground">
          Таны бүртгэл амжилттай үүслээ. Имэйл хаягаа баталгаажуулна уу.
        </p>
        
        <div className="mb-8 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Баталгаажуулах линк имэйл хаягт илгээгдсэн</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/login">Нэвтрэх</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Нүүр хуудас руу буцах</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
