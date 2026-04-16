/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:34:22
 * @LastEditTime: 2026-04-15 15:34:41
 * @LastEditors: hui.chenn
 */
export { MessageProcessor, createMessageProcessor, getGlobalProcessor, resetGlobalProcessor } from './MessageProcessor'
export type { MessageProcessorOptions } from './MessageProcessor'
export { convertFlatToTree, extractFormDataPaths } from './flatToTree'