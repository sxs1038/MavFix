export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-primary text-primary-foreground py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm opacity-80">
          &copy; {currentYear} University of Texas at Arlington
        </p>
        <p className="text-xs opacity-60 mt-1">
          MavFix - Campus Maintenance Management System
        </p>
      </div>
    </footer>
  )
}
