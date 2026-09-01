import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8663507696:AAHrZ1cYKtbssS-hH-C5WbcoANhkjAAFK2Q";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "5168917509";

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, whatsapp, website, description, budget, startDate, turnaroundTime, isTest } = data;

    const botToken = BOT_TOKEN;
    const chatId = CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({
        success: false,
        message: 'Telegram credentials missing.'
      }, { status: 400 });
    }

    // Format rich Telegram message
    let message = '';
    if (isTest) {
      message = `🔔 *EXTProduction Telegram Bot Connected!*\n\n` +
        `✅ Real-time lead notifications are working and connected to your Telegram.\n\n` +
        `🌐 *Website:* https://extproduction.com\n` +
        `🕒 *Timestamp:* ${new Date().toLocaleString('en-US')}`;
    } else {
      const cleanPhone = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '';
      const cleanWebsite = website ? (website.startsWith('http') ? website : `https://${website}`) : '';

      message = `🚀 *NEW PROJECT INQUIRY!* (extproduction.com)\n\n` +
        `👤 *Client Name:* ${name || 'Not provided'}\n` +
        `📧 *Email:* ${email || 'Not provided'}\n` +
        `💬 *WhatsApp:* ${whatsapp || 'Not provided'}\n` +
        `🌐 *Website:* ${website || 'Not provided'}\n\n` +
        `💰 *Budget Range:* ${budget || 'Flexible'}\n` +
        `📅 *Start Date:* ${startDate || 'ASAP'}\n` +
        `⏱️ *Expected Turnaround:* ${turnaroundTime || 'Standard'}\n\n` +
        `📝 *Project Brief & Description:*\n` +
        `"${description || 'No description entered.'}"\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚡ *Quick Actions:*\n` +
        (cleanPhone ? `• 💬 [Chat on WhatsApp](https://wa.me/${cleanPhone})\n` : '') +
        (email ? `• ✉️ [Email Client](mailto:${email})\n` : '') +
        (cleanWebsite ? `• 🔗 [Open Client Website](${cleanWebsite})\n` : '') +
        `• 📊 [Open Admin Dashboard](https://extproduction.com/admin)`;
    }

    // Send message via Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API Error:", result);
      return NextResponse.json({ success: false, error: result.description }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Telegram Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
