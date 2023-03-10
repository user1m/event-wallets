import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User, UserUncheckedCreateInput, UserWhereUniqueInput } from 'prisma/graphql/generated';
import { CreateUserInput, ERC20TransferInput, TransferInput, TransferOwnerInput, UserNetworkInput } from './inputs';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @Mutation(() => User)
  _createUser(@Args('input') input: CreateUserInput) {
    return this.service.createUser(input);
  }

  @Mutation(() => User)
  _confirmUser(@Args('input') input: UserWhereUniqueInput) {
    return this.service.createWallet(input);
  }

  @Query(() => Number)
  _getWalletBalance(@Args('input') input: UserNetworkInput) {
    return this.service.getBalance(input);
  }

  // @Query(() => Number)
  // _test(@Args('input') input: UserWhereUniqueInput) {
  //   return this.service.getBalance(input);
  // }

  @Mutation(() => String)
  _transfer(@Args('input') input: TransferInput) {
    return this.service.transfer(input);
  }

  @Mutation(() => String)
  _transferERC20Token(@Args('input') input: ERC20TransferInput) {
    return this.service.erc20Transfer(input);
  }

  @Mutation(() => String)
  _transferOwner(@Args('input') input: TransferOwnerInput) {
    return this.service.transferOwner(input);
  }

  // @Query(() => [Wallet], { name: 'wallets' })
  // findAll() {
  //   return this.service.findAll();
  // }

  // @Query(() => Wallet, { name: 'wallet' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.service.findOne(id);
  // }

  // @Mutation(() => Wallet)
  // updateWallet(@Args('updateWalletInput') updateWalletInput: UpdateWalletInput) {
  //   return this.service.update(updateWalletInput.id, updateWalletInput);
  // }

  // @Mutation(() => Wallet)
  // removeWallet(@Args('id', { type: () => Int }) id: number) {
  //   return this.service.remove(id);
  // }
}
