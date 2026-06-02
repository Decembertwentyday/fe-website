export interface ISwapExactTokensForTokens {
  to: string;
  args: {
    amountIn: string;
    amountOutMin: string;
    path: string[];
    to: string;
    deadline: string;
  };
}
export function swapExactTokensForTokens({ to, args }: ISwapExactTokensForTokens): string {
  return JSON.stringify({
    op: 'call',
    data: {
      to: to,
      function: 'swapExactTokensForTokens',
      args: args,
    },
  });
}

export interface ISwapTokensForExactTokens {
  to: string;
  args: {
    amountInMax: string;
    amountOut: string;
    path: string[];
    to: string;
    deadline: string;
  };
}

export function swapTokensForExactTokens({ to, args }: ISwapTokensForExactTokens): string {
  return JSON.stringify({
    op: 'call',
    data: {
      to: to,
      function: 'swapTokensForExactTokens',
      args: args,
    },
  });
}

export interface IApproveFacet {
  to: string;
  args: string[];
}

export function approveFacet({ to, args }: IApproveFacet): string {
  return JSON.stringify({
    op: 'call',
    data: {
      to: to,
      function: 'approve',
      args, //['${to}', '57896044618658097711785492504343953926634992332820282019728792003956564819968'],
    },
  });
}

export interface ITransferFacet {
  to: string;
  args: {
    to: string;
    amount: string;
  };
}

export function transferFacet_payload({ to, args }: ITransferFacet): string {
  return JSON.stringify({
    op: 'call',
    data: { to, function: 'transfer', args },
  });
}
