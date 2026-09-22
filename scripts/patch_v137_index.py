import subprocess, sys, asyncio

subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "playwright==1.55.0"])
subprocess.check_call([sys.executable, "-m", "playwright", "install", "--with-deps", "chromium"])

from playwright.async_api import async_playwright

BASE = "https://team-eysl-7vrd.vercel.app"
ACCOUNTS = [
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
    async with page.expect_response(lambda r: "/functions/v1/register-member" in r.url, timeout=30000) as info:
        await page.click("#signupBtn")
    response = await info.value
    assert response.status == 201, (nick, response.status, await response.text())
    print("E2E_SIGNUP_BACKEND_OK", nick, flush=True)

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
