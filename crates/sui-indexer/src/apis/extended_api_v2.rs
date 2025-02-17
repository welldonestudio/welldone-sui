// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// TODO remove after the functions are implemented
#![allow(unused_variables)]
#![allow(dead_code)]

use crate::indexer_reader::IndexerReader;
use jsonrpsee::{core::RpcResult, RpcModule};
use sui_json_rpc::{
    api::{validate_limit, ExtendedApiServer, QUERY_MAX_RESULT_LIMIT_CHECKPOINTS},
    SuiRpcModule,
};
use sui_json_rpc_types::{
    AddressMetrics, CheckpointedObjectID, EpochInfo, EpochPage, MoveCallMetrics, NetworkMetrics,
    Page, QueryObjectsPage, SuiObjectResponseQuery,
};
use sui_open_rpc::Module;
use sui_types::sui_serde::BigInt;

pub(crate) struct ExtendedApiV2 {
    inner: IndexerReader,
}

impl ExtendedApiV2 {
    pub fn new(inner: IndexerReader) -> Self {
        Self { inner }
    }
}

#[async_trait::async_trait]
impl ExtendedApiServer for ExtendedApiV2 {
    async fn get_epochs(
        &self,
        cursor: Option<BigInt<u64>>,
        limit: Option<usize>,
        descending_order: Option<bool>,
    ) -> RpcResult<EpochPage> {
        let limit = validate_limit(limit, QUERY_MAX_RESULT_LIMIT_CHECKPOINTS)?;
        let mut epochs = self
            .inner
            .spawn_blocking(move |this| {
                this.get_epochs(
                    cursor.map(|x| *x),
                    limit + 1,
                    descending_order.unwrap_or(false),
                )
            })
            .await?;

        let has_next_page = epochs.len() > limit;
        epochs.truncate(limit);
        let next_cursor = epochs.last().map(|e| e.epoch);
        Ok(Page {
            data: epochs,
            next_cursor: next_cursor.map(|id| id.into()),
            has_next_page,
        })
    }

    async fn get_current_epoch(&self) -> RpcResult<EpochInfo> {
        let stored_epoch = self
            .inner
            .spawn_blocking(|this| this.get_latest_epoch_info_from_db())
            .await?;
        EpochInfo::try_from(stored_epoch).map_err(Into::into)
    }

    async fn query_objects(
        &self,
        query: SuiObjectResponseQuery,
        cursor: Option<CheckpointedObjectID>,
        limit: Option<usize>,
    ) -> RpcResult<QueryObjectsPage> {
        unimplemented!()
    }

    async fn get_network_metrics(&self) -> RpcResult<NetworkMetrics> {
        unimplemented!()
    }

    async fn get_move_call_metrics(&self) -> RpcResult<MoveCallMetrics> {
        unimplemented!()
    }

    async fn get_latest_address_metrics(&self) -> RpcResult<AddressMetrics> {
        unimplemented!()
    }

    async fn get_checkpoint_address_metrics(&self, checkpoint: u64) -> RpcResult<AddressMetrics> {
        unimplemented!()
    }

    async fn get_all_epoch_address_metrics(
        &self,
        descending_order: Option<bool>,
    ) -> RpcResult<Vec<AddressMetrics>> {
        unimplemented!()
    }

    async fn get_total_transactions(&self) -> RpcResult<BigInt<u64>> {
        unimplemented!()
    }
}

impl SuiRpcModule for ExtendedApiV2 {
    fn rpc(self) -> RpcModule<Self> {
        self.into_rpc()
    }

    fn rpc_doc_module() -> Module {
        sui_json_rpc::api::ExtendedApiOpenRpc::module_doc()
    }
}
