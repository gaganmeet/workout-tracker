import { test, expect, loginAs } from './fixtures'

test('athlete can pick an exercise on the progress page', async ({ page, athlete }) => {
  await loginAs(page, athlete)
  await page.goto('/app/progress')

  await page.getByRole('button', { name: 'Choose an exercise' }).click()
  await page.getByPlaceholder('Search exercises...').fill('Barbell Bench Press')
  await page.getByText('Barbell Bench Press', { exact: true }).click()

  await expect(page.getByText('Log completed sets for this exercise to see progress here.')).toBeVisible()
  await expect(page.getByText('Log completed sets for this exercise to see volume here.')).toBeVisible()
})
