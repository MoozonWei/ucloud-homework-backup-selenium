import { readdirSync, renameSync } from 'node:fs'
import inquirer from 'inquirer'
import {
  askUserToSelectFromAList,
  delay,
  fluentlyClick,
  fluentlyGetEl,
  getCountOfElWithCertainText,
  getElArrWithCertainText,
  getElWithCertainText,
  getTextOfEl,
  switchToNewWindow,
} from '../utils/index.js'
import { UCLOUD_URL } from '../constant/index.js'

export default async function ucloud(driver) {
  await driver.get(UCLOUD_URL)

  const originalWindow = driver.getWindowHandle()
  await fluentlyClick(driver, '.right-pt')
  switchToNewWindow(driver, originalWindow)

  // 点击侧边栏“我的课堂”
  try {
    await fluentlyClick(driver, '.by-icon-course')
  }
  catch (e) {
    await fluentlyClick(driver, '.by-icon-course-active')
  }

  // 让用户从课程列表中选择目标课程
  process.env.COURSE_DIR_NAME = await askUserToSelectFromAList(driver, {
    selectorStr: '.course-title',
    promptMessage: '选择课程:',
  })

  // 点击“作业”
  await fluentlyClick(driver, '.nav-bottom>.nav-item:nth-child(2)')

  // 让用户从作业列表中选择目标作业
  process.env.HOMEWORK_DIR_NAME = await askUserToSelectFromAList(driver, {
    selectorStr: 'tr.el-table__row>td:first-child:not(.is-hidden)',
    promptMessage: '选择作业:',
  })

  await fluentlyClick(driver, '#tab-second') // 点击“全部作业”

  const totalPageCount = Number(await (await fluentlyGetEl(driver, '.el-pager>li:last-child')).getText())
  let { pageNum } = await inquirer.prompt([{
    type: 'number',
    name: 'pageNum',
    message: `请选择从第几页开始[1-${totalPageCount}]:`,
    default: 1,
    validate: (input) => {
      return input >= 1 && input <= totalPageCount
    },
  }])

  while (true) {
    await navigateToPage(driver, pageNum) // 找到当前页码的按钮，并点击
    await delay() // 设置延迟，不然有可能拿不到“批改”按钮
    // 获取当前页面有多少个“批改”按钮
    const pgCount = await getCountOfElWithCertainText(
      driver,
      'tbody>tr>td:last-child>.cell>button',
      '批改',
    )
    // 如果“批改”按钮的个数为0，则退出无限循环
    if (pgCount === 0)
      break

    for (let i = 0; i < pgCount; i++) {
      await navigateToPage(driver, pageNum) // 找到当前页码的按钮，并点击
      await delay() // 设置延迟，不然有可能拿不到“批改”按钮
      // 获取当前页面下“批改”按钮元素列表
      const pgBtnElArr = await getElArrWithCertainText(
        driver,
        'tbody>tr>td:last-child>.cell>button',
        '批改',
      )
      await pgBtnElArr[i].click() // 点击第i个“批改”按钮
      await downloadAndRenameFile(driver)
      await driver.navigate().back() // 回退页面
      await fluentlyClick(driver, '#tab-second') // 点击‘全部作业’
    }

    if (pageNum === totalPageCount)
      break
    pageNum++
  }
}

async function downloadAndRenameFile(driver) {
  const { DOWNLOAD_PATH } = process.env
  await delay() // 设置延迟，不然有可能拿不到“打包下载”按钮
  const studentName = await getStudentName(driver)
  await fluentlyClick(driver, '.attachment-wrap>.label-box>button>span') // 点击“打包下载”按钮
  // await delay(DOWNLOAD_WAITING_TIME) // 等待下载完成
  let breakFlag = false
  setTimeout(() => {
    breakFlag = true
  }, 10000)
  while (true) {
    const files = readdirSync(DOWNLOAD_PATH)
    files.forEach((file) => {
      if (file.startsWith('20') && file.endsWith('.zip'))
        breakFlag = true
    })
    if (breakFlag)
      break
  }
  await delay()
  const files = readdirSync(DOWNLOAD_PATH)
  files.forEach((file) => {
    if (file.startsWith('20') && file.endsWith('.zip')) {
      const oldName = `${DOWNLOAD_PATH}/${file}`
      const newName = `${DOWNLOAD_PATH}/${studentName}.zip`
      renameSync(oldName, newName)
      // console.log(`文件 ${oldName} 重命名为 ${newName} 成功！`)
    }
  })
}

async function getStudentName(driver) {
  const text = await getTextOfEl(driver, '.middle>.left-wrap button:first-child>span')
  const matchResult = text.match(/正在批阅：([\u4E00-\u9FA5]+)/)

  if (matchResult)
    return matchResult[1]

  return text
}

async function navigateToPage(driver, pageNum) {
  while (true) {
    const pageNumBtnEl = await getElWithCertainText(driver, '.el-pager>li.number', pageNum.toString())
    if (!pageNumBtnEl) {
      await fluentlyClick(driver, '.el-pager>li.more:nth-last-child(2)')
    }
    else {
      await pageNumBtnEl.click()
      break
    }
  }
}
