const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Clinic LINE bot is running");
});

async function replyToLine(replyToken, text) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text
        }
      ]
    })
  });

  const data = await response.text();

  if (!response.ok) {
    throw new Error(`LINE reply failed: ${response.status} ${data}`);
  }

  return data;
}

app.post("/line/webhook", async (req, res) => {
  try {
    console.log("LINE webhook event:", JSON.stringify(req.body, null, 2));

    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message?.type === "text") {
        const userText = event.message.text || "";
        const replyToken = event.replyToken;

        let replyMessage = "สวัสดีครับ คลินิกได้รับข้อความของคุณแล้ว";

        if (userText.includes("สวัสดี")) {
          replyMessage = "สวัสดีครับ คลินิกได้รับข้อความแล้ว เดี๋ยวจะตอบกลับโดยเร็วที่สุดครับ";
        } else if (userText.includes("เวลาเปิด")) {
          replyMessage = "กรุณาส่งวันและช่วงเวลาที่ต้องการนัดหมายได้เลยครับ";
        } else {
          replyMessage = `คลินิกได้รับข้อความแล้ว: ${userText}`;
        }

        await replyToLine(replyToken, replyMessage);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});