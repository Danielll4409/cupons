const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`)

    socket.on("join_feedback", (feedbackId) => {
      const sala = `feedback_${feedbackId}`
      socket.join(sala)
      console.log(`📥 ${socket.id} entrou na sala: ${sala}`)
    })

    socket.on("leave_feedback", (feedbackId) => {
      const sala = `feedback_${feedbackId}`
      socket.leave(sala)
      console.log(`📤 ${socket.id} saiu da sala: ${sala}`)
    })

    socket.on("disconnect", () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`)
    })
  })

  global.io = io

  httpServer
    .once("error", (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
