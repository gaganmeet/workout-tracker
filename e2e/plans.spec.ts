import { test, expect, loginAs } from './fixtures'

test('athlete can create a plan and see it in their plan list', async ({ page, athlete }) => {
  const planName = `E2E Plan ${Date.now()}`

  await loginAs(page, athlete)
  await page.goto('/app/plans')
  await expect(page.getByText('No plans yet.')).toBeVisible()

  await page.getByRole('link', { name: 'New plan' }).click()
  await expect(page).toHaveURL('/app/plans/new')

  await page.getByLabel('Plan name').fill(planName)
  await page.getByRole('button', { name: 'Save plan' }).click()

  await expect(page.getByText('Plan saved', { exact: true })).toBeVisible()

  await page.goto('/app/plans')
  await expect(page.getByText(planName)).toBeVisible()
})
