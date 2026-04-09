require('dotenv').config()
const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

app.post('/webhook', async (req, res) => {
  console.log('Webhook received')

  const events = req.body.events

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: 'คุณพิมพ์ว่า: ' + userMessage
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
          }
        }
      )
    }
  }

  res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.send('LINE BOT RUNNING')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})