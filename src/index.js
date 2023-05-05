import { Builder } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome.js'
import 'chromedriver'
import { confirm } from '@inquirer/prompts'
import dotenv from 'dotenv'
import auth from './components/auth.js'
import ucloud from './components/ucloud.js'
import moveFiles from './components/moveFiles.js'

dotenv.config()

if (
  !(process.env.USERNAME
  && process.env.PASSWORD
  && process.env.DOWNLOAD_PATH)
)
  throw new Error('请正确配置.env文件')

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
