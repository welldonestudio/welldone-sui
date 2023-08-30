// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useQuery } from '@tanstack/react-query';

export function useGetVerifiedCode(network: string, id: any, module: any) {
	const url = 'https://api.welldonestudio.io/compiler/sui-deploy-histories/latest-module';
	const params = new URLSearchParams({
		chainId: network.toLowerCase(),
		packageId: id,
		module: module,
	});
	return useQuery({
		queryKey: ['verified-code', id, url, params],
		queryFn: async () => {
			await fetch(`${url}?${params}`, { method: 'GET' });
		},
		enabled: true,
	});
}
