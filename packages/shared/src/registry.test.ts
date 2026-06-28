import { describe, expect, it, vi } from "vitest";
import { fetchAllRegistryPairs } from "./registry";

describe("fetchAllRegistryPairs", () => {
  it("paginates registry reads in batches of 50", async () => {
    const readContract = vi.fn();
    readContract.mockResolvedValueOnce(75n);
    readContract.mockResolvedValueOnce([
      {
        tokenAddress: "0x1111111111111111111111111111111111111111",
        confidentialTokenAddress: "0x2222222222222222222222222222222222222222",
        isValid: true,
      },
    ]);
    readContract.mockResolvedValueOnce([
      {
        tokenAddress: "0x3333333333333333333333333333333333333333",
        confidentialTokenAddress: "0x4444444444444444444444444444444444444444",
        isValid: true,
      },
    ]);

    const publicClient = { readContract } as never;
    const pairs = await fetchAllRegistryPairs(publicClient, "sepolia");

    expect(pairs).toHaveLength(2);
    expect(readContract).toHaveBeenCalledTimes(3);
    expect(readContract.mock.calls[1][0].functionName).toBe("getTokenConfidentialTokenPairsSlice");
    expect(readContract.mock.calls[1][0].args).toEqual([0n, 50n]);
    expect(readContract.mock.calls[2][0].args).toEqual([50n, 75n]);
    expect(readContract.mock.calls[0][0].functionName).toBe("getTokenConfidentialTokenPairsLength");
  });

  it("filters out revoked pairs", async () => {
    const readContract = vi.fn();
    readContract.mockResolvedValueOnce(1n);
    readContract.mockResolvedValueOnce([
      {
        tokenAddress: "0x1111111111111111111111111111111111111111",
        confidentialTokenAddress: "0x2222222222222222222222222222222222222222",
        isValid: false,
      },
    ]);

    const publicClient = { readContract } as never;
    const pairs = await fetchAllRegistryPairs(publicClient, "sepolia");
    expect(pairs).toHaveLength(0);
  });
});
