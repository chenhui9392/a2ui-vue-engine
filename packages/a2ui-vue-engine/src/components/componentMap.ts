/*
 * @Author: hui.chenn
 * @Description: Component map for A2UI
 * @Date: 2026-04-15 15:39:39
 * @LastEditTime: 2026-04-24 10:05:00
 * @LastEditors: hui.chenn
 */
import type { ComponentMapper } from '../types'

// Import A2 components
import A2Button from './A2Button.vue'
import A2Text from './A2Text.vue'
import A2Input from './A2Input.vue'
import A2Select from './A2Select.vue'
import A2DatePicker from './A2DatePicker.vue'
import A2Card from './A2Card.vue'
import A2Row from './A2Row.vue'
import A2Column from './A2Column.vue'
import A2List from './A2List.vue'
import A2TextField from './A2TextField.vue'
import A2Icon from './A2Icon.vue'
import A2DateTimeInput from './A2DateTimeInput.vue'
import A2SelectField from './A2SelectField.vue'
import A2ChoicePicker from './A2ChoicePicker.vue'
import A2OptionCard from './A2OptionCard.vue'

// Default component map - can be extended or overridden
export const defaultComponentMap: ComponentMapper = {
  'a2-button': A2Button,
  'a2-text': A2Text,
  'a2-input': A2Input,
  'a2-select': A2Select,
  'a2-date-picker': A2DatePicker,
  'a2-card': A2Card,
  'a2-row': A2Row,
  'a2-column': A2Column,
  'a2-list': A2List,
  'a2-text-field': A2TextField,
  'a2-icon': A2Icon,
  'a2-date-time-input': A2DateTimeInput,
  'a2-select-field': A2SelectField,
  'a2-choice-picker': A2ChoicePicker,
  'a2-option-card': A2OptionCard,
}

// Global component map instance
let globalComponentMap: ComponentMapper = { ...defaultComponentMap }

// Register a component
export function registerComponent(
  type: string,
  component: ComponentMapper[string]
): void {
  globalComponentMap[type] = component
}

// Register multiple components
export function registerComponents(components: ComponentMapper): void {
  Object.assign(globalComponentMap, components)
}

// Get component by type
export function getComponent(type: string): ComponentMapper[string] | undefined {
  return globalComponentMap[type]
}

// Get all registered components
export function getComponentMap(): ComponentMapper {
  return { ...globalComponentMap }
}

// Reset to default components
export function resetComponentMap(): void {
  globalComponentMap = { ...defaultComponentMap }
}

// Create component map with defaults and custom components
export function createComponentMap(
  customComponents?: ComponentMapper
): ComponentMapper {
  return {
    ...defaultComponentMap,
    ...customComponents,
  }
}