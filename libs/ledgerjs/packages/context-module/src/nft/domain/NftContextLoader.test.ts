import { LoaderOptions } from "../../shared/model/LoaderOptions";
import { Transaction } from "../../shared/model/Transaction";
import { NftDataSource } from "../data/NftDataSource";
import { NftContextLoader } from "./NftContextLoader";

describe("NftContextLoader", () => {
  const spyGetNftInfosPayload = jest.fn();
  const spyGetPluginPayload = jest.fn();
  let mockDataSource: NftDataSource;
  let loader: NftContextLoader;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockDataSource = {
      getNftInfosPayload: spyGetNftInfosPayload,
      getSetPluginPayload: spyGetPluginPayload,
    };
    loader = new NftContextLoader(mockDataSource);
  });

  describe("load function", () => {
    it("should return an empty array if no dest", async () => {
      const options = {} as LoaderOptions;
      const transaction = { to: undefined, data: "0x01" } as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if undefined data", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: undefined,
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if empty data", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x",
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an empty array if selector not supported", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b20000000000000",
      } as unknown as Transaction;

      const result = await loader.load(transaction, options);

      expect(result).toEqual([]);
    });

    it("should return an error when no plugin response", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b30000000000000",
      } as unknown as Transaction;
      spyGetPluginPayload.mockResolvedValueOnce(undefined);

      const result = await loader.load(transaction, options);

      expect(result).toEqual([
        expect.objectContaining({
          type: "error" as const,
          error: new Error("[ContextModule] NftLoader: unexpected empty response"),
        }),
      ]);
    });

    it("should return an error when no nft data response", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b30000000000000",
      } as unknown as Transaction;
      spyGetPluginPayload.mockResolvedValueOnce("payload1");
      spyGetNftInfosPayload.mockResolvedValueOnce(undefined);

      const result = await loader.load(transaction, options);

      expect(result).toEqual([
        expect.objectContaining({
          type: "error" as const,
          error: new Error("[ContextModule] NftLoader: no nft metadata"),
        }),
      ]);
    });

    it("should return a response", async () => {
      const options = {} as LoaderOptions;
      const transaction = {
        to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        data: "0x095ea7b30000000000000",
      } as unknown as Transaction;
      spyGetPluginPayload.mockResolvedValueOnce("payload1");
      spyGetNftInfosPayload.mockResolvedValueOnce("payload2");

      const result = await loader.load(transaction, options);

      expect(result).toEqual([
        {
          type: "setPlugin" as const,
          payload: "payload1",
        },
        {
          type: "provideNFTInformation" as const,
          payload: "payload2",
        },
      ]);
    });
  });
});
