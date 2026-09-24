import { useSession } from "@/hooks/useSession";
import {  renderHook,act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach,afterEach } from "vitest";

const { spyApi } = vi.hoisted(() => ({
  spyApi: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  verifyToken: spyApi,
}))

describe('useSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should check session every hour', async () => {
        spyApi.mockResolvedValue(undefined)

        const { result } = renderHook(() => useSession())

        await act(async () => {
        await Promise.resolve()
        })

        expect(result.current).toBe(true)
        expect(spyApi).toHaveBeenCalledTimes(1)

        await act(async () => {
        await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
        })

        expect(spyApi).toHaveBeenCalledTimes(2)

        await act(async () => {
        await vi.advanceTimersByTimeAsync(60 * 60 * 3000)
        })
        expect(spyApi).toHaveBeenCalledTimes(5)
    })
    it('should keep the session invalid when session checks fail', async () => {
        spyApi.mockRejectedValue(new Error("failed"))

        const { result } = renderHook(() => useSession())

        await act(async () => {
        await Promise.resolve()
        })

        expect(result.current).toBe(false)
        expect(spyApi).toHaveBeenCalledTimes(1)

        await act(async () => {
        await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
        })
        expect(result.current).toBe(false)
        expect(spyApi).toHaveBeenCalledTimes(2)

        await act(async () => {
        await vi.advanceTimersByTimeAsync(60 * 60 * 3000)
        })
        expect(result.current).toBe(false)
        expect(spyApi).toHaveBeenCalledTimes(5)
    })
    it('should recheck the session after one hour', async () => {
        spyApi.mockRejectedValueOnce(new Error("failed"))
        spyApi.mockResolvedValueOnce(undefined)
        const { result } = renderHook(() => useSession())

        await act(async () => {
            await Promise.resolve()
        })

        expect(result.current).toBe(false)
        expect(spyApi).toHaveBeenCalledTimes(1)

        await act(async () => {
        await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
        })
        expect(result.current).toBe(true)
        expect(spyApi).toHaveBeenCalledTimes(2)

    })
})