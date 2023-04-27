# ucloud-homework-backup-selenium

备份 ucloud 上的学生作业。

## 准备工作

在项目最上层录下创建 `.env` 文件，文件中需要包含以下字段：

```shell
USERNAME = '202XXXXXX'
PASSWORD = 'XXXXXXXXX'
DOWNLOAD_PATH = '/Users/xxxxx/Downloads/ucloud'
```

分别表示学号、密码、下载路径。

## 运行

```shell
npm run prod # 生产环境
npm run dev # 开发环境
```

## 调整

用户可以根据实际情况对 `src/constant/index.js` 中的参数进行调整，自行把握容错率和运行速度。

```js
export const DEFAULT_DELAY_TIME = 500
export const DOWNLOAD_WAITING_TIME = 2000
```
