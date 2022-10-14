import 'regenerator-runtime/runtime';
import { decode } from '@abcnews/base-36-text';
import { TIERS, getTier, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, isMount, selectMounts } from '@abcnews/mount-utils';
import { Client } from '@abcnews/poll-counters-client';
import { h, render } from 'preact';
import './global.css';
import App from './components/App';

const isDev = process.env.NODE_ENV === 'development';

const api = new Client(`interactive-private-health${isDev ? '_dev' : getTier() === TIERS.PREVIEW ? '_staging' : ''}`);

const fetchContent = async url => {
  const content = {};
  const response = await fetch(url);

  if (response.status === 404) {
    console.error(new Error(`Content does not exist at URL: ${url}`));
  }

  const bodyText = await response.text();
  const doc = new DOMParser().parseFromString(bodyText, 'text/html');
  const selectDocMount = id => doc.querySelector(`[data-mount][id="${id}"]`);
  const startNode = selectDocMount('content');
  const endNode = selectDocMount('endcontent');

  if (!startNode || !endNode) {
    console.error(new Error(`No content bookends found in document at URL: ${url}`));

    return content;
  }

  let currentNode = startNode;
  let currentSection;

  while (((currentNode = currentNode.nextSibling), currentNode && currentNode !== endNode)) {
    if (!currentNode.tagName || (currentNode.tagName === 'P' && currentNode.textContent.trim().length === 0)) {
      // Skip non-elements & empty paragraphs
    } else if (isMount(currentNode)) {
      // Set currentSection to mount's id, and create a key on content if it doesn't exist
      currentSection = getMountValue(currentNode);
      content[currentSection] = content[currentSection] || [];
    } else if (currentSection) {
      // Append element to content's currentSection
      content[currentSection].push(currentNode);
    }
  }

  return content;
};

const addBannerIllustration = () => {
  const headerEl = document.querySelector('.Header');

  if (!headerEl) {
    return;
  }

  const bannerContainerEl = document.createElement('div');
  const bannerEl = document.createElement('div');
  const bannerFrameEl = document.createElement('iframe');

  bannerContainerEl.className = 'BannerContainer';
  bannerEl.className = 'Banner';
  bannerFrameEl.frameborder = 0;
  bannerFrameEl.src = `${__webpack_public_path__}banner.svg`;
  bannerEl.appendChild(bannerFrameEl);
  bannerContainerEl.appendChild(bannerEl);
  headerEl.insertBefore(bannerContainerEl, headerEl.firstChild);
};

whenOdysseyLoaded.then(async () => {
  addBannerIllustration();

  const [rootEl] = selectMounts('privatehealth');

  if (!rootEl) {
    console.error(new Error(`No #privatehealthCONTENT<base36_url> mount found`));
    return;
  }

  const rootElMountValue = getMountValue(rootEl);
  const [, encodedContentURL] = rootElMountValue.split('CONTENT');
  const contentURL = decode(encodedContentURL || '');

  if (!contentURL) {
    console.error(new Error(`Mount content URL is missing or invalid`));
    console.debug({ rootElMountValue, encodedContentURL, contentURL });

    return;
  }

  const content = await fetchContent(contentURL);

  render(<App content={content} api={api} isDev={isDev} />, rootEl);
});
