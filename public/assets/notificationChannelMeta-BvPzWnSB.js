import{t as e}from"./createLucideIcon-K66lMC0A.js";import{t}from"./mail-gRJf3R69.js";import{t as n}from"./send-BGnC-0sY.js";import{F as r,P as i,U as a}from"./index-S8lMZcGI.js";var o=e(`link`,[[`path`,{d:`M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71`,key:`1cjeqo`}],[`path`,{d:`M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71`,key:`19qd67`}]]),s=e(`phone`,[[`path`,{d:`M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384`,key:`9njp5v`}]]),c=[{type:`dingtalk`,name:`钉钉通知`,icon:a,description:`钉钉机器人消息`},{type:`feishu`,name:`飞书通知`,icon:i,description:`飞书机器人消息`},{type:`bark`,name:`Bark通知`,icon:s,description:`iOS推送通知`},{type:`email`,name:`邮件通知`,icon:t,description:`SMTP邮件发送`},{type:`webhook`,name:`Webhook`,icon:o,description:`自定义HTTP请求`},{type:`wechat`,name:`微信通知`,icon:r,description:`企业微信机器人`},{type:`telegram`,name:`Telegram`,icon:n,description:`Telegram机器人`}];function l(e){switch(e){case`dingtalk`:case`feishu`:case`wechat`:return{webhook:``};case`bark`:return{deviceKey:``,serverUrl:`https://api.day.app`};case`email`:return{smtpHost:``,smtpPort:465,smtpUser:``,smtpPassword:``,smtpSecure:!0,fromEmail:``,toEmail:``};case`webhook`:return{url:``,method:`POST`,headers:{},bodyTemplate:`{"title":"{{title}}","content":"{{content}}"}`};case`telegram`:return{botToken:``,chatId:``};default:return{}}}var u={dingtalk:`示例（驼峰格式）：
{
  "webhook": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
}

或（下划线格式）：
{
  "webhook_url": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
}`,feishu:`示例（驼峰格式）：
{
  "webhook": "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_TOKEN"
}

或（下划线格式）：
{
  "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_TOKEN"
}`,wechat:`示例（驼峰格式）：
{
  "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"
}

或（下划线格式）：
{
  "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"
}`,bark:`基础配置（必需）：
{
  "deviceKey": "YOUR_DEVICE_KEY",
  "serverUrl": "https://api.day.app"
}

完整配置（包含扩展参数）：
{
  "deviceKey": "YOUR_DEVICE_KEY",
  "serverUrl": "https://api.day.app",
  "title": "制造者",
  "group": "制造者",
  "sound": "alarm",
  "icon": "https://day.app/assets/images/avatar.jpg",
  "badge": 1,
  "level": "active",
  "barkUrl": "https://example.com",
  "copy": "自动复制的内容",
  "automaticallyCopy": "1",
  "isArchive": "1"
}

支持的扩展参数：
- title: 通知标题（覆盖默认标题）
- group: 通知分组标识
- sound: 提示音（如：alarm, bell等）
- icon: 图标URL（iOS 15+）
- badge: 角标数字
- level: 优先级（active/timeSensitive/passive）
- barkUrl: 点击打开的链接
- copy: 自动复制的内容
- automaticallyCopy: 是否自动复制（"1"或true）
- isArchive: 是否归档（"1"或true）`,email:`示例：
{
  "smtpHost": "smtp.example.com",
  "smtpPort": 465,
  "smtpUser": "your_email@example.com",
  "smtpPassword": "your_password",
  "smtpSecure": true,
  "fromEmail": "your_email@example.com",
  "toEmail": "recipient@example.com"
}`,webhook:`示例（驼峰格式）：
{
  "url": "https://your-webhook-url.com/api",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "bodyTemplate": "{\\"title\\":\\"{{title}}\\",\\"content\\":\\"{{content}}\\"}"
}

或（下划线格式）：
{
  "webhook_url": "https://your-webhook-url.com/api",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body_template": "{\\"title\\":\\"{{title}}\\",\\"content\\":\\"{{content}}\\"}"
}`,telegram:`示例（驼峰格式）：
{
  "botToken": "YOUR_BOT_TOKEN",
  "chatId": "YOUR_CHAT_ID"
}

或（下划线格式）：
{
  "bot_token": "YOUR_BOT_TOKEN",
  "chat_id": "YOUR_CHAT_ID"
}`},d={dingtalk:`{
  "webhook": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
}`,feishu:`{
  "webhook": "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_TOKEN"
}`,wechat:`{
  "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"
}`,bark:`{
  "deviceKey": "YOUR_DEVICE_KEY",
  "serverUrl": "https://api.day.app",
  "title": "制造者",
  "group": "制造者",
  "sound": "alarm",
  "icon": "https://day.app/assets/images/avatar.jpg",
  "barkUrl": "https://example.com"
}`,email:`{
  "smtpHost": "smtp.example.com",
  "smtpPort": 465,
  "smtpUser": "your_email@example.com",
  "smtpPassword": "your_password",
  "smtpSecure": true,
  "fromEmail": "your_email@example.com",
  "toEmail": "recipient@example.com"
}`,webhook:`{
  "url": "https://your-webhook-url.com/api",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "bodyTemplate": "{\\"title\\":\\"{{title}}\\",\\"content\\":\\"{{content}}\\"}"
}`,telegram:`{
  "botToken": "YOUR_BOT_TOKEN",
  "chatId": "YOUR_CHAT_ID"
}`};function f(e){return e?u[e]||`请填写配置信息`:``}function p(e){return e&&d[e]||`{
  "webhook": "https://..."
}`}function m(e){return c.find(t=>t.type===e)?.name||e}function h(e){return c.find(t=>t.type===e)?.icon??a}export{p as a,f as i,h as n,l as o,m as r,c as t};