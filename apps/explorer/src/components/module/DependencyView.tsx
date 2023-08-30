// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { type ModuleType } from '~/components/module/PkgModulesWrapper';
import { DependenciesCard } from '~/pages/object-result/views/DependenciesCard';

interface Props {
	id?: string;
	modules: ModuleType[];
	versionInfo?: VersionInfo;
	selectedModuleName: string;
	verified?: boolean;
}

export interface VersionInfo {
	network: string;
	packageId: string;
	modules: Array<DependencyModule>;
}

export interface DependencyModule {
	module: string;
	dependencies?: Array<Dependency>;
}

export interface Dependency {
	packageId: string;
	upgradeCapId?: string;
	current?: SmallPackageInfo;
	latest?: SmallPackageInfo;
}

export interface SmallPackageInfo {
	packageId: string;
	version: number;
}

function DependencyView({ id, modules, versionInfo, selectedModuleName }: Props) {
	const selectedModule = versionInfo?.modules.find(
		(element) => element.module === selectedModuleName,
	);
	return (
		<>
			<div className="title mb-2 ml-2 mt-1 break-words font-medium">
				Module( <b>{selectedModuleName}</b> ) has <b>{selectedModule?.dependencies?.length}</b>{' '}
				{selectedModule?.dependencies?.length === 1 ? <>dependency.</> : <>dependencies.</>}
			</div>
			<div data-testid="dependencies-card" className="flex items-stretch">
				<DependenciesCard inputs={selectedModule?.dependencies} defaultOpen />
			</div>
		</>
	);
}

export default DependencyView;
