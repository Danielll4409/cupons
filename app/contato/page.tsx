import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactFormPersistent } from "@/components/contact-form-persistent"
import { CustomerFeedback } from "@/components/customer-feedback"

export default function ContatoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ContactFormPersistent />
        <CustomerFeedback />
      </main>
      <Footer />
    </div>
  )
}
