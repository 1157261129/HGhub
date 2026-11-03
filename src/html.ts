import { LOCAL } from "./api";

/** 把正文里的图片换成走本地协议（带 Referer / 解密能力） */
export function proxyImages(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return;
    img.setAttribute("src", `${LOCAL}/img?u=${encodeURIComponent(src)}`);
    img.removeAttribute("srcset");
    img.setAttribute("loading", "lazy");
  });
  return doc.body.innerHTML;
}

/** 极简白名单清洗：去脚本、去事件属性、去 javascript: 链接 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta,form,input,button").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    }
  });
  return proxyImages(doc.body.innerHTML);
}