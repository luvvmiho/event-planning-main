import Link from "next/link"

const footerLinks = [
  { href: "/about", label: "БИДНИЙ ТУХАЙ" },
  { href: "/contact", label: "ХОЛБОО БАРИХ" },
  { href: "/terms", label: "ҮЙЛЧИЛГЭЭНИЙ НӨХЦӨЛ" },
  { href: "/privacy", label: "НУУЦЛАЛЫН БОДЛОГО" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-xl font-bold text-primary">
              Nairly
            </Link>
            <p className="text-xs text-muted-foreground">
              © 2026 NAIRLY. БҮХ ЭРХ ХУУЛИАР ХАМГААЛАГДСАН.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
