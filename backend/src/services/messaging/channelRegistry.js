/** @type {Object<string, import('./MessageChannel.js').MessageChannel>} */
const channels = {};

export function registerChannel(channel) {
  channels[channel.name] = channel;
}

export function getChannel(channelName) {
  return channels[channelName] || channels[getDefaultChannel()];
}

export function getDefaultChannel() {
  return process.env.DEFAULT_MESSAGING_CHANNEL || 'telegram';
}

export async function sendMessage(channelName, to, body) {
  const ch = getChannel(channelName);
  if (!ch) {
    console.warn(`Canal "${channelName}" no registrado`);
    return;
  }
  return ch.sendMessage(to, body);
}

export async function sendTemplateMessage(channelName, to, params) {
  const ch = getChannel(channelName);
  if (!ch) {
    console.warn(`Canal "${channelName}" no registrado`);
    return;
  }
  return ch.sendTemplateMessage(to, params);
}

export function buildQrRedirectUrl(channelName, adminData, entityData, flowType) {
  const ch = getChannel(channelName);
  if (!ch) {
    console.warn(`Canal "${channelName}" no registrado`);
    return '#';
  }
  return ch.buildQrRedirectUrl(adminData, entityData, flowType);
}
