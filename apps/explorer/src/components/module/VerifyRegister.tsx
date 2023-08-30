// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Button, Text } from '@mysten/ui';
import { type Dispatch, type SetStateAction, useState } from 'react';
import FileUpload from 'react-material-file-upload';

import { type ModuleType, PackageFile } from '~/components/module/PkgModulesWrapper';
import { useNetwork } from '~/context';
import { useWdsBackend } from '~/hooks/useWdsBackend';
import { Link } from '~/ui/Link';

export interface VerifyCheckResponse {
	chainId: string;
	packageId: string;
	isVerified: boolean;
	isRemix: boolean;
	isSrcUploaded: boolean;
	verifiedSrcUrl: string;
}
interface VerifyRegisterProps {
	id?: string;
	modules?: ModuleType[];
	packageFiles: PackageFile[];
	verified: boolean;
	setVerified: Dispatch<SetStateAction<boolean>>;
}
interface VerificationResponse {
	chainId: string;
	packageId: string;
	isVerified: boolean;
	moduleResults: ModuleResult[];
	isRemix?: boolean;
	errMsg?: string;
}
interface ModuleResult {
	packageId: string;
	moduleName: string;
	requestedTime: number;
	isVerified: boolean;
	onChainByteCode: string;
	offChainByteCode: string;
}

const CHAIN_NAME = 'sui';

