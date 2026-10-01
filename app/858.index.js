export const id = 858;
export const ids = [858];
export const modules = {

/***/ 858:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   detectImageCaptcha: () => (/* binding */ detectImageCaptcha),
/* harmony export */   getImageCaptchaConfig: () => (/* binding */ getImageCaptchaConfig),
/* harmony export */   handleImageCaptcha: () => (/* binding */ handleImageCaptcha)
/* harmony export */ });
/* harmony import */ var _core_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(792);
/* harmony import */ var _db_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(460);
/* harmony import */ var _notification_service_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7775);
/* harmony import */ var _core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1988);




const logger = (0,_core_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .createLogger */ .h)("ImageCaptcha");
const IMAGE_CAPTCHA_MODE_KEY = "image_captcha_mode";
const IMAGE_CAPTCHA_THIRD_PARTY_PROVIDER_KEY = "image_captcha_third_party_provider";
const IMAGE_CAPTCHA_THIRD_PARTY_API_KEY_KEY = "image_captcha_third_party_api_key";
const IMAGE_CAPTCHA_MANUAL_VERIFY_BASE_URL_KEY = "image_captcha_manual_verify_base_url";
function getImageCaptchaConfig(systemUserId) {
  const mode = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getSystemSetting)(IMAGE_CAPTCHA_MODE_KEY, systemUserId) || "ocr";
  const thirdPartyProvider = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getSystemSetting)(IMAGE_CAPTCHA_THIRD_PARTY_PROVIDER_KEY, systemUserId) || "2captcha";
  const thirdPartyApiKey = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getSystemSetting)(IMAGE_CAPTCHA_THIRD_PARTY_API_KEY_KEY, systemUserId) || "";
  const manualVerifyBaseUrl = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getSystemSetting)(IMAGE_CAPTCHA_MANUAL_VERIFY_BASE_URL_KEY, systemUserId) || "";
  return { mode, thirdPartyProvider, thirdPartyApiKey, manualVerifyBaseUrl };
}
async function detectImageCaptcha(page) {
  try {
    await page.waitForTimeout(1e3);
    const strongKeywords = [
      "\u9009\u62E9\u7B26\u5408\u6761\u4EF6\u7684\u56FE\u7247",
      "\u9009\u62E9\u6240\u6709\u5305\u542B",
      "\u70B9\u51FB\u5305\u542B",
      "\u56FE\u7247\u9A8C\u8BC1",
      "\u8BF7\u9009\u62E9\u6B63\u786E\u7684\u56FE\u7247",
      "\u8BF7\u4F9D\u6B21\u70B9\u51FB"
    ];
    const weakKeywords = [
      "image.*captcha",
      "select.*image",
      "click.*picture"
    ];
    const checkText = (text) => {
      if (strongKeywords.some((kw) => text.includes(kw)))
        return "strong";
      if (weakKeywords.some((kw) => new RegExp(kw, "i").test(text)))
        return "weak";
      return false;
    };
    const bodyText = await page.evaluate(() => {
      return document.body?.innerText || document.body?.textContent || "";
    }).catch(() => "");
    const mainTextMatch = checkText(bodyText);
    if (mainTextMatch === "strong") {
      logger.info("\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\u5F3A\u5173\u952E\u8BCD");
      return true;
    }
    const hasImageCaptchaDom = await page.evaluate(() => {
      const MIN_IMGS = 6;
      const MAX_IMGS = 12;
      const captchaContainerSelectors = [
        '[class*="captcha"]',
        '[id*="captcha"]',
        "[data-captcha]",
        ".image-select",
        ".picture-select"
      ];
      for (const selector of captchaContainerSelectors) {
        const containers = document.querySelectorAll(selector);
        for (const container of Array.from(containers)) {
          const imgs = container.querySelectorAll("img");
          if (imgs.length >= MIN_IMGS && imgs.length <= MAX_IMGS)
            return true;
          const parent = container.parentElement;
          if (parent) {
            const parentImgs = parent.querySelectorAll("img");
            if (parentImgs.length >= MIN_IMGS && parentImgs.length <= MAX_IMGS)
              return true;
          }
        }
      }
      const verifyContainers = document.querySelectorAll('[class*="verify"], [id*="verify"]');
      for (const vc of Array.from(verifyContainers)) {
        const imgs = vc.querySelectorAll("img");
        if (imgs.length >= MIN_IMGS && imgs.length <= MAX_IMGS) {
          const sizes = Array.from(imgs).map((img) => ({
            w: img.naturalWidth || img.width,
            h: img.naturalHeight || img.height
          }));
          const first = sizes[0];
          if (first && first.w > 0) {
            const similar = sizes.filter((s) => Math.abs(s.w - first.w) < 20 && Math.abs(s.h - first.h) < 20);
            if (similar.length >= MIN_IMGS && similar.length <= MAX_IMGS)
              return true;
          }
        }
      }
      return false;
    }).catch(() => false);
    if (hasImageCaptchaDom) {
      logger.info("\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801 DOM \u7ED3\u6784");
      return true;
    }
    if (mainTextMatch === "weak") {
      const hasCaptchaElement = await page.evaluate(() => {
        return document.querySelector('[class*="captcha"], [id*="captcha"], [data-captcha]') !== null;
      }).catch(() => false);
      if (hasCaptchaElement) {
        logger.info("\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\uFF08\u5F31\u5173\u952E\u8BCD + captcha DOM \u5143\u7D20\uFF09");
        return true;
      }
    }
    const frames = page.frames();
    for (const frame of frames) {
      try {
        const frameText = await frame.evaluate(() => {
          return document.body?.innerText || document.body?.textContent || "";
        }).catch(() => "");
        const frameMatch = checkText(frameText);
        if (frameMatch === "strong") {
          logger.info("\u5728 frame \u4E2D\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\u5F3A\u5173\u952E\u8BCD");
          return true;
        }
        if (frameMatch === "weak") {
          const frameCaptchaDom = await frame.evaluate(() => {
            const el = document.querySelector('[class*="captcha"], [id*="captcha"], [data-captcha]');
            return el !== null;
          }).catch(() => false);
          if (frameCaptchaDom) {
            logger.info("\u5728 frame \u4E2D\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\uFF08\u5F31\u5173\u952E\u8BCD + captcha DOM\uFF09");
            return true;
          }
        }
      } catch {
      }
    }
    return false;
  } catch (e) {
    logger.warn(`\u68C0\u6D4B\u56FE\u7247\u9A8C\u8BC1\u7801\u65F6\u51FA\u9519: ${e?.message || e}`);
    return false;
  }
}
async function extractImageCaptchaData(page) {
  try {
    const frames = page.frames();
    let targetFrame = page;
    for (const frame of frames) {
      try {
        const hasCaptcha = await frame.evaluate(() => {
          const text = document.body?.innerText || document.body?.textContent || "";
          return text.includes("\u9009\u62E9") || text.includes("\u70B9\u51FB") || text.includes("\u56FE\u7247");
        }).catch(() => false);
        if (hasCaptcha) {
          targetFrame = frame;
          break;
        }
      } catch {
      }
    }
    const data = await targetFrame.evaluate(() => {
      const text = document.body?.innerText || document.body?.textContent || "";
      const promptMatch = text.match(/选择[^，。]*?的图片|请[点击选择][^，。]*?的图片|选择所有包含[^，。]*?的图片/i);
      const prompt = promptMatch ? promptMatch[0] : text.substring(0, 100);
      const images = [];
      const imgElements = document.querySelectorAll("img");
      imgElements.forEach((img, index) => {
        const src = img.src || img.getAttribute("src") || "";
        if (src && !src.includes("data:image/svg")) {
          images.push({ src, index });
        }
      });
      return { images, prompt };
    }).catch(() => null);
    if (!data || data.images.length === 0) {
      logger.warn("\u672A\u627E\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\u7684\u56FE\u7247");
      return null;
    }
    const imagesWithData = [];
    for (const img of data.images) {
      try {
        const base64 = await targetFrame.evaluate((imgSrc) => {
          return new Promise((resolve) => {
            const img2 = new Image();
            img2.crossOrigin = "anonymous";
            img2.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = img2.width;
                canvas.height = img2.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img2, 0, 0);
                  resolve(canvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, ""));
                } else {
                  resolve(null);
                }
              } catch {
                resolve(null);
              }
            };
            img2.onerror = () => resolve(null);
            img2.src = imgSrc;
          });
        }, img.src).catch(() => null);
        imagesWithData.push({
          src: img.src,
          index: img.index,
          base64: base64 || void 0
        });
      } catch {
      }
    }
    return {
      images: imagesWithData,
      prompt: data.prompt,
      targetFrame
    };
  } catch (e) {
    logger.warn(`\u63D0\u53D6\u56FE\u7247\u9A8C\u8BC1\u7801\u6570\u636E\u65F6\u51FA\u9519: ${e?.message || e}`);
    return null;
  }
}
async function handleImageCaptcha(context, config) {
  const { accountId, page } = context;
  const hasImageCaptcha = await detectImageCaptcha(page);
  if (!hasImageCaptcha) {
    logger.info(`[${accountId}] \u672A\u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801`);
    return { success: true };
  }
  logger.info(`[${accountId}] \u68C0\u6D4B\u5230\u56FE\u7247\u9A8C\u8BC1\u7801\uFF0C\u4F7F\u7528\u6A21\u5F0F: ${config.mode}`);
  const captchaData = await extractImageCaptchaData(page);
  if (!captchaData) {
    return { success: false, error: "\u65E0\u6CD5\u63D0\u53D6\u56FE\u7247\u9A8C\u8BC1\u7801\u6570\u636E" };
  }
  logger.info(`[${accountId}] \u56FE\u7247\u9A8C\u8BC1\u7801\u63D0\u793A: ${captchaData.prompt}, \u56FE\u7247\u6570\u91CF: ${captchaData.images.length}`);
  const { getAccountSystemUserId } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 8791));
  const systemUserId = getAccountSystemUserId(accountId);
  switch (config.mode) {
    case "third_party":
      return await handleImageCaptchaThirdParty(accountId, page, captchaData, config);
    case "ocr":
      return await handleImageCaptchaOCR(accountId, page, captchaData, systemUserId);
    case "manual":
      return await handleImageCaptchaManual(accountId, page, captchaData, context.verifyUrl, config);
    default:
      return { success: false, error: `\u672A\u77E5\u7684\u56FE\u7247\u9A8C\u8BC1\u7801\u5904\u7406\u6A21\u5F0F: ${config.mode}` };
  }
}
async function handleImageCaptchaThirdParty(accountId, page, captchaData, config) {
  if (!config.thirdPartyApiKey) {
    logger.warn(`[${accountId}] \u672A\u914D\u7F6E\u7B2C\u4E09\u65B9\u56FE\u7247\u9A8C\u8BC1\u7801 API Key\uFF0C\u56DE\u9000\u5230\u4EBA\u5DE5\u5904\u7406`);
    return await handleImageCaptchaManual(accountId, page, captchaData, void 0, config);
  }
  const provider = (config.thirdPartyProvider || "2captcha").toLowerCase();
  if (provider === "2captcha") {
    return await call2CaptchaImageCaptcha(accountId, page, captchaData, config.thirdPartyApiKey);
  }
  if (provider === "capsolver") {
    return await callCapSolverImageCaptcha(accountId, page, captchaData, config.thirdPartyApiKey);
  }
  return { success: false, error: `\u4E0D\u652F\u6301\u7684\u7B2C\u4E09\u65B9\u670D\u52A1: ${provider}` };
}
async function call2CaptchaImageCaptcha(accountId, page, captchaData, apiKey) {
  const baseUrl = "https://api.2captcha.com";
  if (captchaData.images.length === 0 || !captchaData.images[0].base64) {
    return { success: false, error: "\u65E0\u6CD5\u83B7\u53D6\u56FE\u7247\u6570\u636E" };
  }
  const createPayload = {
    clientKey: apiKey,
    task: {
      type: "ImageToTextTask",
      body: captchaData.images[0].base64,
      comment: captchaData.prompt
    }
  };
  const idleMs = 12e4;
  try {
    return await (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .withIdleTimeout */ .uR)(async (resetIdle) => {
      const createRes = await (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .fetchWithIdleTimeout */ .Wo)(`${baseUrl}/createTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
        idleMs: 25e3
      });
      const createJson = await createRes.json();
      resetIdle();
      if (createJson.errorId !== 0 || createJson.taskId == null) {
        return { success: false, error: createJson.errorDescription || "2Captcha \u521B\u5EFA\u4EFB\u52A1\u5931\u8D25" };
      }
      const taskId = createJson.taskId;
      logger.info(`[${accountId}] 2Captcha \u4EFB\u52A1\u5DF2\u521B\u5EFA\uFF0CtaskId: ${taskId}`);
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2e3));
        resetIdle();
        const resultRes = await (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .fetchWithIdleTimeout */ .Wo)(`${baseUrl}/getTaskResult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientKey: apiKey, taskId }),
          idleMs: 15e3
        });
        const resultJson = await resultRes.json();
        resetIdle();
        if (resultJson.errorId !== 0) {
          return { success: false, error: resultJson.errorDescription || "2Captcha \u83B7\u53D6\u7ED3\u679C\u5931\u8D25" };
        }
        if (resultJson.status === "ready" && resultJson.solution) {
          const coordinates = resultJson.solution.coordinates || [];
          if (coordinates.length === 0) {
            return { success: false, error: "2Captcha \u672A\u8FD4\u56DE\u6709\u6548\u5750\u6807" };
          }
          logger.info(`[${accountId}] 2Captcha \u8BC6\u522B\u6210\u529F\uFF0C\u9700\u8981\u70B9\u51FB ${coordinates.length} \u4E2A\u4F4D\u7F6E`);
          const targetFrame = captchaData.targetFrame || page;
          for (const coord of coordinates) {
            try {
              await targetFrame.mouse.click(coord.x, coord.y);
              await page.waitForTimeout(200 + Math.random() * 300);
            } catch (e) {
              logger.warn(`[${accountId}] \u70B9\u51FB\u5750\u6807 (${coord.x}, ${coord.y}) \u5931\u8D25: ${e}`);
            }
          }
          await page.waitForTimeout(2e3);
          return { success: true };
        }
      }
      return { success: false, error: "2Captcha \u8BC6\u522B\u8D85\u65F6" };
    }, idleMs);
  } catch (e) {
    if (e instanceof _core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .IdleTimeoutError */ .o3) {
      logger.warn(`[${accountId}] 2Captcha \u65E0\u8FDB\u5C55\u8D85\u65F6: ${e.idleMs}ms`);
      return { success: false, error: "2Captcha \u8BC6\u522B\u65E0\u8FDB\u5C55\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5" };
    }
    logger.warn(`[${accountId}] 2Captcha \u8C03\u7528\u5F02\u5E38: ${e?.message || e}`);
    return { success: false, error: e?.message || String(e) };
  }
}
async function callCapSolverImageCaptcha(accountId, page, captchaData, apiKey) {
  const baseUrl = "https://api.capsolver.com/createTask";
  if (captchaData.images.length === 0 || !captchaData.images[0].base64) {
    return { success: false, error: "\u65E0\u6CD5\u83B7\u53D6\u56FE\u7247\u6570\u636E" };
  }
  const task = {
    type: "ImageToTextTask",
    body: captchaData.images[0].base64,
    comment: captchaData.prompt
  };
  const payload = { clientKey: apiKey, task };
  try {
    const res = await (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .fetchWithIdleTimeout */ .Wo)(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      idleMs: 25e3
    });
    const json = await res.json();
    if (json.errorId !== 0) {
      return { success: false, error: json.errorDescription || "CapSolver \u521B\u5EFA\u4EFB\u52A1\u5931\u8D25" };
    }
    if (json.solution) {
      const coordinates = json.solution.coordinates || [];
      if (coordinates.length === 0) {
        return { success: false, error: "CapSolver \u672A\u8FD4\u56DE\u6709\u6548\u5750\u6807" };
      }
      logger.info(`[${accountId}] CapSolver \u8BC6\u522B\u6210\u529F\uFF0C\u9700\u8981\u70B9\u51FB ${coordinates.length} \u4E2A\u4F4D\u7F6E`);
      const targetFrame = captchaData.targetFrame || page;
      for (const coord of coordinates) {
        try {
          await targetFrame.mouse.click(coord.x, coord.y);
          await page.waitForTimeout(200 + Math.random() * 300);
        } catch (e) {
          logger.warn(`[${accountId}] \u70B9\u51FB\u5750\u6807 (${coord.x}, ${coord.y}) \u5931\u8D25: ${e}`);
        }
      }
      await page.waitForTimeout(2e3);
      return { success: true };
    }
    if (json.taskId) {
      return await pollCapSolverImageCaptchaResult(accountId, page, captchaData, apiKey, json.taskId);
    }
    return { success: false, error: "CapSolver \u672A\u8FD4\u56DE solution" };
  } catch (e) {
    if (e instanceof _core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .IdleTimeoutError */ .o3) {
      logger.warn(`[${accountId}] CapSolver \u65E0\u8FDB\u5C55\u8D85\u65F6: ${e.idleMs}ms`);
      return { success: false, error: "CapSolver \u8BC6\u522B\u65E0\u8FDB\u5C55\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5" };
    }
    logger.warn(`[${accountId}] CapSolver \u8C03\u7528\u5F02\u5E38: ${e?.message || e}`);
    return { success: false, error: e?.message || String(e) };
  }
}
async function pollCapSolverImageCaptchaResult(accountId, page, captchaData, apiKey, taskId) {
  return (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .withIdleTimeout */ .uR)(async (resetIdle) => {
    const baseUrl = "https://api.capsolver.com/getTaskResult";
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2e3));
      resetIdle();
      const res = await (0,_core_idle_timeout_js__WEBPACK_IMPORTED_MODULE_3__/* .fetchWithIdleTimeout */ .Wo)(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: apiKey, taskId }),
        idleMs: 15e3
      });
      const json = await res.json();
      resetIdle();
      if (json.errorId !== 0) {
        return { success: false, error: json.errorDescription || "CapSolver \u83B7\u53D6\u7ED3\u679C\u5931\u8D25" };
      }
      if (json.status === "ready" && json.solution) {
        const coordinates = json.solution.coordinates || [];
        if (coordinates.length === 0) {
          return { success: false, error: "CapSolver \u672A\u8FD4\u56DE\u6709\u6548\u5750\u6807" };
        }
        logger.info(`[${accountId}] CapSolver \u8BC6\u522B\u6210\u529F\uFF0C\u9700\u8981\u70B9\u51FB ${coordinates.length} \u4E2A\u4F4D\u7F6E`);
        const targetFrame = captchaData.targetFrame || page;
        for (const coord of coordinates) {
          try {
            await targetFrame.mouse.click(coord.x, coord.y);
            await page.waitForTimeout(200 + Math.random() * 300);
          } catch (e) {
            logger.warn(`[${accountId}] \u70B9\u51FB\u5750\u6807 (${coord.x}, ${coord.y}) \u5931\u8D25: ${e}`);
          }
        }
        await page.waitForTimeout(2e3);
        return { success: true };
      }
    }
    return { success: false, error: "CapSolver \u8BC6\u522B\u8D85\u65F6" };
  }, 12e4);
}
async function handleImageCaptchaOCR(accountId, page, captchaData, systemUserId) {
  try {
    const prompt = captchaData.prompt;
    const keywords = extractKeywordsFromPrompt(prompt);
    if (keywords.length === 0) {
      logger.warn(`[${accountId}] \u65E0\u6CD5\u4ECE\u63D0\u793A\u6587\u672C\u4E2D\u63D0\u53D6\u5173\u952E\u8BCD: ${prompt}`);
      return { success: false, error: "\u65E0\u6CD5\u8BC6\u522B\u63D0\u793A\u6587\u672C\u4E2D\u7684\u5173\u952E\u8BCD" };
    }
    logger.info(`[${accountId}] OCR \u6A21\u5F0F\uFF1A\u63D0\u793A\u6587\u672C="${prompt}"\uFF0C\u63D0\u53D6\u5173\u952E\u8BCD=${keywords.join(", ")}`);
    let Jimp;
    try {
      const jimpModule = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 3830));
      Jimp = jimpModule.Jimp || jimpModule.default;
      if (!Jimp) {
        throw new Error("\u65E0\u6CD5\u52A0\u8F7D jimp");
      }
    } catch (e) {
      logger.warn(`[${accountId}] jimp \u672A\u5B89\u88C5\uFF0COCR \u6A21\u5F0F\u9700\u8981 jimp \u5E93`);
      return { success: false, error: "OCR \u6A21\u5F0F\u9700\u8981\u5B89\u88C5 jimp \u5E93" };
    }
    const imageAnalyses = [];
    for (const img of captchaData.images) {
      if (!img.base64) {
        logger.warn(`[${accountId}] \u56FE\u7247 ${img.index} \u7F3A\u5C11 base64 \u6570\u636E`);
        continue;
      }
      try {
        const imageBuffer = Buffer.from(img.base64, "base64");
        const image = await Jimp.read(imageBuffer);
        const features = extractImageFeatures(image);
        const confidence = matchFeaturesWithKeywords(features, keywords);
        imageAnalyses.push({
          index: img.index,
          confidence,
          features
        });
        logger.debug(`[${accountId}] \u56FE\u7247 ${img.index}: \u7F6E\u4FE1\u5EA6=${confidence.toFixed(2)}`);
      } catch (e) {
        logger.warn(`[${accountId}] \u5206\u6790\u56FE\u7247 ${img.index} \u65F6\u51FA\u9519: ${e?.message || e}`);
      }
    }
    if (imageAnalyses.length === 0) {
      return { success: false, error: "\u65E0\u6CD5\u5206\u6790\u4EFB\u4F55\u56FE\u7247" };
    }
    const confidenceThreshold = parseFloat((0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getSystemSetting)("image_captcha_ocr_confidence", systemUserId) || "0.7");
    const selectedImages = imageAnalyses.filter((a) => a.confidence >= confidenceThreshold);
    if (selectedImages.length === 0) {
      logger.warn(`[${accountId}] \u6CA1\u6709\u56FE\u7247\u7684\u7F6E\u4FE1\u5EA6\u8FBE\u5230\u9608\u503C ${confidenceThreshold}\uFF0C\u56DE\u9000\u5230\u4EBA\u5DE5\u5904\u7406`);
      const config = getImageCaptchaConfig(systemUserId);
      return await handleImageCaptchaManual(accountId, page, captchaData, void 0, config);
    }
    logger.info(`[${accountId}] OCR \u8BC6\u522B\u6210\u529F\uFF0C\u9009\u62E9 ${selectedImages.length} \u5F20\u56FE\u7247\uFF08\u7F6E\u4FE1\u5EA6 >= ${confidenceThreshold}\uFF09`);
    const targetFrame = captchaData.targetFrame || page;
    const imageElements = await targetFrame.$$("img").catch(() => []);
    for (const analysis of selectedImages) {
      try {
        if (imageElements[analysis.index]) {
          const box = await imageElements[analysis.index].boundingBox();
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(200 + Math.random() * 300);
            logger.info(`[${accountId}] \u5DF2\u70B9\u51FB\u56FE\u7247 ${analysis.index}\uFF08\u7F6E\u4FE1\u5EA6: ${analysis.confidence.toFixed(2)}\uFF09`);
          }
        }
      } catch (e) {
        logger.warn(`[${accountId}] \u70B9\u51FB\u56FE\u7247 ${analysis.index} \u5931\u8D25: ${e}`);
      }
    }
    await page.waitForTimeout(2e3);
    return { success: true };
  } catch (e) {
    logger.warn(`[${accountId}] OCR \u6A21\u5F0F\u5904\u7406\u51FA\u9519: ${e?.message || e}`);
    return { success: false, error: e?.message || String(e) };
  }
}
function extractKeywordsFromPrompt(prompt) {
  const patterns = [
    /包含[^，。]*?的图片/g,
    /[^，。]*?的图片/g,
    /选择[^，。]*?的/g,
    /点击[^，。]*?的/g
  ];
  const keywords = [];
  for (const pattern of patterns) {
    const matches = prompt.match(pattern);
    if (matches) {
      for (const match of matches) {
        const keyword = match.replace(/包含|选择|点击|的图片|的/g, "").trim();
        if (keyword && keyword.length > 0) {
          keywords.push(keyword);
        }
      }
    }
  }
  if (keywords.length === 0) {
    const commonObjects = ["\u7EA2\u7EFF\u706F", "\u6C7D\u8F66", "\u81EA\u884C\u8F66", "\u884C\u4EBA", "\u6591\u9A6C\u7EBF", "\u4EA4\u901A\u6807\u5FD7", "\u7EA2\u7EFF\u706F", "\u7EA2\u7EFF", "\u7EFF\u706F", "\u7EA2\u706F", "\u9EC4\u706F"];
    for (const obj of commonObjects) {
      if (prompt.includes(obj)) {
        keywords.push(obj);
      }
    }
  }
  return [...new Set(keywords)];
}
function extractImageFeatures(image) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const data = image.bitmap.data;
  const colorMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.floor(r / 32)}_${Math.floor(g / 32)}_${Math.floor(b / 32)}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  const dominantColors = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([key]) => {
    const [r, g, b] = key.split("_").map(Number);
    return { r: r * 32, g: g * 32, b: b * 32 };
  });
  let edgeCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const nextIdx = (y * width + (x + 1)) * 4;
      const diff = Math.abs(data[idx] - data[nextIdx]) + Math.abs(data[idx + 1] - data[nextIdx + 1]) + Math.abs(data[idx + 2] - data[nextIdx + 2]);
      if (diff > 30)
        edgeCount++;
    }
  }
  const edgeDensity = edgeCount / (width * height);
  let sum = 0;
  let sumSq = 0;
  const pixelCount = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += gray;
    sumSq += gray * gray;
  }
  const mean = sum / pixelCount;
  const variance = sumSq / pixelCount - mean * mean;
  const textureComplexity = Math.sqrt(variance) / 255;
  const brightness = sum / (pixelCount * 3);
  return {
    dominantColors,
    edgeDensity,
    textureComplexity,
    brightness: brightness / 255
  };
}
function matchFeaturesWithKeywords(features, keywords) {
  let confidence = 0;
  for (const keyword of keywords) {
    if (keyword.includes("\u7EA2\u7EFF\u706F") || keyword.includes("\u7EA2\u7EFF") || keyword.includes("\u4EA4\u901A\u706F")) {
      const hasRed = features.dominantColors.some((c) => c.r > 200 && c.g < 100 && c.b < 100);
      const hasGreen = features.dominantColors.some((c) => c.g > 200 && c.r < 100 && c.b < 100);
      if (hasRed || hasGreen)
        confidence += 0.4;
      if (hasRed && hasGreen)
        confidence += 0.3;
    }
    if (keyword.includes("\u6C7D\u8F66") || keyword.includes("\u8F66")) {
      if (features.edgeDensity > 0.1 && features.textureComplexity > 0.3) {
        confidence += 0.3;
      }
    }
    if (keyword.includes("\u81EA\u884C\u8F66") || keyword.includes("\u5355\u8F66")) {
      if (features.edgeDensity > 0.08) {
        confidence += 0.3;
      }
    }
    if (keyword.includes("\u884C\u4EBA") || keyword.includes("\u4EBA")) {
      if (features.edgeDensity > 0.05 && features.edgeDensity < 0.15) {
        confidence += 0.3;
      }
    }
    if (keyword.includes("\u6591\u9A6C\u7EBF") || keyword.includes("\u6A2A\u7EBF")) {
      if (features.edgeDensity > 0.15) {
        confidence += 0.4;
      }
    }
  }
  return Math.min(1, Math.max(0, confidence));
}
async function handleImageCaptchaManual(accountId, page, captchaData, verifyUrl, config) {
  const channels = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getEnabledNotificationChannels)();
  const account = (0,_db_index_js__WEBPACK_IMPORTED_MODULE_1__.getAccount)(accountId);
  const displayName = account?.nickname || account?.remark || accountId;
  const link = verifyUrl || config.manualVerifyBaseUrl || `#/accounts`;
  const title = `\u56FE\u7247\u9A8C\u8BC1\u7801\u5F85\u5904\u7406 - ${displayName}`;
  const content = verifyUrl ? `\u8D26\u53F7: ${displayName}
\u8BF7\u5B8C\u6210\u56FE\u7247\u9A8C\u8BC1\u7801\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u68C0\u6D4B\u5E76\u7EE7\u7EED\u3002
\u63D0\u793A: ${captchaData.prompt}
\u9A8C\u8BC1\u94FE\u63A5: ${link}
\u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString()}` : `\u8D26\u53F7: ${displayName}
\u8BF7\u5B8C\u6210\u56FE\u7247\u9A8C\u8BC1\u7801\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u68C0\u6D4B\u5E76\u7EE7\u7EED\u3002
\u63D0\u793A: ${captchaData.prompt}
\u8D26\u53F7\u7BA1\u7406: ${link}
\u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
  for (const channel of channels) {
    try {
      const channelConfig = JSON.parse(channel.config);
      await (0,_notification_service_js__WEBPACK_IMPORTED_MODULE_2__/* .sendNotification */ ._)(channel.type, channelConfig, title, content);
      logger.info(`[${accountId}] \u5DF2\u53D1\u9001\u56FE\u7247\u9A8C\u8BC1\u7801\u4EBA\u5DE5\u5904\u7406\u901A\u77E5 [\u6E20\u9053: ${channel.name}]`);
    } catch (e) {
      logger.warn(`[${accountId}] \u53D1\u9001\u56FE\u7247\u9A8C\u8BC1\u7801\u901A\u77E5\u5931\u8D25 [\u6E20\u9053: ${channel.name}]: ${e}`);
    }
  }
  logger.info(`[${accountId}] \u5DF2\u53D1\u9001\u56FE\u7247\u9A8C\u8BC1\u7801\u4EBA\u5DE5\u5904\u7406\u901A\u77E5\uFF0C\u7B49\u5F85\u7528\u6237\u5B8C\u6210`);
  const maxWaitTime = 5 * 60 * 1e3;
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    await page.waitForTimeout(2e3);
    const stillHasCaptcha = await detectImageCaptcha(page);
    if (!stillHasCaptcha) {
      logger.info(`[${accountId}] \u56FE\u7247\u9A8C\u8BC1\u7801\u5DF2\u5B8C\u6210`);
      return { success: true };
    }
  }
  logger.warn(`[${accountId}] \u7B49\u5F85\u56FE\u7247\u9A8C\u8BC1\u7801\u5B8C\u6210\u8D85\u65F6`);
  return { success: false, manualRequired: true, error: "\u7B49\u5F85\u7528\u6237\u5B8C\u6210\u56FE\u7247\u9A8C\u8BC1\u7801\u8D85\u65F6" };
}



/***/ })

};
