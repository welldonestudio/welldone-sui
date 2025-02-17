// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useSuiClient } from '@mysten/dapp-kit';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

const MAX_PAGE_SIZE = 10;

export function useGetDynamicFields(parentId: string, maxPageSize = MAX_PAGE_SIZE) {
	const client = useSuiClient();
	return useInfiniteQuery(
		['dynamic-fields', parentId],
		({ pageParam = null }) =>
			client.getDynamicFields({
				parentId: normalizeSuiAddress(parentId),
				cursor: pageParam,
				limit: maxPageSize,
			}),
		{
			enabled: !!parentId,
			getNextPageParam: ({ nextCursor, hasNextPage }) => (hasNextPage ? nextCursor : null),
		},
	);
}
