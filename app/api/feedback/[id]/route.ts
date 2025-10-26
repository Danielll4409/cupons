import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "ID do feedback ausente" }, { status: 400 })
    }

    const [feedback] = await query(
      `SELECT id, nome, email, telefone, assunto, mensagem, status, criado_em
       FROM feedback
       WHERE id = ?`,
      [id]
    )

    if (!feedback) {
      return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ feedback }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar feedback:", error)
    return NextResponse.json({ error: "Erro ao buscar feedback" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.papel !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    const validStatuses = ["novo", "lido", "respondido", "resolvido"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const result = await query<any>(
      `UPDATE feedback SET status = ?, atualizado_em = NOW() WHERE id = ?`,
      [status, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 })
    }

    if (status === "resolvido" && global.io) {
      global.io.to(`feedback_${id}`).emit("feedback_resolvido", { feedbackId: Number.parseInt(id) })
      console.log(`Feedback ${id} marcado como resolvido`)
    }

    const [feedback] = await query<Array<any>>(
      `SELECT id, nome, email, telefone, assunto, mensagem, criado_em as timestamp, status
       FROM feedback WHERE id = ?`,
      [id],
    )

    return NextResponse.json({ success: true, feedback }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar feedback:", error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.papel !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await context.params

    const result = await query<any>(`DELETE FROM feedback WHERE id = ?`, [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Feedback deletado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao deletar feedback:", error)
    return NextResponse.json({ error: "Erro ao deletar feedback" }, { status: 500 })
  }
}
