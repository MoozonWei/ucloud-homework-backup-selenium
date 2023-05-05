#!/usr/bin/env node
import { Builder } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import 'chromedriver'
import {
  confirm,
  input,
  password,
} from '@inquirer/prompts'
import auth from '../src/components/auth.js'
import ucloud from '../src/components/ucloud.js'
import moveFiles from '../src/components/moveFiles.js'

const USERNAME = await input({
  message: '请输入学号:',
})
if (!USERNAME) {
  console.error('学号不能为空')
  process.exit()
}
const PASSWORD = await password({
  message: '请输入密码:',
})
if (!PASSWORD) {
  console.error('密码不能为空')
  process.exit()
}
const curPath = process.cwd()
const DOWNLOAD_PATH = await input({
  message: '请输下载路径:',
  default: curPath,
})
if (!PASSWORD) {
  console.error('密码不能为空')
  process.exit()
}

process.env.USERNAME = USERNAME
process.env.PASSWORD = PASSWORD
process.env.DOWNLOAD_PATH = DOWNLOAD_PATH

const opts = new Options()
  .setUserPreferences({
    'download.default_directory': process.env.DOWNLOAD_PATH,
  })

// .addArguments(`user-agent=${USER_AGENT}`)
// .addArguments('--window-size=1920,1050')
// .headless()

const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(opts)
  .build()

try {
  // driver.manage().window().maximize()
  await auth(driver)
  await ucloud(driver)
  moveFiles()
}
catch (e) {
  console.error(e)
}
finally {
  const ans = await confirm({
    message: '是否关闭浏览器?',
    default: false,
  })
  if (ans)
    await driver.quit()
}
