'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Instagram, Link2, Music2, Radio, Waves, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type SmartLink = {
  type: string
  url: string
}

interface SmartLinkInputProps {
  value: SmartLink[]
  onChange: (links: SmartLink[]) => void
}

type ProviderConfig = {
  type: string
  label: string
  regex: RegExp
  icon: LucideIcon
}

const PROVIDERS: ProviderConfig[] = [
  { type: 'spotify', label: 'Spotify Set', regex: /spotify\.com/i, icon: Music2 },
  { type: 'soundcloud', label: 'SoundCloud Set', regex: /soundcloud\.com/i, icon: Waves },
  { type: 'mixcloud', label: 'Mixcloud Show', regex: /mixcloud\.com/i, icon: Radio },
  { type: 'instagram', label: 'Instagram Drop', regex: /instagram\.com/i, icon: Instagram },
]

export default function SmartLinkInput({ value, onChange }: SmartLinkInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const detectProvider = (url: string) => {
    const provider = PROVIDERS.find((provider) => provider.regex.test(url))
    return provider
      ? provider
      : {
          type: 'link',
          label: 'Custom Link',
          regex: /.*/,
          icon: Link2,
        }
  }

  const handleAddLink = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
      const url = parsed.toString()
      if (value.some((link) => link.url === url)) {
        setError('Link already added')
        return
      }
      const provider = detectProvider(url)
      const nextLinks = [...value, { type: provider.type, url }]
      onChange(nextLinks)
      setInputValue('')
      setError(null)
    } catch {
      setError('Please enter a valid URL')
    }
  }

  const handleRemove = (link: SmartLink) => {
    onChange(value.filter((item) => item.url !== link.url))
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <label className="text-xs uppercase tracking-normal text-slate-400">
          Smart Links
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((link) => {
            const provider = detectProvider(link.url)
            const Icon = provider.icon
            return (
              <span
                key={link.url}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
              >
                <Icon size={14} className="text-slate-500" />
                <span className="text-xs font-medium text-slate-600">
                  {provider.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(link)}
                  className="rounded-full p-1 text-slate-400 transition hover:text-slate-800"
                  aria-label="Remove link"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="url"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLink()
                }
              }}
              placeholder="Paste Spotify, SoundCloud or IG links"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                'bg-slate-900 text-white hover:bg-slate-800'
              )}
            >
              Add
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
      </div>
    </div>
  )
}

