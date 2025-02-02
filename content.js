const arabicPersianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u067E\u0686\u06AF\u200C\u200F]/;
const allowedTags = ["P", "SPAN", "H1", "H2", "H3", "LI", "OL", "UL"];
const TARGET_URL = "https://chat.deepseek.com/";

function isTargetPage() {
    return window.location.href.startsWith(TARGET_URL);
}

function isInsideCodeBlock(element) {
    return element.closest(".md-code-block") !== null;
}

function applyRTL(element) {
    if (!isTargetPage()) return;
    if (isInsideCodeBlock(element)) return;

    const isListContainer = ["UL", "OL", "LI"].includes(element.tagName);
    if (!allowedTags.includes(element.tagName) && !isListContainer) return;

    const fullText = element.textContent.trim();
    if (!fullText) return;

    const words = fullText.split(/\s+/).slice(0, 5);
    const hasPersian = words.some(word => persianRegex.test(word));

    if (hasPersian && !element.hasAttribute("dir")) {
        element.setAttribute("dir", "rtl");
        element.style.textAlign = "right";
    }
}

function scanPage() {
    if (!isTargetPage()) return;

    const selector = [...allowedTags, "UL", "OL", "LI"].join(", ");
    document.querySelectorAll(selector).forEach(el => !isInsideCodeBlock(el) && applyRTL(el));
}

const observer = new MutationObserver(mutations => {
    if (!isTargetPage()) return;

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && !isInsideCodeBlock(node)) {
                if (["UL", "OL", "LI", ...allowedTags].includes(node.tagName)) {
                    applyRTL(node);
                }

                const selector = [...allowedTags, "UL", "OL", "LI"].join(", ");
                node.querySelectorAll(selector).forEach(child => !isInsideCodeBlock(child) && applyRTL(child));
            }
        });
    });
});

if (isTargetPage()) {
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
    scanPage();
}
