import { test, expect, loginAs } from './fixtures'

test('athlete can log an ad-hoc workout end to end', async ({ page, athlete }) => {
  await loginAs(page, athlete)

  await page.getByRole('link', { name: 'Start workout' }).click()
  await expect(page).toHaveURL('/app/workout/start')
  await page.getByRole('button', { name: 'Start ad-hoc workout' }).click()
  await expect(page).toHaveURL(/\/app\/workout\/active\//)

  await page.getByRole('button', { name: 'Add exercise' }).click()
  await page.getByPlaceholder('Search exercises...').fill('Barbell Bench Press')
  await page.getByText('Barbell Bench Press', { exact: true }).click()

  await page.getByPlaceholder('kg').fill('60')
  await page.getByPlaceholder('reps').fill('10')
  await page.getByPlaceholder('reps').blur()
  await page.getByRole('button', { name: 'Mark set complete' }).click()

  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page).toHaveURL(/\/app\/history\//)
  await expect(page.getByText('Barbell Bench Press')).toBeVisible()
  await expect(page.getByText('60 kg')).toBeVisible()

  await page.goto('/app/history')
  await expect(page.getByText('In progress')).not.toBeVisible()
})