function VerifyRegister({ id, modules, verified, setVerified }: VerifyRegisterProps) {
	const modulenames = modules?.map(([name]) => name);
	// const [searchParams, setSearchParams] = useSearchParamsMerged();
	// const [query, setQuery] = useState('');
	const [query] = useState('');
	const [version, setVersion] = useState<string>('v1.3.0');
	const [isLoadingWithoutFile, setIsLoadingWithoutFile] = useState<boolean>(false);
	const [isLoadingWithFile, setIsLoadingWithFile] = useState<boolean>(false);
	const [errMsgWithoutFile, setErrMsgWithoutFile] = useState<string>('');
	const [errMsgWithFile, setErrMsgWithFile] = useState<string>('');
	const [files, setFiles] = useState<File[]>([]);
	const [network] = useNetwork();
	const wdsBack = useWdsBackend();
	const isExecuteDisabled = isLoadingWithoutFile || isLoadingWithFile || version === '';
	if (!modulenames) {
		return null;
	}

	console.log(`@@@ files`, files);

	// const selectedModule =
	// 	searchParams.get('module') && modulenames?.includes(searchParams.get('module')!)
	// 		? searchParams.get('module')!
	// 		: modulenames[0];
	//

	const welldoneCodeHref = 'https://docs.welldonestudio.io/code/getting-started';
	const remixHref = 'https://remix.ethereum.org/';

	const verifyWithoutFile = () => {
		setIsLoadingWithoutFile(true);
		wdsBack('GET', 'verification/sui/package-remix', null, {
			chainId: network.toLowerCase(),
			packageId: id,
		})
			.then((res) => {
				const verificationRes = res as VerificationResponse;
				console.log('remix verificationRes', verificationRes);
				setVerified(verificationRes.isVerified);
				setIsLoadingWithoutFile(false);

				if (verificationRes.errMsg) {
					setErrMsgWithoutFile(verificationRes.errMsg);
				}
			})
			.catch((e) => {
				console.log('@@@ error !!!');
				console.error(e);
				setIsLoadingWithoutFile(false);
				setErrMsgWithoutFile(e.toString());
			});
	};
	const verifyWithFile = () => {
		setIsLoadingWithFile(true);
		const curDate = new Date();
		const body = {
			chainName: CHAIN_NAME,
			chainId: network.toLowerCase(),
			compilerVersion: version,
			packageId: id,
			timestamp: curDate.getTime().toString(),
			fileType: 'move',
			zipFile: files[0],
		};
		wdsBack('POST', 's3Proxy/verification-src/sui', body)
			.then(() => {
				wdsBack('GET', 'verification/sui/package', null, {
					chainId: network.toLowerCase(),
					packageId: id,
					timestamp: curDate.getTime().toString(),
				})
					.then((res) => {
						const verificationRes = res as VerificationResponse;
						console.log('file verificationRes', verificationRes);
						setVerified(verificationRes.isVerified);
						setIsLoadingWithFile(false);

						if (verificationRes.errMsg) {
							setErrMsgWithFile(verificationRes.errMsg);
							return;
						}
					})
					.catch((e) => {
						console.error(e);
						setIsLoadingWithFile(false);
						setErrMsgWithFile(e.toString());
					});
			})
			.catch((e) => {
				console.error(e);
				setIsLoadingWithFile(false);
				setErrMsgWithFile(e.toString());
			});
	};
	const filteredModules =
		query === ''
			? modulenames
			: modules
					?.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
					.map(([name]) => name);
	if (!filteredModules) {
		return null;
	}
	const onFileChange = (files: File[]) => {
		setFiles(files);
	};
	// const submitSearch = useCallback(() => {
	// 	if (filteredModules?.length === 1) {
	// 		setSearchParams({
	// 			module: filteredModules[0],
	// 		});
	// 	}
	// }, [filteredModules, setSearchParams]);
	// const onChangeModule = (newModule: string) => {
	// 	setSearchParams({
	// 		module: newModule,
	// 	});
	// };
	return (
		<div className="flex flex-col gap-5 border-b border-gray-45 md:flex-row md:flex-nowrap">
			{/*<div className="w-full md:w-1/5">*/}
			{/*<Combobox value={selectedModule} onChange={onChangeModule}>*/}
			{/*	<div className="mt-2.5 flex w-full justify-between rounded-md border border-gray-50 py-1 pl-3 placeholder-gray-65 shadow-sm">*/}
			{/*		<Combobox.Input*/}
			{/*			onChange={(event) => setQuery(event.target.value)}*/}
			{/*			displayValue={() => query}*/}
			{/*			placeholder="Search"*/}
			{/*			className="w-full border-none"*/}
			{/*		/>*/}
			{/*		<button onClick={submitSearch} className="border-none bg-inherit pr-2" type="submit">*/}
			{/*			<Search24 className="h-4.5 w-4.5 cursor-pointer fill-steel align-middle text-gray-60" />*/}
			{/*		</button>*/}
			{/*	</div>*/}
			{/*	<Combobox.Options className="absolute left-0 z-10 flex h-fit max-h-verticalListLong w-full flex-col gap-1 overflow-auto rounded-md bg-white px-2 pb-5 pt-3 shadow-moduleOption md:left-auto md:w-1/6">*/}
			{/*		{filteredModules.length > 0 ? (*/}
			{/*			<div className="ml-1.5 pb-2 text-caption font-semibold uppercase text-gray-75">*/}
			{/*				{filteredModules.length}*/}
			{/*				{filteredModules.length === 1 ? ' Result' : ' Results'}*/}
			{/*			</div>*/}
			{/*		) : (*/}
			{/*			<div className="px-3.5 pt-2 text-center text-body italic text-gray-70">*/}
			{/*				No results*/}
			{/*			</div>*/}
			{/*		)}*/}
			{/*		{filteredModules.map((name) => (*/}
			{/*			<Combobox.Option key={name} value={name} className="list-none md:min-w-fit">*/}
			{/*				{({ active }) => (*/}
			{/*					<button*/}
			{/*						type="button"*/}
			{/*						className={clsx(*/}
			{/*							'mt-0.5 block w-full cursor-pointer rounded-md border px-1.5 py-2 text-left text-body',*/}
			{/*							active*/}
			{/*								? 'border-transparent bg-sui/10 text-gray-80'*/}
			{/*								: 'border-transparent bg-white font-medium text-gray-80',*/}
			{/*						)}*/}
			{/*					>*/}
			{/*						{name}*/}
			{/*					</button>*/}
			{/*				)}*/}
			{/*			</Combobox.Option>*/}
			{/*		))}*/}
			{/*	</Combobox.Options>*/}
			{/*</Combobox>*/}
			{/*<div className="h-verticalListShort overflow-auto pt-3 md:h-verticalListLong">*/}
			{/*	<VerticalList>*/}
			{/*		{modulenames.map((name) => (*/}
			{/*			<div key={name} className="mx-0.5 mt-0.5 md:min-w-fit">*/}
			{/*				<ListItem active={selectedModule === name} onClick={() => onChangeModule(name)}>*/}
			{/*					{name}*/}
			{/*				</ListItem>*/}
			{/*			</div>*/}
			{/*		))}*/}
			{/*	</VerticalList>*/}
			{/*</div>*/}
			{/*</div>*/}
			<div className="h-full grow overflow-auto border-gray-45 pt-5 md:pl-7">
				{verified ? (
					<div className="text-subtitleMedium mb-4 mt-1 break-words">
						✔︎ <span className="font-bold">This code is verified.</span>
					</div>
				) : (
					<>
						{verified ? (
							<div className="text-subtitleMedium mb-4 mt-1 break-words">
								<span className="font-bold">Verification Success !! ✅</span>
							</div>
						) : (
							<>
								<div className="text-subtitleMedium mb-2 mt-1 break-words">
									❗<span className="font-bold">Not yet verified.</span>
								</div>
								<div className="flex items-center gap-4">
									<Text variant="body/medium" color="steel-dark">
										Please select Compiler Version :
									</Text>

									<select
										className="form-select rounded-md border border-gray-45 px-3 py-2 pr-8 text-bodySmall font-medium leading-[1.2] text-steel-dark shadow-button"
										value={version}
										onChange={(e) => {
											setVersion(e.target.value);
										}}
									>
										<option value="">[Please Select]</option>
										{/*<option value="v1.3.1">v1.3.1+commit.a2af559</option>*/}
										<option value="v1.3.0">v1.3.0+commit.434eb19</option>
										{/*<option value="v1.2.1">v1.2.1+commit.8b68151</option>*/}
										{/*<option value="v1.2.0">v1.2.0+commit.7ef210c</option>*/}
										{/*<option value="v1.1.1">v1.1.1+commit.536412e</option>*/}
										{/*<option value="v1.1.0">v1.1.0+commit.4c9993f</option>*/}
										{/*<option value="v1.0.8">v1.0.8+commit.97d65f2</option>*/}
									</select>
								</div>
								{/*<div className="mb-0.5 mt-3 break-words text-issue-dark">*/}
								<div className="mb-2 mt-5">
									<Text variant="body/medium" color="steel-dark">
										If this code is deployed using{' '}
										<Link
											variant="text"
											color="steel-darker"
											href={welldoneCodeHref}
											target="_blank"
											rel="noopener noreferrer"
										>
											<span className="underline">WELLDONE Code</span>
										</Link>{' '}
										and{' '}
										<Link
											variant="text"
											color="steel-darker"
											href={remixHref}
											target="_blank"
											rel="noopener noreferrer"
										>
											<span className="underline">remix plugin ( CODE BY WELLDONE STUDIO )</span>
										</Link>
										, you can proceed verification without uploading a file.
									</Text>
								</div>
								<Button
									variant="primary"
									size="md"
									disabled={isExecuteDisabled}
									loading={isLoadingWithoutFile}
									onClick={verifyWithoutFile}
								>
									Verify without file
								</Button>
								<Text variant="pBodySmall/medium" color="issue">
									{errMsgWithoutFile}
								</Text>

								<div className="mb-1 mt-7">
									<Text variant="body/medium" color="steel-dark">
										Otherwise You can proceed verification with uploading a compressed file.
									</Text>
								</div>
								<FileUpload value={files} maxFiles={1} onChange={onFileChange} />
								<div className="mb-1 ml-1 mt-2">
									<Text variant="body/medium" color="gray-100">
										1. Run this command &ldquo;zip -r your_source.zip .&rdquo; at the same directory
										path of &ldquo;Move.toml&rdquo;.
									</Text>
								</div>
								<div className="mb-2 ml-1">
									<Text variant="body/medium" color="gray-100">
										2. Drag the zip file above upload box.
									</Text>
								</div>
								<Button
									variant="primary"
									size="md"
									disabled={isExecuteDisabled || files.length === 0}
									loading={isLoadingWithFile}
									onClick={verifyWithFile}
								>
									Verify with a zip file
								</Button>
								<Text variant="pBodySmall/medium" color="issue">
									{errMsgWithFile}
								</Text>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default VerifyRegister;
