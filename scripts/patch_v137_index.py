import subprocess, sys, asyncio

subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "playwright==1.55.0"])
subprocess.check_call([sys.executable, "-m", "playwright", "install", "--with-deps", "chromium"])

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

BASE="https://team-eysl-7vrd.vercel.app"
ADMIN="__E2E_UI_ADMIN_260922_1909"
USER="__E2E_UI_CLOSED_260922_1909"
ADMIN_PW=ADMIN+"!Aa1"
USER_PW=USER+"!Bb2"

async def login(page,nick,pw):
    await page.goto(BASE, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_selector("#auth.open", timeout=30000)
    await page.click("#loginTabBtn")
    await page.fill("#authLoginNickname",nick)
    await page.fill("#authLoginPassword",pw)
    await page.click("#loginBtn")
    await page.wait_for_selector("#auth", state="hidden", timeout=30000)

async def kick_from_admin(page,target):
    await page.wait_for_function("(target)=>typeof members!=='undefined' && members.some(m=>m.name===target)", arg=target, timeout=30000)
    member_id=await page.evaluate("(target)=>members.find(m=>m.name===target)?.id||null",target)
    assert member_id, "target member id not found"
    confirm_task=asyncio.create_task(page.wait_for_event("dialog", timeout=10000))
    call_task=asyncio.create_task(page.evaluate("(id)=>kickMember(id)",member_id))
    confirm=await confirm_task
    assert target in confirm.message
    await confirm.accept()
    await call_task
    await page.wait_for_function("document.querySelector('#toast')?.textContent?.includes('회원 내보내기가 완료됐습니다.')", timeout=30000)
    print("ADMIN_KICK_FUNCTION_UI_OK",target,flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        try:
            user_ctx=await browser.new_context()
            user_page=await user_ctx.new_page()
            await login(user_page,USER,USER_PW)
            await user_page.wait_for_function("()=>!!currentUser?.memberId",timeout=30000)
            print("OPEN_APP_USER_LOGIN_OK",flush=True)

            admin_ctx=await browser.new_context()
            admin_page=await admin_ctx.new_page()
            await login(admin_page,ADMIN,ADMIN_PW)
            print("ADMIN_LOGIN_OK",flush=True)

            expired_task=asyncio.create_task(user_page.wait_for_event("dialog",timeout=20000))
            await kick_from_admin(admin_page,USER)
            await user_page.bring_to_front()

            expired=await expired_task
            assert expired.message=="세션이 만료됐습니다. 다시 로그인해주세요.",expired.message
            await expired.accept()
            await user_page.wait_for_selector("#auth.open",timeout=10000)
            assert await user_page.locator("#loginForm").is_visible()
            print("OPEN_APP_SESSION_EXPIRED_POPUP_OK",flush=True)

            await user_page.fill("#authLoginNickname",USER)
            await user_page.fill("#authLoginPassword",USER_PW)
            blocked_task=asyncio.create_task(user_page.wait_for_event("dialog",timeout=10000))
            await user_page.click("#loginBtn")
            blocked=await blocked_task
            assert blocked.message=="사용이 정지된 계정입니다. 관리자에게 문의해주세요.",blocked.message
            await blocked.accept()
            assert await user_page.locator("#auth").evaluate("(e)=>e.classList.contains('open')")
            assert await user_page.locator("#loginForm").is_visible()
            print("OPEN_APP_REPEAT_BLOCKED_POPUP_OK",flush=True)

            await admin_ctx.close()
            await user_ctx.close()
        finally:
            await browser.close()

asyncio.run(main())
