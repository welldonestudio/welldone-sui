// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useGetObject } from '@mysten/core';
import { LoadingIndicator } from '@mysten/ui';
import axios from 'axios';
import { type AxiosResponse } from 'axios';
import JSZip from 'jszip';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { type DataType, translate } from './ObjectResultType';
import PkgView from './views/PkgView';
import { TokenView } from './views/TokenView';
import { PageLayout } from '~/components/Layout/PageLayout';
import { ErrorBoundary } from '~/components/error-boundary/ErrorBoundary';
import { type VersionInfo } from '~/components/module/DependencyView';
import { type PackageFile } from '~/components/module/PkgModulesWrapper';
import { useNetwork } from '~/context';
import { Banner } from '~/ui/Banner';
import { PageHeader } from '~/ui/PageHeader';

const PACKAGE_TYPE_NAME = 'Move Package';

interface VerificationCheckReqDto {
	network: string;
	packageId: string;
}

interface VerificationCheckResDto {
	isVerified: boolean;
	verifiedSrcUrl: string;
}

function Fail({ objID }: { objID: string | undefined }) {
	return (
		<PageLayout
			content={
				<Banner variant="error" spacing="lg" fullWidth>
					Data could not be extracted on the following specified object ID: {objID}
				</Banner>
			}
		/>
	);
}

export function ObjectResult() {
	const [network] = useNetwork();

	const { id: objID } = useParams();
	const { data, isLoading, isError, isFetched } = useGetObject(objID!);
	const [packageFiles, setPackageFiles] = useState<PackageFile[]>([]);
	const [versionInfo, setVersionInfo] = useState<VersionInfo>();
	const [verified, setVerified] = useState<boolean>(false);

	useEffect(() => {
		console.log('@@@@@@ useEffect packageFiles', packageFiles, 'verified', verified);
		if (!data) {
			return;
		}
		const packageId = data.data?.objectId;

		async function verifyCheck() {
			const { status, data: verificationCheckResult } = await axios.get<
				VerificationCheckResDto,
				AxiosResponse<VerificationCheckResDto>,
				VerificationCheckReqDto
			>(`https://api.welldonestudio.io/compiler/sui/verifications`, {
				// todo
				params: {
					network: network.toLowerCase(),
					packageId: packageId,
				},
			});
			if (status !== 200) {
				return;
			}
			console.log('verificationCheckResult', verificationCheckResult);
			if (!verificationCheckResult.isVerified) {
				setVerified(false);
				setPackageFiles([]);
				return;
			}

			const { status: VerifiedSrcResStatus, data: blob } = await axios.get<Blob>(
				verificationCheckResult.verifiedSrcUrl,
				{
					responseType: 'blob',
				},
			);

			if (VerifiedSrcResStatus !== 200) {
				throw new Error('Network response was not ok');
			}

			new JSZip().loadAsync(blob).then((unzipped: JSZip) => {
				const filePromises: Promise<PackageFile>[] = [];
				unzipped.forEach((relativePath: string, file: JSZip.JSZipObject) => {
					if (!file.dir) {
						const filePromise = file.async('text').then(
							(content: string): PackageFile => ({
								relativePath: file.name,
								content: content,
							}),
						);
						filePromises.push(filePromise);
					}
				});

				Promise.all(filePromises).then((packageFiles) => {
					console.log('verified packageFiles', packageFiles);
					setPackageFiles(
						packageFiles.filter(
							(packageFile) =>
								!(
									packageFile.relativePath.includes('Move.toml') ||
									packageFile.relativePath.includes('Move.lock')
								),
						),
					);
					setVerified(verificationCheckResult.isVerified);
				});
			});
		}

		async function dependencyVersionCheck() {
			const { status, data } = await axios.get<VersionInfo>(
				`http://localhost:8000/verification/sui/dependency-version-check`,
				{
					params: {
						network: network.toLowerCase(),
						packageId: packageId,
					},
				},
			);
			if (status !== 200) {
				return;
			}
			setVersionInfo(data);
		}

		verifyCheck().then();
		dependencyVersionCheck().then();
	}, [verified, data]);

	if (isLoading) {
		return (
			<PageLayout
				content={
					<div className="flex w-full items-center justify-center">
						<LoadingIndicator text="Loading data" />
					</div>
				}
			/>
		);
	}

	if (isError) {
		return <Fail objID={objID} />;
	}

	// TODO: Handle status better NotExists, Deleted, Other
	if (data.error || (isFetched && !data)) {
		return <Fail objID={objID} />;
	}

	const resp = translate(data);
	const isPackage = resp.objType === PACKAGE_TYPE_NAME;

	return (
		<PageLayout
			content={
				<div className="mb-10">
					<PageHeader type={isPackage ? 'Package' : 'Object'} title={resp.id} />
					<ErrorBoundary>
						<div className="mt-10">
							{isPackage ? (
								<PkgView
									data={resp}
									packageFiles={packageFiles}
									verified={verified}
									setVerified={setVerified}
									setPackageFiles={setPackageFiles}
									versionInfo={versionInfo}
								/>
							) : (
								<TokenView data={data} />
							)}
						</div>
					</ErrorBoundary>
				</div>
			}
		/>
	);
}

export type { DataType };
