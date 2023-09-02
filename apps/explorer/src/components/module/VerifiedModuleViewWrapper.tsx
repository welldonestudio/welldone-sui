// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { type Dispatch, type SetStateAction } from 'react';

import ModuleView from '~/components/module/ModuleView';
import { type ModuleType, type PackageFile } from '~/components/module/PkgModulesWrapper';
import VerifyRegister from '~/components/module/VerifyRegister';

interface VerifiedModuleViewWrapperProps {
	id?: string;
	selectedModuleName: string;
	modules: ModuleType[];
	packageFiles: PackageFile[];
	verified: boolean;
	setVerified: Dispatch<SetStateAction<boolean>>;
}

function VerifiedModuleViewWrapper({
	id,
	selectedModuleName,
	modules,
	packageFiles,
	verified,
	setVerified,
}: VerifiedModuleViewWrapperProps) {
	const selectedModuleData = modules.find(([name]) => name === selectedModuleName);
	if (!selectedModuleData) {
		return null;
	}
	const [name] = selectedModuleData;

	console.log(`@@@ packageFiles`, packageFiles);
	const reg = new RegExp(`module\\s+\\w+::${name}\\s+{([\\s\\S]*?)^}`, 'gm');
	const code =
		packageFiles.find((element: PackageFile) => reg.test(element.content))?.content || '';

	return verified ? (
		<ModuleView id={id} name={name} code={code} />
	) : (
		<div className="text-subtitleMedium mb-4 mt-2 break-words">
			<VerifyRegister
				id={id}
				modules={modules}
				verified={verified}
				setVerified={setVerified}
				packageFiles={packageFiles}
			/>
		</div>
	);
}

export default VerifiedModuleViewWrapper;
