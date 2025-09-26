// ======== ضع هنا مفتاحك ========
const API_KEY = "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";
// =================================

let lastSystemPrompt = "";
let lastAssistantMessage = "";

// استدعاء LLM مع معالجة الأخطاء
async function callLLM(messages) {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
      temperature: 0.7
    })
  });

  let payload;
  try {
    payload = await resp.json();
  } catch {
    throw new Error("لم أستطع قراءة ردّ السيرفر.");
  }

  if (!resp.ok) {
    const msg = payload.error?.message || payload.message || resp.statusText;
    throw new Error(`خطأ ${resp.status}: ${msg}`);
  }
  if (!payload.choices?.length) {
    throw new Error("لم أتلقَ خيارات للردّ.");
  }

  return payload.choices[0].message.content;
}

// عرض الأخطاء في العنصر المناسب
function showError(id, err) {
  document.getElementById(id).innerHTML =
    `<strong style="color:red;">خطأ:</strong><p>${err.message}</p>`;
}

// توليد المحتوى الإعلاني
async function generateContent() {
  const desc = document.getElementById("productInput").value.trim();
  const outId = "contentResult";
  if (!desc) {
    return showError(outId, new Error("اكتب وصف المنتج أو الخدمة أولاً."));
  }

  lastSystemPrompt = `اكتب لي محتوى إعلاني جذاب باللغة العربية لمنتج: "${desc}".`;
  try {
    document.getElementById(outId).innerHTML = "جاري المعالجة...";
    const result = await callLLM([{ role: "user", content: lastSystemPrompt }]);
    lastAssistantMessage = result;
    document.getElementById(outId).innerHTML =
      `<strong>المحتوى الإعلاني:</strong><p>${result}</p>`;
  } catch (err) {
    showError(outId, err);
    console.error(err);
  }
}

// تحليل الجمهور
async function analyzeAudience() {
  const desc = document.getElementById("productInput").value.trim();
  const outId = "audienceResult";
  if (!desc) {
    return showError(outId, new Error("اكتب وصف المنتج أولاً."));
  }

  const prompt = `حلل الجمهور المناسب لهذا المنتج "${desc}" من حيث العمر، الاهتمامات، والمنصة الأفضل للنشر.`;
  try {
    document.getElementById(outId).innerHTML = "جاري المعالجة...";
    const result = await callLLM([{ role: "user", content: prompt }]);
    document.getElementById(outId).innerHTML =
      `<strong>تحليل الجمهور:</strong><p>${result}</p>`;
  } catch (err) {
    showError(outId, err);
    console.error(err);
  }
}

// اقتراح توقيت النشر
function suggestTime() {
  const platform = document.getElementById("platformSelect").value;
  const times = {
    facebook: "12:00 ظهراً – 3:00 مساءً",
    instagram: "6:00 – 9:00 مساءً",
    tiktok: "7:00 – 10:00 مساءً"
  };
  document.getElementById("timeResult").innerHTML =
    `<strong>توقيت النشر (${platform}):</strong><p>${times[platform] || "-"}</p>`;
}

// تحليل الهاشتاجات
async function suggestHashtags() {
  const desc = document.getElementById("productInput").value.trim();
  const outId = "hashtagsResult";
  if (!desc) {
    return showError(outId, new Error("اكتب وصف المنتج أولاً."));
  }

  const prompt = `اقترح لي 10 هاشتاجات عربية شائعة مناسبة للإعلان عن: "${desc}".`;
  try {
    document.getElementById(outId).innerHTML = "جاري المعالجة...";
    const result = await callLLM([{ role: "user", content: prompt }]);
    document.getElementById(outId).innerHTML =
      `<strong>الهاشتاجات المقترحة:</strong><p>${result}</p>`;
  } catch (err) {
    showError(outId, err);
    console.error(err);
  }
}

// إرسال التعديلات للموديل
async function applyRevision() {
  const edit = document.getElementById("revisionInput").value.trim();
  const outId = "contentResult";
  if (!edit) {
    return showError(outId, new Error("اكتب ملاحظاتك أولاً."));
  }
  if (!lastSystemPrompt || !lastAssistantMessage) {
    return showError(outId, new Error("لم يتم توليد محتوى لتعديله."));
  }

  const messages = [
    { role: "system", content: "أنت مساعد لإعادة صياغة المحتوى." },
    { role: "user", content: lastSystemPrompt },
    { role: "assistant", content: lastAssistantMessage },
    { role: "user", content: `طبق التعديلات التالية على المحتوى: ${edit}` }
  ];

  try {
    document.getElementById(outId).innerHTML = "جاري تطبيق التعديل...";
    const revised = await callLLM(messages);
    lastAssistantMessage = revised;
    document.getElementById(outId).innerHTML =
      `<strong>المحتوى بعد التعديل:</strong><p>${revised}</p>`;
    document.getElementById("revisionInput").value = "";
  } catch (err) {
    showError(outId, err);
    console.error(err);
  }
}
