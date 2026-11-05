import type { Plugin } from 'vite'

export function inlineScriptHashes(html: string): string[]
export function contentSecurityPolicy(html: string): string
export function injectContentSecurityPolicy(html: string): string
export function securityMeta(): Plugin
