import * as messages from './messages';
import {sanitize} from 'dompurify';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === messages.getEncodedPrompt) {
    const selectedText = window?.getSelection?.()?.toString?.() || '';
    const prompt = "Summarize the following text:\n\n" + selectedText;
    sendResponse(window.btoa(encodeURIComponent(sanitize(prompt))));
  }
});
