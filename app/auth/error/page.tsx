import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Алдаа гарлаа
        </h1>
        <p className="mb-6 text-muted-foreground">
          Нэвтрэх явцад алдаа гарлаа. Дахин оролдоно уу.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/login">Нэвтрэх хуудас руу буцах</Link>
        </Button>
      </div>
    </div>
  )
}
