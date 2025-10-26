"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Send, MessageCircle, X } from "lucide-react"
import ChatPersistent from "@/components/chat-persistent"

export function ContactFormPersistent() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedbackId, setFeedbackId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [feedbackStatus, setFeedbackStatus] = useState<string>("novo")
  const [checkingExisting, setCheckingExisting] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem("contact_email")
    const storedFeedbackId = localStorage.getItem("feedback_id")

    if (email && storedFeedbackId) {
      setUserEmail(email)
      checkExistingFeedback(email, Number.parseInt(storedFeedbackId))
    } else {
      setCheckingExisting(false)
    }
  }, [])

  const checkExistingFeedback = async (email: string, feedbackIdStored: number) => {
    try {
      const res = await fetch(`/api/feedback/${feedbackIdStored}`)
      if (res.ok) {
        const data = await res.json()
        if (data.feedback && data.feedback.email === email && data.feedback.status !== "resolvido") {
          setFeedbackId(feedbackIdStored)
          setFeedbackStatus(data.feedback.status)
          setSubmitted(true)
        } else {
          localStorage.removeItem("feedback_id")
          localStorage.removeItem("contact_email")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar feedback existente:", error)
    } finally {
      setCheckingExisting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const nome = formData.get("name") as string
    const email = formData.get("email") as string
    const telefone = formData.get("phone") as string
    const assunto = formData.get("subject") as string
    const mensagem = formData.get("message") as string

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, assunto, mensagem }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Erro ao enviar feedback")

      localStorage.setItem("feedback_id", data.feedbackId.toString())
      localStorage.setItem("contact_email", email)

      setFeedbackId(data.feedbackId)
      setUserEmail(email)
      setFeedbackStatus("novo")
      setSubmitted(true)
      form.reset()
    } catch (error) {
      console.error("Erro ao enviar feedback:", error)
      alert("Não foi possível enviar sua mensagem. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseFeedback = () => {
    localStorage.removeItem("feedback_id")
    localStorage.removeItem("contact_email")
    setFeedbackId(null)
    setSubmitted(false)
    setUserEmail("")
  }

  if (checkingExisting) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Entre em Contato</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Tem alguma dúvida ou sugestão? Estamos aqui para ajudar!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <Card className="group hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Email</h3>
                    <p className="text-sm text-muted-foreground">contato@linuxcupons.com.br</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Telefone</h3>
                    <p className="text-sm text-muted-foreground">(11) 9999-9999</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Endereço</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Av. Paulista, 1000
                      <br />
                      São Paulo - SP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-dashed">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 text-foreground">Horário de Atendimento</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Segunda a Sexta: 9h às 18h
                  <br />
                  Sábado: 9h às 13h
                  <br />
                  Domingo: Fechado
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {submitted ? "Conversa em Andamento" : "Envie sua Mensagem"}
                </CardTitle>
                <CardDescription>
                  {submitted
                    ? "Continue a conversa com nossa equipe de suporte"
                    : "Responderemos em até 24 horas úteis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted && feedbackId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Status: {
                            feedbackStatus === "novo" ? "Aguardando resposta" :
                            feedbackStatus === "lido" ? "Visualizado" :
                            feedbackStatus === "respondido" ? "Respondido" :
                            "Resolvido"
                          }</p>
                          <p className="text-sm text-muted-foreground">{userEmail}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseFeedback}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Fechar conversa
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Seu histórico está salvo!
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Suas mensagens anteriores estão preservadas. Use o chat flutuante no canto inferior direito para continuar a conversa.
                      </p>
                    </div>

                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Enviar nova mensagem
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" name="name" placeholder="Seu nome" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Select name="subject">
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Selecione um assunto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support">Suporte Técnico</SelectItem>
                            <SelectItem value="billing">Dúvidas sobre Planos</SelectItem>
                            <SelectItem value="partnership">Parcerias</SelectItem>
                            <SelectItem value="suggestion">Sugestões</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Escreva sua mensagem aqui..."
                        rows={6}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                      {loading ? (
                        <span className="animate-pulse">Enviando...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {feedbackId && <ChatPersistent feedbackId={feedbackId} />}
    </section>
  )
}
