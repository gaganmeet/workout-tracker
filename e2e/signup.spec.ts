import { test, expect } from './fixtures'

test.describe('signup validation', () => {
  test('too-short password is rejected without hitting the network', async ({ page }) => {
    let signupCalled = false
    await page.route(/\/auth\/v1\/signup/, (route) => {
      signupCalled = true
      return route.continue()
    })

    await page.goto('/signup')
    await page.getByLabel('Display name').fill('Short Password User')
    await page.getByLabel('Username').fill('short_pw_user')
    await page.getByLabel('Email').fill('short-pw-user@example.com')
    await page.getByLabel('Password').fill('short')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('At least 8 characters')).toBeVisible()
    expect(signupCalled).toBe(false)
    await expect(page).toHaveURL('/signup')
  })
})

test.describe('signup happy path (network mocked to avoid real email sends)', () => {
  test('valid signup shows the confirmation prompt and redirects to /login', async ({ page }) => {
    await page.route(/\/auth\/v1\/signup/, (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'e2e-mock-user-id',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'e2e-signup-mock@example.com',
          email_confirmed_at: null,
          confirmed_at: null,
          last_sign_in_at: null,
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { username: 'e2e_signup_mock', display_name: 'E2E Signup Mock', role: 'athlete' },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })
    })

    await page.goto('/signup')
    await page.getByLabel('Display name').fill('E2E Signup Mock')
    await page.getByLabel('Username').fill('e2e_signup_mock')
    await page.getByLabel('Email').fill('e2e-signup-mock@example.com')
    await page.getByLabel('Password').fill('TestPass123!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Check your email to confirm your account before signing in.')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
