import subprocess, sys, asyncio

subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "playwright==1.55.0"])
subprocess.check_call([sys.executable, "-m", "playwright", "install", "--with-deps", "chromium"])

from playwright.async_api import async_playwright

BASE="https://team-eysl-7vrd.vercel.app"
ADMIN="__E2E_UI_ADMIN_260922_1909"
USER="__E2E_UI_CLOSED_260922_1909"
ADMIN_PW=ADMIN+"!Aa1"
USER_OLD_PW=USER+"!Aa1"
USER_NEW_PW=USER+"!Bb2"

async def login(page,nick,pw):
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_selector("#auth.open", timeout=30000)
    await page.click("#loginTabBtn")
    await page.fill("#authLoginNickname",nick)
    await page.fill("#authLoginPassword",pw)
    await page.click("#loginBtn")
    await page.wait_for_selector("#auth", state="hidden", timeout=30000)

async def kick_from_admin(page,target):
    await page.evaluate("showPage('memberAdmin')")
    await page.wait_for_selector("#memberAdmin.active", timeout=30000)
    row=page.locator("#memberList .memberrow").filter(has_text=target)
    await row.locator("button.plainArrow").click()
    await page.wait_for_selector("#memberDetail.active", timeout=30000)
    btn=page.get_by_role("button", name="회원 내보내기")
    dialog_task=asyncio.create_task(page.wait_for_event("dialog", timeout=10000))
    await btn.click()
    dialog=await dialog_task
    assert target in dialog.message
    await dialog.accept()
    await page.wait_for_function("document.querySelector('#toast')?.textContent?.includes('회원 내보내기가 완료됐습니다.')", timeout=30000)
    print("ADMIN_KICK_UI_OK",target,flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        try:
            admin_ctx=await browser.new_context()
            admin_page=await admin_ctx.new_page()
            await login(admin_page,ADMIN,ADMIN_PW)
            print("ADMIN_LOGIN_OK",flush=True)

            # Scenario 1: target app is not running when removed.
            await kick_from_admin(admin_page,USER)

            closed_ctx=await browser.new_context()
            closed_page=await closed_ctx.new_page()
            await closed_page.goto(BASE,wait_until="domcontentloaded",timeout=60000)
            await closed_page.wait_for_selector("#auth.open",timeout=30000)
            await closed_page.click("#loginTabBtn")
            await closed_page.fill("#authLoginNickname",USER)
            await closed_page.fill("#authLoginPassword",USER_OLD_PW)
            dialog_task=asyncio.create_task(closed_page.wait_for_event("dialog", timeout=10000))
            await closed_page.click("#loginBtn")
            dialog=await dialog_task
            assert dialog.message=="사용이 정지된 계정입니다. 관리자에게 문의해주세요.",dialog.message
            await dialog.accept()
            assert await closed_page.locator("#auth").evaluate("(e)=>e.classList.contains('open')")
            assert await closed_page.locator("#loginForm").is_visible()
            print("CLOSED_APP_BLOCKED_POPUP_OK",flush=True)

            # Rejoin request for setup of the second scenario.
            await closed_page.click("#signupTabBtn")
            await closed_page.fill("#authNickname",USER)
            await closed_page.fill("#authSignupPassword",USER_NEW_PW)
            async with closed_page.expect_response(lambda r:"/functions/v1/rejoin-register" in r.url,timeout=30000) as ri:
                await closed_page.click("#signupBtn")
            resp=await ri.value
            body=await resp.text()
            assert resp.status==201,(resp.status,body)
            print("REJOIN_REQUEST_UI_OK",flush=True)

            await closed_ctx.close()
            await admin_ctx.close()
        finally:
            await browser.close()

asyncio.run(main())
