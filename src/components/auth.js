import {
  fillInput,
  fluentlyGetEl,
} from '../utils/index.js'
import { AUTH_URL } from '../constant/index.js'

export default async function auth(driver) {
  await driver.get(AUTH_URL)

  await driver.switchTo().frame('loginIframe')

  const [
    contentTitleEl,
    loginBtnEl,
  ] = await Promise.all([
    fluentlyGetEl(driver, '#content-title'),
    fluentlyGetEl(driver, 'input[i18n="login.form.btn.login"]'),
  ])
  await contentTitleEl.click()

  await Promise.all([
    fillInput(driver, '#username', process.env.USERNAME),
    fillInput(driver, '#password', process.env.PASSWORD),
  ])

  await loginBtnEl.click()
}
