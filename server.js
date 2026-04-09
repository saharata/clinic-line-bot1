require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// แก้ลิงก์ 3 จุดนี้ให้เป็นของจริงของคลินิกคุณ
const HEALTH_FORM_URL = 'https://forms.gle/PASTE_YOUR_FORM_LINK';
const CLINIC_MAP_URL = 'https://maps.google.com/?q=PASTE_YOUR_LOCATION';
const CLINIC_PHONE = '02-XXX-XXXX';

async function replyMessage(replyToken, messages) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken,
      messages
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

function getMenuText() {
  return (
    'สวัสดีครับ คลินิกสหวรรณ ยินดีให้บริการ\n\n' +
    'พิมพ์คำสั่งได้ดังนี้:\n' +
    '• นัดหมาย\n' +
    '• สุขภาพ\n' +
    '• ติดต่อ\n\n' +
    'ตัวอย่าง:\n' +
    '- พิมพ์ "นัดหมาย" เพื่อติดต่อเรื่องการนัด\n' +
    '- พิมพ์ "สุขภาพ" เพื่อกรอกข้อมูลสุขภาพ\n' +
    '- พิมพ์ "ติดต่อ" เพื่อดูเบอร์และแผนที่คลินิก'
  );
}

app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type !== 'message' || event.message.type !== 'text') {
        continue;
      }

      const replyToken = event.replyToken;
      const userText = (event.message.text || '').trim().toLowerCase();

      if (userText === 'hello' || userText === 'hi' || userText === 'สวัสดี') {
        await replyMessage(replyToken, [
          {
            type: 'text',
            text: getMenuText()
          }
        ]);
        continue;
      }

      if (userText === 'นัดหมาย') {
        await replyMessage(replyToken, [
          {
            type: 'text',
            text:
              'สำหรับการนัดหมาย กรุณาส่งข้อมูลดังนี้:\n' +
              '1) ชื่อ-นามสกุล\n' +
              '2) เบอร์โทร\n' +
              '3) วันที่สะดวก\n' +
              '4) เวลาที่สะดวก\n' +
              '5) อาการสำคัญโดยย่อ\n\n' +
              'เจ้าหน้าที่จะติดต่อกลับโดยเร็วครับ'
          }
        ]);
        continue;
      }

      if (userText === 'สุขภาพ') {
        await replyMessage(replyToken, [
          {
            type: 'text',
            text:
              'กรุณากรอกบันทึกสุขภาพได้ที่ลิงก์นี้ครับ:\n' +
              HEALTH_FORM_URL +
              '\n\nใช้เวลาไม่นาน และช่วยให้คลินิกติดตามอาการได้ดีขึ้นครับ'
          }
        ]);
        continue;
      }

      if (userText === 'ติดต่อ') {
        await replyMessage(replyToken, [
          {
            type: 'text',
            text:
              'ติดต่อคลินิกสหวรรณ\n' +
              `โทร: ${CLINIC_PHONE}\n` +
              `แผนที่: ${CLINIC_MAP_URL}\n\n` +
              'หากต้องการนัดหมาย สามารถพิมพ์ "นัดหมาย" ได้เลยครับ'
          }
        ]);
        continue;
      }

      await replyMessage(replyToken, [
        {
          type: 'text',
          text: getMenuText()
        }
      ]);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.response?.data || error.message);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => {
  res.send('LINE BOT RUNNING');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});