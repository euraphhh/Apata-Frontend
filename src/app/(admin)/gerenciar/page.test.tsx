import { render,act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";

import AdminPage from "./page";


const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

const { spyApi, listPetsMock } = vi.hoisted(() => ({
  spyApi: vi.fn(),
  listPetsMock: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  verifyToken: spyApi,
  listPets: listPetsMock,
}))


const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPage />
    </QueryClientProvider>,
  );

};

describe('Admin page session', () => {
  beforeEach(()=>{
      vi.clearAllMocks()
      vi.clearAllTimers()
      vi.resetAllMocks()
  })
  it('should load pets when session is valid', async () => {
      spyApi.mockResolvedValue(undefined)

      vi.useFakeTimers()

      renderPage()

      await act(async () => {
          await Promise.resolve()
      })

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(listPetsMock).toHaveBeenCalledTimes(1)
  })

  it('should not load pets when session is invalid', async () => {
      spyApi.mockRejectedValue(new Error('failed'))

      vi.useFakeTimers()

      renderPage()

      await act(async () => {
          await Promise.resolve()
      })

      expect(mockRedirect).toHaveBeenCalledWith('/painel')
      expect(listPetsMock).not.toHaveBeenCalled()
  })
  it('should load pets when session is valid', async () => {
      spyApi.mockResolvedValueOnce(undefined)
      spyApi.mockRejectedValueOnce(new Error("failed"))
      vi.useFakeTimers()

      renderPage()

      await act(async () => {
          await Promise.resolve()
      })

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(listPetsMock).toHaveBeenCalledTimes(1)
  })
  it('should redirect when the session expires after one hour', async () => {
    spyApi.mockResolvedValueOnce(undefined)
    spyApi.mockRejectedValueOnce(new Error('failed'))

    vi.useFakeTimers()

    renderPage()


    await act(async () => {
      await Promise.resolve()
    })

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(listPetsMock).toHaveBeenCalledTimes(1)

    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
    })

    expect(mockRedirect).toHaveBeenCalledWith('/painel')
    expect(listPetsMock).toHaveBeenCalledTimes(1)
  })
})