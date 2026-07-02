/*
 * @Author: hui.chenn
 * @Description: 通用工具：取路径、debounce、指数退避 sleep
 * @Date: 2026-07-01 10:00:00
 */

/**
 * 按点分路径从对象取值。支持 `a.b.c` 与 `a.b[0].c`。
 * 与其它 Runtime 模块保持一致（后续可统一到 tech-debt DEBT-P1-05 的 path.ts）。
 */
export function pickByPath(obj: any, path?: string): any {
  if (!obj || !path) return obj
  const keys: string[] = []
  path.split('.').forEach(seg => {
    const m = seg.match(/^(\w+)(?:\[(\d+)\])?$/)
    if (m) {
      keys.push(m[1])
      if (m[2] !== undefined) keys.push(m[2])
    } else {
      keys.push(seg)
    }
  })
  let cur: any = obj
  for (const k of keys) {
    if (cur === undefined || cur === null) return undefined
    cur = cur[k as any]
  }
  return cur
}

export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timer: any = null
  const wrapped = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, wait)
  }
  wrapped.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return wrapped as T & { cancel: () => void }
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'))
      return
    }
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      cleanup()
      reject(new Error('Aborted'))
    }
    const cleanup = () => {
      if (signal) signal.removeEventListener('abort', onAbort)
    }
    if (signal) signal.addEventListener('abort', onAbort, { once: true })
  })
}
