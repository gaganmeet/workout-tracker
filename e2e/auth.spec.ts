import { test, expect, loginAs } from './fixtures'

test.describe('auth guards', () => {
  test('unauthenticated user hitting a protected route is sent to /login', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('signed-in athlete visiting /login is redirected to their dashboard', async ({ page, athlete }) => {
    await loginAs(page, athlete)
    await page.goto('/login')
    await expect(page).toHaveURL('/app/dashboard')
  })

  test('signed-in athlete visiting /signup is redirected to their dashboard', async ({ page, athlete }) => {
    await loginAs(page, athlete)
    await page.goto('/signup')
    await expect(page).toHaveURL('/app/dashboard')
  })

  test('signed-in coach visiting /login is redirected to the coach dashboard', async ({ page, coach }) => {
    await loginAs(page, coach)
    await page.goto('/login')
    await expect(page).toHaveURL('/coach/dashboard')
  })
})

test.describe('sign in / sign out', () => {
  test('athlete can sign in and see their dashboard', async ({ page, athlete }) => {
    await loginAs(page, athlete)
    await expect(page.getByText(`Welcome back, ${athlete.displayName}`)).toBeVisible()
  })

  test('coach can sign in and see the coach dashboard', async ({ page, coach }) => {
    await loginAs(page, coach)
    await expect(page).toHaveURL('/coach/dashboard')
  })

  test('wrong password shows an error and does not navigate', async ({ page, athlete }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(athlete.email)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/invalid/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('sign out returns to /login and re-guards protected routes', async ({ page, athlete }) => {
    await loginAs(page, athlete)
    await page.locator('header button').last().click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL('/login')

    await page.goto('/app/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
