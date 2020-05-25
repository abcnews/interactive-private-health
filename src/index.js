const { Client } = require("@abcnews/poll-counters-client");
const { h, render } = require("preact");
const xhr = require("xhr");
require("./global.css");

const isDev = process.env.NODE_ENV === "development";
const isStaging =
  ((!isDev && window.ABC && ABC.appId) || "").indexOf("News") === -1; // ABC.appId is undefined in Preview sites.
const root = document.querySelector(`[data-interactive-private-health-root]`);
const api = new Client(
  `interactive-private-health${isDev ? "_dev" : isStaging ? "_staging" : ""}`
);
let content = {};

function init() {
  const App = require("./components/App");
  render(
    <App
      content={content}
      api={api}
      isDev={process.env.NODE_ENV === "development"}
    />,
    root,
    root.firstChild
  );
}

xhr({ url: root.getAttribute("data-content-url") }, (err, response, body) => {
  const doc = new DOMParser().parseFromString(body, "text/html");
  const startNode = doc.querySelector('a[id="content"],a[name="content"]');
  const endNode = doc.querySelector('a[id="endcontent"],a[name="endcontent"]');

  if (!startNode || !endNode) {
    console.error(new Error("No content bookends found in document."));

    return init();
  }

  let currentNode = startNode;
  let currentSection;

  while (
    ((currentNode = currentNode.nextSibling),
    currentNode && currentNode !== endNode)
  ) {
    if (
      !currentNode.tagName ||
      (currentNode.tagName === "P" &&
        currentNode.textContent.trim().length === 0)
    ) {
      // Skip non-elements & empty paragraphs
    } else if (
      currentNode.tagName === "A" &&
      ((currentNode.getAttribute("id") || "").length > 0 ||
        (currentNode.getAttribute("name") || "").length > 0)
    ) {
      // Set currentSection to tag's name attribute, and create a key on content if it doesn't exist
      currentSection =
        currentNode.getAttribute("id") || currentNode.getAttribute("name");
      content[currentSection] = content[currentSection] || [];
    } else if (currentSection) {
      // Append element to content's currentSection
      content[currentSection].push(currentNode);
    }
  }

  init();
});

(function banner() {
  const headerEl = document.querySelector(".Header");

  if (!headerEl) {
    return setTimeout(banner, 100);
  }

  const bannerContainerEl = document.createElement("div");
  const bannerEl = document.createElement("div");
  const bannerFrameEl = document.createElement("iframe");

  bannerContainerEl.className = "BannerContainer";
  bannerEl.className = "Banner";
  bannerFrameEl.frameborder = 0;
  bannerFrameEl.src = `${__webpack_public_path__}banner.svg`;
  bannerEl.appendChild(bannerFrameEl);
  bannerContainerEl.appendChild(bannerEl);
  headerEl.insertBefore(bannerContainerEl, headerEl.firstChild);
})();

if (module.hot) {
  module.hot.accept("./components/App", () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require("./components/ErrorBox");
      render(<ErrorBox error={err} />, root, root.firstChild);
    }
  });
}
