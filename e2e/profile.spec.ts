import { test, expect, loginAs } from './fixtures'

test('athlete can view and edit their own profile bio', async ({ page, athlete }) => {
  await loginAs(page, athlete)

  await page.locator('header button').last().click()
  await page.getByRole('menuitem', { name: 'My Profile' }).click()
  await expect(page).toHaveURL(new RegExp(`/app/profile/`))
  await expect(page.getByText(athlete.displayName)).toBeVisible()

  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByPlaceholder('Tell people a bit about your training...').fill('Training for a marathon.')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.getByText('Bio updated')).toBeVisible()
  await expect(page.getByText('Training for a marathon.')).toBeVisible()
})
