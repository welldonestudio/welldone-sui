// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Button, Text } from '@mysten/ui';
import axios, { type AxiosResponse } from 'axios';
import { type Dispatch, type SetStateAction, useState } from 'react';
import FileUpload from 'react-material-file-upload';

import { type ModuleType, type PackageFile } from '~/components/module/PkgModulesWrapper';
import { useNetwork } from '~/context';
import { Input } from '~/ui/Input';

interface VerifyRegisterProps {
	id?: string;
	modules?: ModuleType[];
	packageFiles: PackageFile[];
	verified: boolean;
	setVerified: Dispatch<SetStateAction<boolean>>;
}

interface VerificationSourceUploadReqDto {
	network: string;
	packageId: string;
	srcZipFile: File;
}

interface VerificationSourceUploadResDto {
	sourceFileId: string;
}

interface VerificationReqDto {
	network: string;
	packageId: string;
	sourceFileId: string;
}

interface VerificationResDto {
	isVerified: boolean;
	errMsg?: string;
}

function VerifyRegister({ id, modules, verified, setVerified }: VerifyRegisterProps) {
	const modulenames = modules?.map(([name]) => name);
	const [query] = useState('');
	const [version, setVersion] = useState<string>('v1.3.0');
	const [isLoadingWithFile, setIsLoadingWithFile] = useState<boolean>(false);
	const [errMsgWithFile, setErrMsgWithFile] = useState<string | undefined>('');
	const [files, setFiles] = useState<File[]>([]);
	const [verificationApiServer, setVerificationApiServer] = useState<string>(
		'https://api.welldonestudio.io/compiler/sui',
	);
	const [network] = useNetwork();
	const isExecuteDisabled = isLoadingWithFile || version === '' || files.length === 0;
	if (!modulenames) {
		return null;
	}

	const verifyWithFile = async () => {
		if (!id) {
			return;
		}
		setIsLoadingWithFile(true);
		try {
			const { status: sourcesResStatus, data: sourcesResData } = await axios.post<
				VerificationSourceUploadResDto,
				AxiosResponse<VerificationSourceUploadResDto>,
				VerificationSourceUploadReqDto
			>(
				`${verificationApiServer}/verifications/sources`,
				{
					network: network.toLowerCase(),
					packageId: id,
					srcZipFile: files[0],
				},
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Accept: 'application/json',
					},
				},
			);

			if (sourcesResStatus !== 201) {
				return;
			}

			const { status: verificationResStatus, data: verificationResData } = await axios.post<
				VerificationResDto,
				AxiosResponse<VerificationResDto>,
				VerificationReqDto
			>(`${verificationApiServer}/verifications`, {
				network: network.toLowerCase(),
				packageId: id,
				sourceFileId: sourcesResData.sourceFileId,
			});

			if (verificationResStatus !== 201) {
				return;
			}

			setVerified(verificationResData.isVerified);
			setErrMsgWithFile(verificationResData.errMsg);
		} catch (e: any) {
			console.error(e);
			setErrMsgWithFile(e.toString());
		} finally {
			setIsLoadingWithFile(false);
		}
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

	const onVerificationApiServerChange = (e: any) => {
		setVerificationApiServer(e.target.value);
	};

	return (
		<div className="flex flex-col gap-5 border-b border-gray-45 md:flex-row md:flex-nowrap">
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

									<div data-testid="inputs-card" />

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

								<div style={{ marginTop: '1em' }}>
									<Input
										label="Verification API URL"
										onChange={onVerificationApiServerChange}
										value={verificationApiServer}
										style={{ width: '40em' }}
									/>
								</div>
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
									disabled={isExecuteDisabled}
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
