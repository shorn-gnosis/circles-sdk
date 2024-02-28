import { V1TokenCalls } from '@circles-sdk/abi-encoder/dist';
import {ethers, TransactionReceipt} from 'ethers';
import { Provider } from '@circles-sdk/providers/src/provider.js';
import {
  ParsedV1HubEvent,
  ParsedV1TokenEvent,
  V1HubEvent,
  V1HubEvents, V1TokenEvent,
  V1TokenEvents
} from "@circles-sdk/abi-decoder/dist";
import {Observable} from "../observable";

export class V1Token {
  readonly address: string;
  private readonly provider: Provider;

  private readonly eventDecoder: V1TokenEvents = new V1TokenEvents();

  public readonly events: Observable<ParsedV1TokenEvent<V1TokenEvent>>;
  private readonly emitEvent: (event: ParsedV1TokenEvent<V1TokenEvent>) => void;

  constructor(provider: Provider, address: string) {
    this.provider = provider;
    this.address = address;

    const eventsObservable = Observable.create<ParsedV1TokenEvent<V1TokenEvent>>();
    this.events = eventsObservable.property;
    this.emitEvent = (e) => eventsObservable.emit(e);
  }

  balanceOf = async (account: string): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.balanceOf(account)
    }));

  transfer = async (dst: string, wad: bigint): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.transfer(dst, wad)
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transfer failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  getMintableAmount = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.look()
    }));

  approve = async (spender: string, amount: bigint): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.approve(spender, amount)
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Approve failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  allowance = async (owner: string, spender: string): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.allowance(owner, spender)
    }));

  decreaseAllowance = async (spender: string, subtractedValue: bigint): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.decreaseAllowance(spender, subtractedValue)
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Decrease allowance failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  increaseAllowance = async (spender: string, addedValue: bigint): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.increaseAllowance(spender, addedValue)
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Increase allowance failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  totalSupply = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.totalSupply()
    }));

  transferFrom = async (sender: string, recipient: string, amount: bigint): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.transferFrom(sender, recipient, amount)
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transfer from failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  decimals = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.decimals()
    }));

  name = async (): Promise<string> =>
    await this.provider.call({
      to: this.address,
      data: V1TokenCalls.tokenName()
    });

  symbol = async (): Promise<string> =>
    await this.provider.call({
      to: this.address,
      data: V1TokenCalls.symbol()
    });

  currentIssuance = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.currentIssuance()
    }));

  findInflationOffset = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.findInflationOffset()
    }));

  hub = async (): Promise<string> =>
    await this.provider.call({
      to: this.address,
      data: V1TokenCalls.hub()
    });

  hubDeployedAt = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.hubDeployedAt()
    }));

  lastTouched = async (): Promise<bigint> =>
    BigInt(await this.provider.call({
      to: this.address,
      data: V1TokenCalls.lastTouched()
    }));

  stop = async (): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.stop()
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Stop failed');
    }
    return receipt;
  }

  stopped = async (): Promise<boolean> =>
    await this.provider.call({
      to: this.address,
      data: V1TokenCalls.stopped()
    }) === '0x0000000000000000000000000000000000000000000000000000000000000001';

  update = async (): Promise<ethers.TransactionReceipt> => {
    const tx = await this.provider.sendTransaction({
      to: this.address,
      data: V1TokenCalls.update()
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error('Update failed');
    }
    this.emitEvents(receipt);
    return receipt;
  }

  private emitEvents = (receipt: TransactionReceipt) => receipt.logs.forEach(log => {
    const event = this.eventDecoder.decodeEventData({
      topics: log.topics.map(a => a),
      data: log.data
    });
    if (event) {
      this.emitEvent(event);
    }
  });
}