import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { sendMail } from '@src/common/mail';
import { TemplateEmail } from '@src/common/mail/template';
import { PrismaService } from '@src/prisma/prisma.service';
import { faucetUrl, GET_CONFIG } from '@src/utils';
import erc20Transfer from '@src/wallets/smartAccount/erc20Transfer';
import transfer from '@src/wallets/smartAccount/transfer';

@Injectable()
export class EventsService {
  constructor(private eventEmitter: EventEmitter2) { }
  private prisma = new PrismaService();
  private readonly logger = new Logger(EventsService.name);

  @OnEvent('transfer', { async: true })
  async transfer(payload: { userId: string; toAddress: string; amount: string; usePaymaster: boolean }) {
    // console.log('payload', payload);
    this.logger.log('transferring...');
    const { userId, toAddress, amount, usePaymaster } = payload;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        org: true,
      },
    });
    const { email, org: { id: orgId }, } = user;
    const config = await GET_CONFIG(email, orgId);
    // console.log("config", config);
    const withPM = Boolean(usePaymaster || false);
    try {
      const res = await transfer(config, toAddress, amount, withPM);
      await this.prisma.transaction.create({
        data: {
          ...res,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      this.eventEmitter.emit('sendEmail', {
        subject: 'Transfer Completed',
        message: `Congrats! Your transfer completed. View on the Blockchain below:<br/>
        Transaction Hash: <strong>${res.txHash}</strong>`,
        to: { name: user.username || 'there!', email: user.email },
        action: [
          { link: `https://goerli.etherscan.io/tx/${res.txHash}`, text: 'View on Transaction' },
          { link: `https://goerli.etherscan.io/address/${user.accAddress}#internaltx`, text: 'View on Sender' },
          { link: `https://goerli.etherscan.io/address/${toAddress}#internaltx`, text: 'View on Receiver' },
        ],
        image: user.org.picture,
        from: { name: user.org.name, email: user.org.email },
      });
    } catch (error) {
      this.eventEmitter.emit('sendEmail', {
        subject: 'Transfer Failed!',
        message: `Sorry! Your transfer failed.<br/><strong>Please <a href="${faucetUrl}">Top Off</a> your account with more ETH before trying your transfer again.</strong>`,
        to: { name: user.username || 'there!', email: user.email },
        image: user.org.picture,
        from: { name: user.org.name, email: user.org.email },
      });
    }
  }

  @OnEvent('erc20Transfer', { async: true })
  async erc20Transfer(payload: { userId: string; token: string; toAddress: string; amount: string; usePaymaster: boolean }) {
    this.logger.log('erc20Transferring...');
    const { token, userId, toAddress, amount, usePaymaster } = payload;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        org: true,
      },
    });

    const { email, org: { id: orgId }, } = user;
    const config = await GET_CONFIG(email, orgId);
    const withPM = Boolean(usePaymaster || false);
    try {
      const res = await erc20Transfer(config, token, toAddress, amount, withPM);
      await this.prisma.transaction.create({
        data: {
          ...res,
          user: {
            connect: {
              id: userId,
            },
          },
        }
      });

      this.eventEmitter.emit('sendEmail', {
        subject: 'ERC20 Transfer Completed',
        message: `Congrats! Your ERC20 transfer completed. Here are the details:<br/>
      op: ${res.op}<br/>
      uoHash: ${res.uoHash}<br/>
      txHash: ${res.txHash}`,
        to: { name: user.username || 'there!', email: user.email },
        action: [
          { link: `https://goerli.etherscan.io/tx/${res.txHash}`, text: 'View on Transaction' },
          { link: `https://goerli.etherscan.io/address/${user.accAddress}#internaltx`, text: 'View on Sender' },
          { link: `https://goerli.etherscan.io/address/${toAddress}#internaltx`, text: 'View on Receiver' },
        ], image: user.org.picture,
        from: { name: user.org.name, email: user.org.email },
      });
    } catch (error) {
      this.eventEmitter.emit('sendEmail', {
        subject: 'Transfer Failed!',
        message: `Sorry! Your transfer failed.<br/><strong>Please <a href="${faucetUrl}">Top Off</a> your account with more ETH before trying your transfer again.</strong>`,
        to: { name: user.username || 'there!', email: user.email },
        image: user.org.picture,
        from: { name: user.org.name, email: user.org.email },
      });
    }
  }

  @OnEvent('sendEmail', { async: true })
  async sendEmail(payload: TemplateEmail) {
    this.logger.log('sending Email...');
    await sendMail(payload);
  }
}
