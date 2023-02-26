import * as messages from './messages';


const selector = 'textarea[tabindex="0"]';


async function getChatTab() {
  const url = 'https://chat.openai.com/chat';
  const [tab] = await chrome.tabs.query({ url: url + '*' });
  if (tab) return tab;
  return chrome.tabs.create({ url });
}


async function waitForTextArea(tabId) {
  const maxRetries = 18;
  let retries = 0;
  while (retries < maxRetries) {
    const [textArea] = await chrome.scripting.executeScript({
      args: [selector], target: { tabId: tabId },
      func: selector => document.querySelector(selector)
    });
    const result = textArea?.result;
    if (result) return result;
    retries++;
    await new Promise(resolve => setTimeout(resolve, 333));
  }
  console.log("Failed to find textarea element.");
}


chrome.action.onClicked.addListener(async function(tab) {
  try {
    const encodedText = await chrome.tabs.sendMessage(
      tab.id, messages.getEncodedPrompt, { frameId: 0 });

    const chatTab = await getChatTab();
      await chrome.tabs.update(chatTab.id, { active: true });
  
    const textArea = await waitForTextArea(chatTab.id);
    if (!textArea) return;

    chrome.scripting.executeScript({
      args: [selector, encodedText], target: { tabId: chatTab.id },
      func: async (selector, encodedText) => {
        const textArea = document.querySelector(selector);
        textArea.value = decodeURIComponent(window.atob(encodedText));
        await textArea.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter' }));
      }
    });

  } catch (error) {
    console.error(error);
  }
});


/*
const selector = `document.querySelector('textarea[tabindex="0"]')`;


function getChatTab() {
  return new Promise(resolve => {
    const url = 'https://chat.openai.com/chat';
    chrome.tabs.query({ url: url + '*' }, tabs => {
      if (tabs.length > 0) resolve(tabs[0]);
      else chrome.tabs.create({ url }, resolve);
    });
  });
}


function waitForTextArea(tabId) {
  const maxRetries = 18;
  let retries = 0;
  return new Promise(resolve => {
    const check = () => {
      chrome.tabs.executeScript(tabId, {
        code: selector
      }, result => {
        const textArea = result?.[0];
        if (!textArea && retries < maxRetries) {
          retries++;
          setTimeout(check, 333);
        } else
          resolve(textArea);
      });
    };
    check();
  });
}


chrome.browserAction.onClicked.addListener(async function(tab) {
  const selection = await new Promise(resolve => chrome.tabs.executeScript(
    { code: "window.getSelection().toString();" }, resolve));
  const text = window.btoa(encodeURIComponent(sanitize(
    "Summarize the following text:\n\n" + selection.join("\n\n"))));
  const chatTab = await getChatTab();
  await new Promise(resolve => chrome.tabs.update(
    chatTab.id, { active: true }, resolve));
  const textArea = await waitForTextArea(chatTab.id);
  if (!textArea) return console.log("Failed to find textarea element.");
  let code = `${selector}.value = decodeURIComponent(window.atob('${text}')); `;
  code += `${selector}.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));`;
  chrome.tabs.executeScript(chatTab.id, {code});
  console.log({code});
});
*/
