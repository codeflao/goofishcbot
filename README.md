闲鱼智能管理系统 - Windows 版本
========================================

【系统要求】
- Windows 10 或更高版本
- 需要安装 Chrome 或 Edge 浏览器（大多数电脑已自带）

【使用说明】

1. 配置授权码
   - 将 license.key.example 重命名为 license.key
   - 用记事本打开，将内容替换为您的授权码并保存

2. 启动程序（三选一）
   
   方式一：控制台模式（推荐调试时使用）
   - 双击 start.bat
   - 可以实时看到运行日志
   - 关闭窗口即停止程序
   
   方式二：后台模式（推荐日常使用）
   - 双击 start-background.vbs
   - 程序完全在后台运行，无黑窗口
   - 可以关闭所有窗口，程序继续运行

   方式三：PM2 守护（一键启动，崩溃自动重启、统一日志，适合长期运行）
   - 双击 start-pm2.bat 启动，双击 stop-pm2.bat 停止（包内已含 PM2，无需安装）
   - 日志：pm2 logs goofishcbot

3. 访问系统
   - 打开浏览器访问 http://localhost:3000

4. 停止程序
   - 控制台模式：直接关闭命令窗口，或按 Ctrl+C
   - 后台模式：双击 stop.bat
   - PM2 模式：双击 stop-pm2.bat

5. 查看运行状态
   - 双击 check-status.bat

【文件说明】
├── node/                    Node.js 运行时（请勿删除）
├── app/                     程序代码（请勿删除）
├── node_modules/            运行时依赖（请勿删除）
├── license.key              授权码文件（需要您创建）
├── public/                  前端资源（请勿删除）
├── logs/                    日志目录（自动创建）
├── data/                    数据目录（自动创建）
├── start.bat                控制台模式启动
├── start-background.vbs     后台模式启动（推荐）
├── start-pm2.bat            PM2 一键启动（包内已含 PM2）
├── stop.bat                 停止程序
├── stop-pm2.bat             PM2 模式停止
├── ecosystem.config.cjs     PM2 配置
└── check-status.bat         查看运行状态

【注意事项】
- 请确保所有文件夹结构完整，不要删除任何系统文件
- 首次运行需要联网进行授权验证
- 授权验证通过后可离线使用 7 天
- 如果使用密码登录功能，需要电脑安装 Chrome 或 Edge

【常见问题】

Q: 提示"授权验证失败"？
A: 检查 license.key 文件是否存在且授权码正确，确保网络连接正常

Q: 浏览器相关功能不可用？
A: 请确保电脑已安装 Chrome 或 Microsoft Edge 浏览器

Q: 程序闪退？
A: 使用"控制台模式"启动查看具体错误信息

如有问题，请联系管理员。
