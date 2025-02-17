// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use clap::Parser;
use sui_single_node_benchmark::command::Command;
use sui_single_node_benchmark::execution::{
    benchmark_move_transactions, benchmark_simple_transfer,
};

#[tokio::main]
async fn main() {
    let _guard = telemetry_subscribers::TelemetryConfig::new()
        .with_log_level("off,sui_single_node_benchmark=info")
        .with_env()
        .init();

    let args = Command::parse();
    match args {
        Command::NoMove {
            tx_count,
            component,
        } => benchmark_simple_transfer(tx_count, component).await,
        Command::Move {
            tx_count,
            component,
            num_input_objects,
            num_dynamic_fields,
            computation,
        } => {
            benchmark_move_transactions(
                tx_count,
                component,
                num_input_objects,
                num_dynamic_fields,
                computation,
            )
            .await
        }
    }
}
