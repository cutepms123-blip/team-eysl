import subprocess, sys, asyncio
subprocess.check_call([sys.executable,"-m","pip","install","-q","playwright==1.55.0"])
subprocess.check_call([sys.executable,"-m","playwright","install","--with-deps","chromium"])
from playwright.async_api import async_playwright

BASE="https://team-eysl-7vrd.vercel.app"
USER="__E2E_UI_CLOSED_260922_1909"
USER_PW=USER+"!"+"Cc3"

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        page=await browser.new_page()
        await page.goto(BASE,wait_until="domcontentloaded",timeout=60000)
        await page.wait_for_selector("#auth.open",timeout=30000)
        await page.fill("#authNickname",USER)
        await page.fill("#authSignupPassword",USER_PW)
        async with page.expect_response(lambda r:"/functions/v1/rejoin-register" in r.url,timeout=30000) as info:
            await page.click("#signupBtn")
        response=await info.value
        body=await response.text()
        assert response.status==201,(response.status,body)
        print("ACTIVE_SETUP_REJOIN_UI_OK",flush=True)
        await browser.close()

asyncio.run(main())

# rerun lifecycle setup
