import { By, until } from 'selenium-webdriver'
import inquirer from 'inquirer'
import { DEFAULT_DELAY_TIME } from '../constant/index.js'

export function delay(time = DEFAULT_DELAY_TIME) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export async function fluentlyGetEl(driver, selectorStr) {
  let el
  try {
    el = await driver.wait(
      until.elementLocated(By.css(selectorStr)),
      2000,
      `Time out after 10s, selector: ${selectorStr}`,
      200,
    )
  }
  catch (e) {
    el = undefined
  }
  return el
}

export async function fluentlyGetElArr(driver, selectorStr) {
  let elArr
  try {
    elArr = await driver.wait(
      until.elementsLocated(By.css(selectorStr)),
      2000,
      `Time out after 10s, selector: ${selectorStr}`,
      200,
    )
  }
  catch (e) {
    elArr = []
  }
  return elArr
}

export async function fluentlyClick(driver, selectorStr) {
  await (await fluentlyGetEl(driver, selectorStr)).click()
}

export async function fillInput(driver, selectorStr, inputStr) {
  const el = driver.findElement(By.css(selectorStr))
  await el.click()
  await el.sendKeys(inputStr)
}

export async function askUserToSelectFromAList(driver, {
  selectorStr,
  promptMessage,
}) {
  const titleElArr = await fluentlyGetElArr(driver, selectorStr)
  const titleArr = await Promise.all(titleElArr.map(el => el.getText()))
  const ans = await inquirer.prompt([{
    type: 'list',
    name: 'dflt',
    message: promptMessage,
    choices: titleArr.map((title, index) => {
      return {
        name: title,
        value: index,
      }
    }),
  }])
  await titleElArr[ans.dflt].click()
  return titleArr[ans.dflt]
}

export async function switchToNewWindow(driver, originalWindow) {
  await driver.wait(
    async () => (await driver.getAllWindowHandles()).length === 2,
    10000,
    'Time out after 10s',
    1000,
  )

  const windows = await driver.getAllWindowHandles()
  windows.forEach(async (handle) => {
    if (handle !== originalWindow)
      await driver.switchTo().window(handle)
  })
}

export async function getCountOfElWithCertainText(driver, selectorStr, targetText) {
  const operationBtnElArr = await fluentlyGetElArr(driver, selectorStr)
  let count = 0
  for (let i = 0; i < operationBtnElArr.length; i++) {
    if ((await operationBtnElArr[i].getText()) === targetText)
      count++
  }
  return count
}

export async function getElArrWithCertainText(driver, selectorStr, targetText) {
  const tmpArr = await fluentlyGetElArr(driver, selectorStr)
  const elArr = []
  for (let i = 0; i < tmpArr.length; i++) {
    const el = tmpArr[i]
    if ((await el.getText()) === targetText)
      elArr.push(el)
  }
  return elArr
}

export async function getElWithCertainText(driver, selectorStr, targetText) {
  const tmpArr = await fluentlyGetElArr(driver, selectorStr)
  for (let i = 0; i < tmpArr.length; i++) {
    const el = tmpArr[i]
    if ((await el.getText()) === targetText)
      return el
  }
  return undefined
}

export async function getTextOfEl(driver, selector) {
  const el = await fluentlyGetEl(driver, selector)
  const text = await el.getText()
  return text
}
