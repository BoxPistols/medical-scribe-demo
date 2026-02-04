import { describe, it, expect } from 'vitest'

// Helper functions that mirror the ones in page.tsx
const getTimestampForFilename = (): string => {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

const escapeCsvCell = (value: string): string => {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const formatShortcut = (
  shortcut: { key: string; meta?: boolean; shift?: boolean; alt?: boolean },
  forDisplay = false
): string => {
  const parts: string[] = []
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')

  if (shortcut.meta) {
    parts.push(forDisplay ? (isMac ? 'Cmd' : 'Ctrl') : 'meta')
  }
  if (shortcut.alt) {
    parts.push(forDisplay ? 'Alt' : 'alt')
  }
  if (shortcut.shift) {
    parts.push(forDisplay ? 'Shift' : 'shift')
  }
  parts.push(forDisplay ? shortcut.key.toUpperCase() : shortcut.key.toLowerCase())

  return forDisplay ? parts.join('+') : parts.join('+')
}

describe('Helper Functions', () => {
  describe('getTimestampForFilename', () => {
    it('should return ISO format timestamp without colons or dots', () => {
      const timestamp = getTimestampForFilename()

      // Should not contain : or .
      expect(timestamp).not.toContain(':')
      expect(timestamp).not.toContain('.')

      // Should be 19 characters (YYYY-MM-DDTHH-MM-SS)
      expect(timestamp).toHaveLength(19)

      // Should match the pattern
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/)
    })
  })

  describe('escapeCsvCell', () => {
    it('should return value unchanged if no special characters', () => {
      expect(escapeCsvCell('simple text')).toBe('simple text')
      expect(escapeCsvCell('12345')).toBe('12345')
    })

    it('should wrap in quotes and escape double quotes', () => {
      expect(escapeCsvCell('text with "quotes"')).toBe('"text with ""quotes"""')
    })

    it('should wrap in quotes if contains comma', () => {
      expect(escapeCsvCell('one, two, three')).toBe('"one, two, three"')
    })

    it('should wrap in quotes if contains newline', () => {
      expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
    })

    it('should handle multiple special characters', () => {
      expect(escapeCsvCell('text, with "quotes" and\nnewlines')).toBe(
        '"text, with ""quotes"" and\nnewlines"'
      )
    })
  })

  describe('formatShortcut', () => {
    it('should format simple key', () => {
      expect(formatShortcut({ key: 'r' }, true)).toBe('R')
      expect(formatShortcut({ key: 'a' }, true)).toBe('A')
    })

    it('should format key with meta modifier', () => {
      const result = formatShortcut({ key: 'r', meta: true }, true)
      // Result will be either 'Cmd+R' or 'Ctrl+R' depending on platform
      expect(result).toMatch(/^(Cmd|Ctrl)\+R$/)
    })

    it('should format key with multiple modifiers', () => {
      const result = formatShortcut({ key: 's', meta: true, shift: true }, true)
      expect(result).toMatch(/^(Cmd|Ctrl)\+Shift\+S$/)
    })

    it('should format for non-display (lowercase)', () => {
      expect(formatShortcut({ key: 'R' }, false)).toBe('r')
      expect(formatShortcut({ key: 'A', meta: true }, false)).toBe('meta+a')
    })
  })
})

describe('SOAP Text Extraction', () => {
  const extractTextFromSoap = (soap: {
    subjective?: { presentIllness?: string }
    objective?: { physicalExam?: string }
    assessment?: { diagnosis?: string }
    plan?: { treatment?: string }
  }): string => {
    const sections: string[] = []

    if (soap.subjective?.presentIllness) {
      sections.push(`主観的情報: ${soap.subjective.presentIllness}`)
    }
    if (soap.objective?.physicalExam) {
      sections.push(`客観的情報: ${soap.objective.physicalExam}`)
    }
    if (soap.assessment?.diagnosis) {
      sections.push(`評価: ${soap.assessment.diagnosis}`)
    }
    if (soap.plan?.treatment) {
      sections.push(`計画: ${soap.plan.treatment}`)
    }

    return sections.join('\n')
  }

  it('should extract text from all SOAP sections', () => {
    const soap = {
      subjective: { presentIllness: '頭痛が続いている' },
      objective: { physicalExam: '血圧正常' },
      assessment: { diagnosis: '緊張型頭痛' },
      plan: { treatment: '鎮痛薬投与' },
    }

    const result = extractTextFromSoap(soap)

    expect(result).toContain('主観的情報: 頭痛が続いている')
    expect(result).toContain('客観的情報: 血圧正常')
    expect(result).toContain('評価: 緊張型頭痛')
    expect(result).toContain('計画: 鎮痛薬投与')
  })

  it('should handle partial SOAP data', () => {
    const soap = {
      subjective: { presentIllness: '頭痛' },
      assessment: { diagnosis: '緊張型頭痛' },
    }

    const result = extractTextFromSoap(soap)

    expect(result).toContain('主観的情報: 頭痛')
    expect(result).toContain('評価: 緊張型頭痛')
    expect(result).not.toContain('客観的情報')
    expect(result).not.toContain('計画')
  })

  it('should handle empty SOAP data', () => {
    const result = extractTextFromSoap({})
    expect(result).toBe('')
  })
})
