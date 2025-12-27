import logging
import os
import aiohttp
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NotificationManager")

class NotificationManager:
    def __init__(self):
        # Configuration from Environment Variables
        self.telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.discord_webhook = os.getenv("DISCORD_WEBHOOK_URL")

        # State Tracking
        self.last_verdict = None
    
    async def send_alert(self, verdict, symbol, price, details=None):
        """
        Sends an alert ONLY if the verdict has changed (State Change Detection).
        """
        # 1. State Change Check
        if verdict == self.last_verdict:
            return  # No change, silence.

        logger.info(f"📢 Signal Changed: {self.last_verdict} -> {verdict}. Sending Alert...")
        self.last_verdict = verdict
        
        # 2. Construct Message
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = (
            f"🚨 **METRON SIGNAL ALERT** 🚨\n\n"
            f"🪙 **Symbol:** {symbol}\n"
            f"📊 **Verdict:** {verdict}\n"
            f"💵 **Price:** ${price:,.2f}\n"
            f"⏰ **Time:** {timestamp}\n"
        )
        
        if details:
             message += f"📝 **Note:** {details}"

        # 3. Send to Telegram
        if self.telegram_token and self.telegram_chat_id:
            await self._send_telegram(message)
        else:
            logger.info("ℹ️ Telegram credentials not found. Skipping Telegram alert.")

        # 4. Send to Discord
        if self.discord_webhook:
            await self._send_discord(message)
        else:
            logger.info("ℹ️ Discord webhook not found. Skipping Discord alert.")

    async def _send_telegram(self, message):
        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
        payload = {
            "chat_id": self.telegram_chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status == 200:
                        logger.info("✅ Telegram Alert Sent!")
                    else:
                        logger.error(f"❌ Failed to send Telegram alert: {await resp.text()}")
        except Exception as e:
            logger.error(f"⚠️ Telegram Connection Error: {e}")

    async def _send_discord(self, message):
        # Discord format adjustment
        payload = {"content": message}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.discord_webhook, json=payload) as resp:
                    if resp.status == 204:
                         logger.info("✅ Discord Alert Sent!")
                    else:
                        logger.error(f"❌ Failed to send Discord alert: {await resp.text()}")
        except Exception as e:
            logger.error(f"⚠️ Discord Connection Error: {e}")

notification_manager = NotificationManager()
