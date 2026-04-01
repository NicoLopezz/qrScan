/**
 * @typedef {Object} MessageChannel
 * @property {string} name - Channel identifier ('whatsapp' | 'telegram')
 * @property {(to: string, body: string) => Promise<void>} sendMessage - Send a text message
 * @property {(to: string, templateParams: string[]) => Promise<void>} sendTemplateMessage - Send a template/formatted message
 * @property {(adminData: Object, entityData: Object, flowType: string) => string} buildQrRedirectUrl - Build QR scan redirect URL
 */

export default {};
