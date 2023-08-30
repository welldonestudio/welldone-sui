// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type Dependency, type SmallPackageInfo } from '~/components/module/DependencyView';
import { ProgrammableTxnBlockCard } from '~/components/transactions/ProgTxnBlockCard';
import { ObjectLink } from '~/ui/InternalLink';
import { Text } from '../../../../../ui/src/Text';
import { TransactionBlockCardSection } from '~/ui/TransactionBlockCard';
const DEFAULT_ITEMS_TO_SHOW = 10;

interface DependenciesCardProps {
	inputs?: Dependency[];
	itemsLabel?: string;
	defaultOpen?: boolean;
}
interface SmallCardSectionProps {
	title: string;
	smallPackageInfo: SmallPackageInfo;
}

// function SmallCardSection({ packageId, version }: SmallPackageInfo) {
function SmallCardSection({ title, smallPackageInfo }: SmallCardSectionProps) {
	return (
		<TransactionBlockCardSection key={1} title={' '} defaultOpen>
			<div data-testid="small-inputs-card-content" className="flex flex-col gap-2">
				{Object.entries(smallPackageInfo).map(([key, value]) => {
					let renderValue;
					const stringValue = String(value);

					if (key === 'packageId' && value) {
						renderValue = <ObjectLink objectId={stringValue} />;
					} else if (!value) {
						renderValue = '-';
					} else {
						renderValue = stringValue;
					}

					return (
						<div key={key} className="flex items-start justify-between">
							<Text variant="pBody/medium" color="steel-dark">
								{key}
							</Text>

							<div className="min-w-[140px] break-all text-right">
								<Text variant="pBody/medium" color="steel-darker">
									{renderValue}
								</Text>
							</div>
						</div>
					);
				})}
			</div>
		</TransactionBlockCardSection>
	);
}

export function DependenciesCard({
	inputs,
	itemsLabel = 'Dependencies',
	defaultOpen = false,
}: DependenciesCardProps) {
	if (!inputs?.length) {
		return null;
	}
	let packageId = '';

	const expandableItems = inputs.map((input, index) => (
		<TransactionBlockCardSection
			key={index}
			title={`Dependency ${index}`}
			defaultOpen={defaultOpen}
		>
			<div data-testid="inputs-card-content" className="flex flex-col gap-2">
				{Object.entries(input).map(([key, value]) => {
					let renderValue;
					const stringValue = String(value);

					if (key === 'packageId') {
						packageId = stringValue;
						renderValue = <ObjectLink objectId={stringValue} />;
					} else if (key === 'upgradeCapId') {
						if (value) {
							renderValue = <ObjectLink objectId={stringValue} />;
						} else {
							if (packageId.includes('0'.repeat(63))) {
								renderValue = '-';
							} else {
								renderValue = 'Deleted';
							}
						}
					} else if (key === 'current' || key === 'latest') {
						renderValue = (
							<SmallCardSection title={key} smallPackageInfo={value as SmallPackageInfo} />
						);
					} else {
						renderValue = stringValue;
					}

					return (
						<div key={key} className="flex items-start justify-between">
							<Text variant="pBody/medium" color="steel-dark">
								{key}
							</Text>

							<div className="max-w-[66%] break-all text-right">
								<Text variant="pBody/medium" color="steel-darker">
									{renderValue}
								</Text>
							</div>
						</div>
					);
				})}
			</div>
		</TransactionBlockCardSection>
	));

	return (
		<ProgrammableTxnBlockCard
			items={expandableItems}
			itemsLabel={itemsLabel}
			defaultItemsToShow={DEFAULT_ITEMS_TO_SHOW}
			noExpandableList={defaultOpen}
		/>
	);
}
