import subprocess, sys, asyncio

subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "playwright==1.55.0"])
subprocess.check_call([sys.executable, "-m", "playwright", "install", "--with-deps", "chromium"])

from playwright.async_api import async_playwright

BASE = "https://team-eysl-7vrd.vercel.app"
ACCOUNTS = [
    "__E2E_UI_ADMIN_260922_1909",
    "__E2E_UI_CLOSED_260922_1909",
    "__E2E_UI_OPEN_260922_1909",
]

def pw(nick):
    return nick + "!Aa1"

async def signup(page, nick):
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_selector("#auth.open", timeout=30000)
    await page.fill("#authNickname", nick)
    await page.fill("#authSignupPassword", pw(nick))
    await page.click("#signupBtn")
    await page.wait_for_selector("#authPending.open", timeout=30000)
    text = (await page.locator("#pendingNickname").inner_text()).strip()
    assert nick in text, (nick, text)
    print("E2E_SIGNUP_OK", nick, flush=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for nick in ACCOUNTS:
                context = await browser.new_context()
                page = await context.new_page()
                await signup(page, nick)
                await context.close()
        finally:
            await browser.close()

asyncio.run(main())
